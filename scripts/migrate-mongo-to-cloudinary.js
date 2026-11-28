const { loadEnvConfig } = require("@next/env");
const { MongoClient } = require("mongodb");
const { v2: cloudinary } = require("cloudinary");

loadEnvConfig(process.cwd(), false);

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "betroverse";
const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

if (!uri || !cloudName || !apiKey || !apiSecret) {
  console.error(
    "Missing MONGODB_URI or CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in .env.local"
  );
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const mediaCol = db.collection("media_assets");

  const assets = await mediaCol
    .find({ base64Data: { $exists: true, $ne: "" } })
    .toArray();

  console.log(`Found ${assets.length} MongoDB assets to migrate to Cloudinary...`);
  let migrated = 0;

  for (const asset of assets) {
    const buffer = Buffer.from(asset.base64Data, "base64");
    const rType =
      asset.type === "video" ? "video" : asset.type === "pdf" ? "raw" : "image";
    const cleanFolder = `betroverse/${(asset.folder || "general").replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const baseName = (asset.filename || asset.name || asset.id)
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .toLowerCase();

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: cleanFolder,
          public_id: `${baseName}-${Date.now()}`,
          resource_type: rType,
        },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(buffer);
    });

    let optUrl = result.secure_url;
    if (optUrl.includes("/image/upload/") && !optUrl.includes("f_auto")) {
      optUrl = optUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
    }

    await mediaCol.updateOne(
      { id: asset.id },
      {
        $set: {
          cloudinaryUrl: optUrl,
          cloudinaryPublicId: result.public_id,
          resourceType: result.resource_type,
          url: optUrl,
        },
        $unset: { base64Data: "" },
      }
    );
    migrated++;
    console.log(`[${migrated}/${assets.length}] Migrated ${asset.name} -> ${optUrl}`);
  }

  await client.close();
  console.log(`\nDone! Migrated ${migrated} assets to Cloudinary CDN.`);
})();
