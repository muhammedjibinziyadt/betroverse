import {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
} from "./cloudinary";
import { markMongoNetworkFailure } from "./mongodb";

const PENDING_MEDIA_QUERY = {
  base64Data: { $exists: true, $ne: "" },
  $or: [
    { cloudinaryUrl: { $exists: false } },
    { cloudinaryUrl: "" },
    { cloudinaryUrl: null },
  ],
};

let activeMigrationPromise = null;
let lastAutoCheckAt = 0;

/**
 * Migrate all MongoDB base64Data media assets that do not yet have a Cloudinary URL
 * in concurrent batches (single-flight locked so duplicate triggers never collide).
 */
export async function migratePendingMediaToCloudinary(
  db,
  { concurrency = 5 } = {}
) {
  if (!isCloudinaryConfigured() || !db) {
    return {
      success: false,
      skipped: true,
      migrated: 0,
      failed: 0,
      remaining: 0,
    };
  }

  if (activeMigrationPromise) {
    return activeMigrationPromise;
  }

  activeMigrationPromise = (async () => {
    const mediaCol = db.collection("media_assets");
    const assetsToMigrate = await mediaCol
      .find(PENDING_MEDIA_QUERY)
      .toArray();

    if (assetsToMigrate.length === 0) {
      return {
        success: true,
        migrated: 0,
        failed: 0,
        totalPending: 0,
        remaining: 0,
        message: "All media assets are already synced with Cloudinary CDN.",
      };
    }

    let migratedCount = 0;
    let failedCount = 0;
    const errors = [];

    for (let i = 0; i < assetsToMigrate.length; i += concurrency) {
      const batch = assetsToMigrate.slice(i, i + concurrency);
      const settled = await Promise.allSettled(
        batch.map(async (asset) => {
          const buffer = Buffer.from(asset.base64Data, "base64");
          const rType =
            asset.type === "video"
              ? "video"
              : asset.type === "pdf"
                ? "raw"
                : "image";

          const uploaded = await uploadBufferToCloudinary(buffer, {
            folder: asset.folder || "general",
            filename: asset.filename || asset.name || asset.id,
            resourceType: rType,
          });

          await mediaCol.updateOne(
            { id: asset.id },
            {
              $set: {
                cloudinaryUrl: uploaded.url,
                cloudinaryPublicId: uploaded.publicId,
                resourceType: uploaded.resourceType,
                url: uploaded.url,
              },
              $unset: { base64Data: "" },
            }
          );

          return asset.id;
        })
      );

      settled.forEach((res, idx) => {
        if (res.status === "fulfilled") {
          migratedCount++;
        } else {
          failedCount++;
          const asset = batch[idx];
          errors.push({
            id: asset?.id,
            name: asset?.name,
            error: res.reason?.message || "Upload failed",
          });
        }
      });
    }

    const remaining = await mediaCol.countDocuments(PENDING_MEDIA_QUERY);

    return {
      success: failedCount === 0,
      migrated: migratedCount,
      failed: failedCount,
      totalPending: assetsToMigrate.length,
      remaining,
      errors,
      message:
        migratedCount > 0
          ? `Synced ${migratedCount} asset(s) to Cloudinary CDN and freed MongoDB storage.`
          : "No pending assets required migration.",
    };
  })();

  try {
    return await activeMigrationPromise;
  } finally {
    activeMigrationPromise = null;
  }
}

/**
 * Trigger a lightweight background sync when Cloudinary is configured
 * and unmigrated MongoDB media exists (throttled and non-blocking).
 */
export function scheduleAutoCloudinarySync(db) {
  if (!isCloudinaryConfigured() || !db || activeMigrationPromise) {
    return;
  }

  const now = Date.now();
  if (now - lastAutoCheckAt < 10000) {
    return;
  }
  lastAutoCheckAt = now;

  db.collection("media_assets")
    .countDocuments(PENDING_MEDIA_QUERY)
    .then((pendingCount) => {
      if (pendingCount > 0) {
        return migratePendingMediaToCloudinary(db, { concurrency: 5 });
      }
      return null;
    })
    .catch((err) => {
      if (!markMongoNetworkFailure(err)) {
        console.error("[Cloudinary AutoSync] Background sync error:", err?.message || err);
      }
    });
}

/**
 * Compute live media & Cloudinary CDN sync metrics.
 */
export async function getMediaSyncStats(db) {
  const configured = isCloudinaryConfigured();
  if (!db) {
    return {
      total: 0,
      cloudinaryCount: 0,
      pendingCount: 0,
      autoSyncActive: configured,
      syncingNow: Boolean(activeMigrationPromise),
    };
  }

  try {
    const mediaCol = db.collection("media_assets");
    const [total, cloudinaryCount, pendingCount] = await Promise.all([
      mediaCol.countDocuments({}),
      mediaCol.countDocuments({
        cloudinaryUrl: { $exists: true, $nin: ["", null] },
      }),
      mediaCol.countDocuments(PENDING_MEDIA_QUERY),
    ]);

    if (configured && pendingCount > 0 && !activeMigrationPromise) {
      scheduleAutoCloudinarySync(db);
    }

    return {
      total,
      cloudinaryCount,
      pendingCount,
      autoSyncActive: configured,
      syncingNow: Boolean(activeMigrationPromise),
    };
  } catch (err) {
    markMongoNetworkFailure(err);
    return {
      total: 0,
      cloudinaryCount: 0,
      pendingCount: 0,
      autoSyncActive: configured,
      syncingNow: false,
      offlineFallback: true,
    };
  }
}
