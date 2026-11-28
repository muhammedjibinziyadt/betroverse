/**
 * Betroverse - MongoDB API Client Adapter (window.BetroDB)
 * Bridges the full Betroverse Admin CMS seamlessly to Next.js API Routes & MongoDB Atlas.
 */
(function (window) {
  "use strict";

  const safeStorage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, val) {
      try {
        localStorage.setItem(
          key,
          typeof val === "string" ? val : JSON.stringify(val)
        );
      } catch {}
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch {}
    },
  };

  function normalizeUrl(pathOrUrl) {
    if (!pathOrUrl || typeof pathOrUrl !== "string") return pathOrUrl || "";
    const trimmed = pathOrUrl.trim();
    if (trimmed.startsWith("images/")) return "/" + trimmed;
    return trimmed;
  }

  const BetroDB = {
    isConfigured() {
      return true;
    },

    async ensureInit() {
      return true;
    },

    getConfig() {
      return {
        isConfigured: true,
        source: "Next.js MongoDB API",
        mongodbUrl: "MongoDB Atlas (Next.js Serverless)",
        storageBucket: "mongodb-media",
      };
    },

    async testConnection() {
      const start = Date.now();
      try {
        const res = await fetch("/api/status");
        const latency = Date.now() - start;
        if (!res.ok) {
          return { success: false, error: `HTTP ${res.status}`, latency };
        }
        const data = await res.json();
        return {
          success: Boolean(data.healthy),
          latency,
          engine: data.engine,
          mongoConfigured: data.mongoConfigured,
          cloudinaryConfigured: data.cloudinaryConfigured,
          mediaStats: data.mediaStats || null,
          counts: data.counts,
        };
      } catch (err) {
        return { success: false, error: err.message, latency: Date.now() - start };
      }
    },

    broadcastChange(type, payload) {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const ch = new BroadcastChannel("betro_portfolio_sync");
          ch.postMessage({ type, data: payload, timestamp: Date.now() });
          ch.close();
        } catch {}
      }
      try {
        window.dispatchEvent(
          new CustomEvent("betro_db_updated", {
            detail: { type, data: payload },
          })
        );
      } catch {}
    },

    // ==================== AUTH ====================
    async getAuthSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return null;
        const data = await res.json();
        if (data.authenticated && data.user) {
          return { user: data.user, db: data.db };
        }
        return null;
      } catch {
        return null;
      }
    },

    async signInWithPassword(usernameOrEmail, password) {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameOrEmail, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid username or password");
      }
      return data;
    },

    async signOut() {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {}
      safeStorage.remove("betro_admin_logged_in");
      safeStorage.remove("betro_admin_email");
    },

    // ==================== CASE STUDIES ====================
    async getCaseStudies(options = {}) {
      const includeDrafts = options.includeDrafts !== false;
      try {
        const res = await fetch(`/api/portfolio?includeDrafts=${includeDrafts}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const projects = Array.isArray(data.projects) ? data.projects : [];
        safeStorage.set("betro_casestudies", projects);
        safeStorage.set("betro_casestudies_cache", projects);
        return projects;
      } catch (err) {
        console.warn("[BetroDB] Portfolio fetch fallback:", err);
        const raw =
          safeStorage.get("betro_casestudies") ||
          safeStorage.get("betro_casestudies_cache");
        if (raw) {
          try {
            return JSON.parse(raw);
          } catch {}
        }
        return [];
      }
    },

    async saveCaseStudy(csData) {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(csData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || `HTTP ${res.status}` };
      }
      this.broadcastChange("CASE_STUDY_UPDATED", data.data || csData);
      return { success: true, data: data.data || csData };
    },

    async deleteCaseStudy(id) {
      const res = await fetch(`/api/portfolio/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || `HTTP ${res.status}` };
      }
      this.broadcastChange("CASE_STUDY_DELETED", { id });
      return { success: true };
    },

    async updateCaseStudiesOrder(orderedList) {
      const orderedIds = Array.isArray(orderedList)
        ? orderedList.map((p) => (typeof p === "string" ? p : p.id)).filter(Boolean)
        : [];
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error || `HTTP ${res.status}` };
      }
      this.broadcastChange("CASE_STUDY_UPDATED", { orderedIds });
      return { success: true };
    },

    // ==================== BRAND LOGOS ====================
    async getBrandLogos() {
      try {
        const res = await fetch("/api/brands");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const brands = Array.isArray(data.brands) ? data.brands : [];
        safeStorage.set("betro_brands", brands);
        return brands;
      } catch (err) {
        console.warn("[BetroDB] Brands fetch notice:", err);
        const raw = safeStorage.get("betro_brands");
        if (raw) {
          try {
            return JSON.parse(raw);
          } catch {}
        }
        return null;
      }
    },

    async saveBrandLogos(brandsList) {
      try {
        safeStorage.set("betro_brands", brandsList);
        const res = await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brands: brandsList }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || `HTTP ${res.status}` };
        }
        this.broadcastChange("brands_updated", brandsList);
        return { success: true, brands: data.brands };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    async deleteBrandLogo(brandId) {
      const res = await fetch(
        `/api/brands?id=${encodeURIComponent(brandId)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error || `HTTP ${res.status}` };
      }
      this.broadcastChange("brands_updated", { deletedId: brandId });
      return { success: true };
    },

    // ==================== MEDIA LIBRARY ====================
    async getAllMediaAssets() {
      try {
        const res = await fetch("/api/media");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const assets = Array.isArray(data.assets) ? data.assets : [];
        safeStorage.set("betro_media_assets", assets);
        return assets;
      } catch (err) {
        console.warn("[BetroDB] Media fetch notice:", err);
        const raw = safeStorage.get("betro_media_assets");
        if (raw) {
          try {
            return JSON.parse(raw);
          } catch {}
        }
        return [];
      }
    },

    async uploadMedia(file, folder = "general", onProgress = null) {
      if (onProgress) {
        onProgress({ status: "uploading", pct: 10, text: "Preparing cloud upload..." });
      }

      // 1. Check if Cloudinary direct signed upload is configured
      let signData = null;
      try {
        const signRes = await fetch("/api/media/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder }),
        });
        if (signRes.ok) {
          signData = await signRes.json();
        }
      } catch {}

      // 2. Direct Browser -> Cloudinary CDN upload (supports large videos & fast optimization)
      if (signData && signData.configured) {
        const cldForm = new FormData();
        cldForm.append("file", file);
        cldForm.append("api_key", signData.apiKey);
        cldForm.append("timestamp", String(signData.timestamp));
        cldForm.append("signature", signData.signature);
        cldForm.append("folder", signData.folder);

        const cldResult = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(
            "POST",
            `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`
          );
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable && onProgress) {
              const pct = Math.min(90, Math.max(15, Math.round((ev.loaded / ev.total) * 90)));
              onProgress({
                status: "uploading",
                pct,
                text: `Uploading to Cloudinary CDN (${pct}%)...`,
              });
            }
          };
          xhr.onload = () => {
            try {
              const parsed = JSON.parse(xhr.responseText);
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve(parsed);
              } else {
                reject(new Error(parsed.error?.message || "Cloudinary upload failed"));
              }
            } catch {
              reject(new Error("Invalid response from Cloudinary"));
            }
          };
          xhr.onerror = () => reject(new Error("Network error uploading to Cloudinary"));
          xhr.send(cldForm);
        });

        let finalUrl = cldResult.secure_url;
        if (finalUrl.includes("/image/upload/") && !finalUrl.includes("f_auto")) {
          finalUrl = finalUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
        }

        const mimeType = file.type || "application/octet-stream";
        const fileType = mimeType.startsWith("video/")
          ? "video"
          : mimeType === "application/pdf"
          ? "pdf"
          : "image";
        const bytesLen = cldResult.bytes || file.size || 0;
        const sizeStr =
          bytesLen > 1024 * 1024
            ? (bytesLen / (1024 * 1024)).toFixed(2) + " MB"
            : Math.max(1, Math.round(bytesLen / 1024)) + " KB";

        if (onProgress) {
          onProgress({ status: "uploading", pct: 95, text: "Saving metadata to MongoDB..." });
        }

        const metaRes = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: "media-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
            name: file.name || `upload-${Date.now()}`,
            filename: file.name || `upload-${Date.now()}`,
            type: fileType,
            mimeType,
            size: sizeStr,
            sizeBytes: bytesLen,
            folder,
            url: finalUrl,
            cloudinaryUrl: finalUrl,
            cloudinaryPublicId: cldResult.public_id,
            resourceType: cldResult.resource_type,
            storage_path: cldResult.public_id,
            date: new Date().toLocaleDateString(),
            createdAt: new Date().toISOString(),
          }),
        });
        const metaData = await metaRes.json();
        if (!metaRes.ok || !metaData.success) {
          throw new Error(metaData.error || "Failed to save Cloudinary metadata");
        }
        if (onProgress) {
          onProgress({ status: "success", pct: 100, text: "Uploaded to Cloudinary CDN" });
        }
        this.broadcastChange("MEDIA_UPLOADED", metaData.asset);
        return metaData.asset;
      }

      // 3. Fallback: MongoDB FormData upload
      if (onProgress) {
        onProgress({ status: "uploading", pct: 35, text: "Uploading to MongoDB..." });
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }
      if (onProgress) {
        onProgress({ status: "success", pct: 100, text: "Upload Complete" });
      }
      this.broadcastChange("MEDIA_UPLOADED", data.asset);
      return data.asset;
    },

    async migrateMediaToCloudinary() {
      const res = await fetch("/api/media/migrate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Migration failed");
      }
      safeStorage.remove("betro_media_assets");
      this.broadcastChange("MEDIA_SYNC", data);
      return data;
    },

    async deleteMedia(storagePath, assetId = null, url = null) {
      const targetId = assetId || storagePath;
      if (!targetId) return { success: true };
      const res = await fetch(
        `/api/media?id=${encodeURIComponent(targetId)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      safeStorage.remove("betro_media_assets");
      this.broadcastChange("MEDIA_DELETED", { id: targetId, url });
      return { success: true };
    },

    async deleteMultipleMedia(assets) {
      if (!Array.isArray(assets) || assets.length === 0) {
        return { success: true, count: 0 };
      }
      const ids = assets.map((a) => a.id).filter(Boolean);
      const res = await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      safeStorage.remove("betro_media_assets");
      this.broadcastChange("MEDIA_BATCH_DELETED", { count: ids.length });
      return { success: true, count: ids.length };
    },

    async deleteAllMedia() {
      const res = await fetch("/api/media?all=true", {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      safeStorage.remove("betro_media_assets");
      this.broadcastChange("MEDIA_BATCH_DELETED", { all: true });
      return await res.json();
    },

    // ==================== HELPERS ====================
    extractStoragePath(url, fallbackPath = null) {
      return { storagePath: fallbackPath || url || null };
    },

    getOptimizedAssetUrl(pathOrUrl) {
      return normalizeUrl(pathOrUrl);
    },

    async syncAllSeedData() {
      return { success: true, count: 16, total: 16 };
    },
  };

  window.BetroDB = BetroDB;
})(window);
