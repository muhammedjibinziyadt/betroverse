
import fs from "fs";
import path from "path";
import {
  getDatabase,
  isMongoConfigured,
  markMongoNetworkFailure,
} from "./mongodb";
import { isCloudinaryConfigured } from "./cloudinary";
import { scheduleAutoCloudinarySync, getMediaSyncStats } from "./media-sync";
import { hashPassword } from "./auth";
import seedProjects from "../data/seed-projects.json";
import seedBrands from "../data/seed-brands.json";

const STORE_DIR = process.env.VERCEL
  ? "/tmp/betroverse-store"
  : path.join(process.cwd(), ".betro-store");

const DEFAULT_ADMIN_EMAIL = "admin@gmail.in";

function getDefaultAdminUsername() {
  return (
    process.env.ADMIN_DEFAULT_USERNAME ||
    DEFAULT_ADMIN_EMAIL
  ).trim().toLowerCase();
}

function getDefaultAdminPassword() {
  const password = process.env.ADMIN_DEFAULT_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_DEFAULT_PASSWORD is not configured");
  }

  return password;
}

function ensureStoreDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

function readLocalCollection(name, defaultVal = []) {
  ensureStoreDir();

  const filePath = path.join(STORE_DIR, `${name}.json`);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2));
    return defaultVal;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return defaultVal;
  }
}

