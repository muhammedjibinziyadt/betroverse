import { v2 as cloudinary } from "cloudinary";

function getEnvCreds() {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();
  return { cloudName, apiKey, apiSecret };
}

export function isCloudinaryConfigured() {
  const { cloudName, apiKey, apiSecret } = getEnvCreds();
  return Boolean(cloudName && apiKey && apiSecret);
}

function getConfiguredCloudinary() {
  const { cloudName, apiKey, apiSecret } = getEnvCreds();
  if (!cloudName || !apiKey || !apiSecret) return null;
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return cloudinary;
}

export function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/image/upload/") && !url.includes("f_auto")) {
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
  }
  return url;
}

export function generateUploadSignature({ folder = "general" } = {}) {
  const cld = getConfiguredCloudinary();
  if (!cld) return null;

  const { cloudName, apiKey, apiSecret } = getEnvCreds();
  const timestamp = Math.round(Date.now() / 1000);
  const cleanFolder = `betroverse/${String(folder || "general").replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const paramsToSign = {
    folder: cleanFolder,
    timestamp,
  };

  const signature = cld.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    configured: true,
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder: cleanFolder,
  };
}

export async function uploadBufferToCloudinary(
  buffer,
  { folder = "general", filename = "asset", resourceType = "auto" } = {}
) {
  const cld = getConfiguredCloudinary();
  if (!cld) throw new Error("Cloudinary is not configured");

  const cleanFolder = `betroverse/${String(folder || "general").replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const publicId = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .toLowerCase();

  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      {
        folder: cleanFolder,
        public_id: `${publicId}-${Date.now()}`,
        resource_type: resourceType,
        overwrite: false,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: optimizeCloudinaryUrl(result.secure_url),
          rawUrl: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          bytes: result.bytes,
          format: result.format,
        });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(items = []) {
  const cld = getConfiguredCloudinary();
  if (!cld || !Array.isArray(items) || items.length === 0) return { deleted: 0 };

  const byType = { image: [], video: [], raw: [] };
  for (const item of items) {
    const pubId =
      typeof item === "string"
        ? item
        : item?.cloudinaryPublicId || item?.public_id;
    if (!pubId) continue;
    const rType =
      item?.resourceType ||
      (item?.type === "video" ? "video" : item?.type === "pdf" ? "raw" : "image");
    if (byType[rType]) byType[rType].push(pubId);
    else byType.image.push(pubId);
  }

  let deleted = 0;
  for (const [rType, ids] of Object.entries(byType)) {
    for (let i = 0; i < ids.length; i += 100) {
      const chunk = ids.slice(i, i + 100);
      try {
        await cld.api.delete_resources(chunk, { resource_type: rType });
        deleted += chunk.length;
      } catch (err) {
        console.warn(`[Cloudinary] Delete warning (${rType}):`, err.message);
      }
    }
  }
  return { deleted };
}
