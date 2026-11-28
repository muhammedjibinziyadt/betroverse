import dns from "dns";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "betroverse";

let offlineUntil = 0;

function ensureDnsServers() {
  if (global._betroDnsConfigured) return;
  global._betroDnsConfigured = true;
  try {
    const current = dns.getServers();
    const merged = Array.from(new Set([...current, "8.8.8.8", "1.1.1.1"]));
    dns.setServers(merged);
  } catch { }
}

let fallbackResolver = null;
function getFallbackResolver() {
  if (!fallbackResolver) {
    fallbackResolver = new dns.Resolver();
    try {
      fallbackResolver.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch { }
  }
  return fallbackResolver;
}

/**
 * Custom DNS lookup: tries OS default DNS first, and if carrier/hotspot DNS
 * returns ENOTFOUND / EAI_AGAIN, automatically falls back to Google/Cloudflare DNS.
 */
function resilientLookup(hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  dns.lookup(hostname, options, (err, address, family) => {
    if (!err) return callback(null, address, family);
    getFallbackResolver().resolve4(hostname, (rErr, addresses) => {
      if (rErr || !addresses || addresses.length === 0) {
        return callback(err);
      }
      if (options && options.all) {
        return callback(
          null,
          addresses.map((a) => ({ address: a, family: 4 }))
        );
      }
      return callback(null, addresses[0], 4);
    });
  });
}

export function isMongoConfigured() {
  return Boolean(uri && uri.trim().length > 10 && uri.startsWith("mongodb"));
}

export function isMongoNetworkError(err) {
  if (!err) return false;
  const msg = String(err.message || "");
  const name = String(err.name || "");
  return (
    name.includes("MongoNetwork") ||
    name.includes("MongoServerSelection") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("EAI_AGAIN") ||
    msg.includes("ReplicaSetNoPrimary")
  );
}

export function markMongoNetworkFailure(err) {
  if (!isMongoNetworkError(err)) return false;
  offlineUntil = Date.now() + 10000; // 10s fast-fail cooldown so requests don't stall
  if (global._mongoClientInstance) {
    try {
      global._mongoClientInstance.close().catch(() => { });
    } catch { }
    global._mongoClientInstance = null;
  }
  global._mongoClientPromise = null;
  global._mongoClientPromiseProd = null;
  console.warn("[MongoDB] Connection lost, using local fallback briefly:", err.message);
  return true;
}

export async function getMongoClient() {
  if (!isMongoConfigured()) return null;
  if (Date.now() < offlineUntil) return null;

  ensureDnsServers();

  try {
    const clientOpts = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 4500,
      connectTimeoutMS: 4500,
      lookup: resilientLookup,
    };

    if (process.env.NODE_ENV === "development") {
      if (!global._mongoClientPromise) {
        const client = new MongoClient(uri, clientOpts);
        global._mongoClientInstance = client;
        global._mongoClientPromise = client.connect().catch((err) => {
          global._mongoClientPromise = null;
          global._mongoClientInstance = null;
          markMongoNetworkFailure(err);
          throw err;
        });
      }
      return await global._mongoClientPromise;
    } else {
      if (!global._mongoClientPromiseProd) {
        const client = new MongoClient(uri, clientOpts);
        global._mongoClientInstance = client;
        global._mongoClientPromiseProd = client.connect().catch((err) => {
          global._mongoClientPromiseProd = null;
          global._mongoClientInstance = null;
          markMongoNetworkFailure(err);
          throw err;
        });
      }
      return await global._mongoClientPromiseProd;
    }
  } catch (err) {
    markMongoNetworkFailure(err);
    return null;
  }
}

export async function getDatabase() {
  try {
    const client = await getMongoClient();
    if (!client) return null;
    return client.db(dbName);
  } catch (err) {
    markMongoNetworkFailure(err);
    return null;
  }
}