function writeLocalCollection(name, data) {
  try {
    ensureStoreDir();

    const filePath = path.join(STORE_DIR, `${name}.json`);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch { }
}

async function withMongoResilience(mongoOp, fallbackOp) {
  const db = await getDatabase();
  if (db) {
    try {
      return await mongoOp(db);
    } catch (err) {
      if (markMongoNetworkFailure(err)) {
        return fallbackOp();
      }
      throw err;
    }
  }
  return fallbackOp();
}

let mongoSeededOnce = false;

async function ensureSeededMongo(db) {
  if (mongoSeededOnce) return;
  const usersCol = db.collection("users");

  const defaultUsername = getDefaultAdminUsername();
  const defaultPassword = getDefaultAdminPassword();

  // Find existing default admin by username or email.
  const existingAdmin = await usersCol.findOne({
    $or: [
      { username: defaultUsername },
      { email: defaultUsername },
      { email: DEFAULT_ADMIN_EMAIL },
    ],
  });

  if (!existingAdmin) {
    const hashed = await hashPassword(defaultPassword);

    await usersCol.insertOne({
      username: defaultUsername,
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: hashed,
      role: "superadmin",
      createdAt: new Date().toISOString(),
    });
  } else {
    // Update existing default admin without deleting other users.
    await usersCol.updateOne(
      { _id: existingAdmin._id },
      {
        $set: {
          username: defaultUsername,
          email: DEFAULT_ADMIN_EMAIL,
          role: "superadmin",
          updatedAt: new Date().toISOString(),
        },
      }
    );
  }

  // Seed portfolio projects only when collection is empty.
  const projCol = db.collection("portfolio_projects");
  const projCount = await projCol.countDocuments();

  if (
    projCount === 0 &&
    Array.isArray(seedProjects) &&
    seedProjects.length > 0
  ) {
    await projCol.insertMany(seedProjects.map((p) => ({ ...p })));
  }

  // Seed brand logos only when collection is empty.
  const brandsCol = db.collection("brand_logos");
  const brandCount = await brandsCol.countDocuments();

  if (
    brandCount === 0 &&
    Array.isArray(seedBrands) &&
    seedBrands.length > 0
  ) {
    await brandsCol.insertMany(seedBrands.map((b) => ({ ...b })));
  }

  mongoSeededOnce = true;
}

async function ensureSeededLocal() {
  const users = readLocalCollection("users", []);

  const defaultUsername = getDefaultAdminUsername();
  const defaultPassword = getDefaultAdminPassword();

  const existingAdmin = users.find(
    (u) =>
      u.username === defaultUsername ||
      u.email === defaultUsername ||
      u.email === DEFAULT_ADMIN_EMAIL
  );

  if (!existingAdmin) {
    const hashed = await hashPassword(defaultPassword);

    users.push({
      id: "user-admin-1",
      username: defaultUsername,
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: hashed,
      role: "superadmin",
      createdAt: new Date().toISOString(),
    });
  } else {
    existingAdmin.username = defaultUsername;
    existingAdmin.email = DEFAULT_ADMIN_EMAIL;
    existingAdmin.role = "superadmin";
    existingAdmin.updatedAt = new Date().toISOString();
  }

  writeLocalCollection("users", users);

  const projectsFile = path.join(STORE_DIR, "portfolio_projects.json");

  if (!fs.existsSync(projectsFile)) {
    writeLocalCollection("portfolio_projects", seedProjects);
  }

  const brandsFile = path.join(STORE_DIR, "brand_logos.json");

  if (!fs.existsSync(brandsFile)) {
    writeLocalCollection("brand_logos", seedBrands);
  }
}

// ======================= PROJECTS =======================

export async function getAllProjects({ includeDrafts = true } = {}) {
  return withMongoResilience(
    async (db) => {
      await ensureSeededMongo(db);

      const all = await db
        .collection("portfolio_projects")
        .find({}, { projection: { _id: 0 } })
        .sort({ sort_order: 1 })
        .toArray();

      if (all.length > 0) {
        writeLocalCollection("portfolio_projects", all);
      }

      if (!includeDrafts) {
        return all.filter((p) => (p.status || "published") !== "draft");
      }
      return all;
    },
    async () => {
      await ensureSeededLocal();

      let list = readLocalCollection("portfolio_projects", seedProjects);

      if (!includeDrafts) {
        list = list.filter((p) => (p.status || "published") !== "draft");
      }

      return list.sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
    }
  );
}

export async function getProjectBySlugOrId(slugOrId) {
  const list = await getAllProjects({ includeDrafts: true });
  const target = (slugOrId || "").toLowerCase();

  return (
    list.find(
      (p) =>
        (p.slug && p.slug.toLowerCase() === target) ||
        (p.id && p.id.toLowerCase() === target)
    ) || null
  );
}

export async function upsertProject(projectData) {
  const clean = { ...projectData };
  delete clean._id;

  if (!clean.id) {
    clean.id = "cs-" + Date.now();
  }

  if (!clean.slug) {
    clean.slug = (clean.companyName || "project")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  clean.updatedAt = new Date().toISOString();

  const db = await getDatabase();

  if (db) {
    await ensureSeededMongo(db);

    await db
      .collection("portfolio_projects")
      .updateOne(
        { id: clean.id },
        { $set: clean },
        { upsert: true }
      );

    return clean;
  }

  await ensureSeededLocal();

  const list = readLocalCollection("portfolio_projects", seedProjects);

  const idx = list.findIndex(
    (p) => p.id === clean.id || p.slug === clean.slug
  );

  if (idx !== -1) {
    list[idx] = { ...list[idx], ...clean };
  } else {
    clean.sort_order =
      typeof clean.sort_order === "number"
        ? clean.sort_order
        : list.length;

    list.push(clean);
  }

  writeLocalCollection("portfolio_projects", list);

  return clean;
}

export async function deleteProjectById(id) {
  const db = await getDatabase();

  if (db) {
    await db
      .collection("portfolio_projects")
      .deleteOne({
        $or: [{ id }, { slug: id }],
      });

    return { success: true };
  }

  await ensureSeededLocal();

  const list = readLocalCollection("portfolio_projects", seedProjects);

  const filtered = list.filter(
    (p) => p.id !== id && p.slug !== id
  );

  writeLocalCollection("portfolio_projects", filtered);

  return { success: true };
}

export async function updateProjectsOrder(orderedIds) {
  const db = await getDatabase();

  if (db) {
    const col = db.collection("portfolio_projects");

    const ops = orderedIds.map((id, idx) => ({
      updateOne: {
        filter: { id },
        update: {
          $set: {
            sort_order: idx,
            sortOrder: idx,
            display_order: idx,
            displayOrder: idx,
          },
        },
      },
    }));

    if (ops.length > 0) {
      await col.bulkWrite(ops);
    }

    return { success: true };
  }

  await ensureSeededLocal();

  const list = readLocalCollection("portfolio_projects", seedProjects);
  const orderMap = new Map(
    orderedIds.map((id, idx) => [id, idx])
  );

  list.forEach((p) => {
    if (orderMap.has(p.id)) {
      const idx = orderMap.get(p.id);

      p.sort_order = idx;
      p.sortOrder = idx;
      p.display_order = idx;
      p.displayOrder = idx;
    }
  });

  list.sort(
    (a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)
  );

  writeLocalCollection("portfolio_projects", list);

  return { success: true };
}

// ======================= BRANDS =======================

export async function getAllBrands() {
  return withMongoResilience(
    async (db) => {
      await ensureSeededMongo(db);

      const brands = await db
        .collection("brand_logos")
        .find({}, { projection: { _id: 0 } })
        .sort({ order: 1 })
        .toArray();

      if (brands.length > 0) {
        writeLocalCollection("brand_logos", brands);
      }
      return brands;
    },
    async () => {
      await ensureSeededLocal();

      const list = readLocalCollection("brand_logos", seedBrands);

      return list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    }
  );
}

export async function saveAllBrands(brandsList) {
  const cleaned = brandsList.map((b, i) => {
    const copy = { ...b };
    delete copy._id;

    copy.order =
      typeof copy.order === "number" ? copy.order : i + 1;

    return copy;
  });

  const db = await getDatabase();

  if (db) {
    const col = db.collection("brand_logos");

    await col.deleteMany({});

    if (cleaned.length > 0) {
      await col.insertMany(cleaned);
    }

    return cleaned;
  }

  writeLocalCollection("brand_logos", cleaned);

  return cleaned;
}

export async function deleteBrandById(id) {
  const db = await getDatabase();

  if (db) {
    await db.collection("brand_logos").deleteOne({ id });
    return { success: true };
  }

  await ensureSeededLocal();

  const list = readLocalCollection("brand_logos", seedBrands);

  writeLocalCollection(
    "brand_logos",
    list.filter((b) => b.id !== id)
  );

  return { success: true };
}

// ======================= MEDIA ASSETS =======================

export async function getAllMedia() {
  return withMongoResilience(
    async (db) => {
      scheduleAutoCloudinarySync(db);
      const items = await db
        .collection("media_assets")
        .find({}, { projection: { _id: 0, base64Data: 0 } })
        .sort({ createdAt: -1 })
        .toArray();

      if (items.length > 0) {
        writeLocalCollection("media_assets", items);
      }
      return items;
    },
    async () => {
      await ensureSeededLocal();

      const list = readLocalCollection("media_assets", []);

      return list.map(({ base64Data, ...rest }) => rest);
    }
  );
}

export async function getMediaById(idOrFilename) {
  const clean = decodeURIComponent(idOrFilename || "").trim();
  return withMongoResilience(
    async (db) => {
      const asset = await db.collection("media_assets").findOne(
        { $or: [{ id: clean }, { filename: clean }, { storage_path: clean }] },
        { projection: { _id: 0 } }
      );
      if (asset && !asset.cloudinaryUrl && asset.base64Data) {
        scheduleAutoCloudinarySync(db);
      }
      return asset;
    },
    async () => {
      const list = readLocalCollection("media_assets", []);

      return (
        list.find(
          (m) => m.id === clean || m.filename === clean || m.storage_path === clean
        ) || null
      );
    }
  );
}

export async function saveMediaAsset(asset) {
  const clean = { ...asset };
  delete clean._id;

  if (!clean.id) {
    clean.id =
      "media-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 1000);
  }

  if (!clean.createdAt) {
    clean.createdAt = new Date().toISOString();
  }

  const db = await getDatabase();

  if (db) {
    await db
      .collection("media_assets")
      .updateOne(
        { id: clean.id },
        { $set: clean },
        { upsert: true }
      );

    if (clean.base64Data && !clean.cloudinaryUrl) {
      scheduleAutoCloudinarySync(db);
    }

    const { base64Data, ...meta } = clean;

    return meta;
  }

  await ensureSeededLocal();

  const list = readLocalCollection("media_assets", []);

  const idx = list.findIndex((m) => m.id === clean.id);

  if (idx !== -1) {
    list[idx] = clean;
  } else {
    list.unshift(clean);
  }

  writeLocalCollection("media_assets", list);

  const { base64Data, ...meta } = clean;

  return meta;
}

export async function deleteMediaByIds(ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { success: true, count: 0 };
  }

  const db = await getDatabase();

  if (db) {
    const res = await db
      .collection("media_assets")
      .deleteMany({ id: { $in: ids } });

    return {
      success: true,
      count: res.deletedCount || ids.length,
    };
  }

  await ensureSeededLocal();

  const list = readLocalCollection("media_assets", []);
  const idSet = new Set(ids);
  const next = list.filter((m) => !idSet.has(m.id));

  writeLocalCollection("media_assets", next);

  return {
    success: true,
    count: list.length - next.length,
  };
}

export async function deleteAllMediaAssets() {
  const db = await getDatabase();

  if (db) {
    const res = await db
      .collection("media_assets")
      .deleteMany({});

    return {
      success: true,
      count: res.deletedCount || 0,
    };
  }

  await ensureSeededLocal();

  const list = readLocalCollection("media_assets", []);
  const count = list.length;

  writeLocalCollection("media_assets", []);

  return { success: true, count };
}

// ======================= USERS & AUTH =======================

export async function findUser(identifier) {
  const cleanId = (identifier || "").trim().toLowerCase();

  return withMongoResilience(
    async (db) => {
      await ensureSeededMongo(db);

      return db.collection("users").findOne({
        $or: [{ username: cleanId }, { email: cleanId }],
      });
    },
    async () => {
      await ensureSeededLocal();

      const users = readLocalCollection("users", []);

      return (
        users.find(
          (u) =>
            (u.username && u.username.toLowerCase() === cleanId) ||
            (u.email && u.email.toLowerCase() === cleanId)
        ) || null
      );
    }
  );
}

export async function listAllUsers() {
  return withMongoResilience(
    async (db) => {
      await ensureSeededMongo(db);

      return db
        .collection("users")
        .find({}, { projection: { _id: 0, passwordHash: 0 } })
        .toArray();
    },
    async () => {
      await ensureSeededLocal();

      const users = readLocalCollection("users", []);

      return users.map(({ passwordHash, ...rest }) => rest);
    }
  );
}

export async function upsertAdminUser({
  username,
  email,
  password,
  role = "admin",
}) {
  const cleanUsername = (username || "")
    .trim()
    .toLowerCase();

  if (!cleanUsername) {
    throw new Error("Username is required");
  }

  const passwordHash = password
    ? await hashPassword(password)
    : null;

  const db = await getDatabase();

  if (db) {
    await ensureSeededMongo(db);

    const existing = await db
      .collection("users")
      .findOne({ username: cleanUsername });

    const updateDoc = {
      username: cleanUsername,
      email: (email || `${cleanUsername}@betroverse.in`)
        .trim()
        .toLowerCase(),
      role:
        existing?.role === "superadmin"
          ? "superadmin"
          : role,
      updatedAt: new Date().toISOString(),
    };

    if (passwordHash) {
      updateDoc.passwordHash = passwordHash;
    }

    if (!existing) {
      updateDoc.createdAt = new Date().toISOString();
    }

    await db.collection("users").updateOne(
      { username: cleanUsername },
      { $set: updateDoc },
      { upsert: true }
    );

    const { passwordHash: _, ...safeUser } = updateDoc;

    return safeUser;
  }

  await ensureSeededLocal();

  const users = readLocalCollection("users", []);

  const idx = users.findIndex(
    (u) => u.username === cleanUsername
  );

  if (idx !== -1) {
    if (email) {
      users[idx].email = email.trim().toLowerCase();
    }

    if (passwordHash) {
      users[idx].passwordHash = passwordHash;
    }

    users[idx].updatedAt = new Date().toISOString();

    writeLocalCollection("users", users);

    const { passwordHash: _, ...safe } = users[idx];

    return safe;
  }

  if (!passwordHash) {
    throw new Error("Password is required for new user");
  }

  const newUser = {
    id: "user-" + Date.now(),
    username: cleanUsername,
    email: (email || `${cleanUsername}@betroverse.in`)
      .trim()
      .toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeLocalCollection("users", users);

  const { passwordHash: _, ...safe } = newUser;

  return safe;
}

export async function deleteAdminUser(username) {
  const clean = (username || "").trim().toLowerCase();

  if (clean === getDefaultAdminUsername()) {
    throw new Error("Cannot delete primary admin account");
  }

  const db = await getDatabase();

  if (db) {
    await db.collection("users").deleteOne({
      username: clean,
    });

    return { success: true };
  }

  await ensureSeededLocal();

  const users = readLocalCollection("users", []);

  writeLocalCollection(
    "users",
    users.filter((u) => u.username !== clean)
  );

  return { success: true };
}

// ======================= LEADS =======================

export async function getAllLeads() {
  return withMongoResilience(
    async (db) =>
      db
        .collection("leads")
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray(),
    async () => {
      await ensureSeededLocal();

      return readLocalCollection("leads", []);
    }
  );
}

export async function addLead(lead) {
  const entry = {
    id: "lead-" + Date.now(),
    ...lead,
    status: lead.status || "new",
    createdAt: new Date().toISOString(),
  };

  const db = await getDatabase();

  if (db) {
    await db.collection("leads").insertOne({ ...entry });
    return entry;
  }

  await ensureSeededLocal();

  const list = readLocalCollection("leads", []);

  list.unshift(entry);

  writeLocalCollection("leads", list);

  return entry;
}

export async function getMediaStats() {
  const db = await getDatabase();
  const stats = await getMediaSyncStats(db);
  if ((!db || stats.offlineFallback) && stats.total === 0) {
    const localList = readLocalCollection("media_assets", []);
    if (localList.length > 0) {
      return {
        ...stats,
        total: localList.length,
        cloudinaryCount: localList.filter((m) => Boolean(m.cloudinaryUrl)).length,
        pendingCount: localList.filter((m) => Boolean(m.base64Data) && !m.cloudinaryUrl).length,
        offlineFallback: true,
      };
    }
  }
  return stats;
}

export function getDbStatusInfo() {
  return {
    engine: isMongoConfigured()
      ? "MongoDB Atlas (Cloud)"
      : "Local JSON Fallback (Set MONGODB_URI in .env.local)",

    mongoConfigured: isMongoConfigured(),
    cloudinaryConfigured: isCloudinaryConfigured(),

    dbName: process.env.MONGODB_DB || "betroverse",
  };
}
