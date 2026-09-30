/**
 * Betroverse - Production Cloud Data & Storage Client
 * Unified, authoritative single source of truth using Supabase Database & Storage.
 * Compatible with local development, Vercel Preview, and Vercel Production.
 */

(function (window) {
  "use strict";

  // Storage Bucket Name for All Portfolio Media
  const DEFAULT_BUCKET = "betodata";

  // Production Supabase Verified Configuration
  const DEFAULT_CONFIG = {
    supabaseUrl: "https://fvbauhcwshgqboakeiux.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2YmF1aGN3c2hncWJvYWtlaXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MTM1NjgsImV4cCI6MjEwNjI4OTU2OH0.rZ3RXcEFCrZx96q3m9kafwaAgcAMGGrgiVWvqffks24",
    storageBucket: "betodata"
  };

  // State
  let supabaseClient = null;
  let activeConfig = {
    supabaseUrl: DEFAULT_CONFIG.supabaseUrl,
    supabaseAnonKey: DEFAULT_CONFIG.supabaseAnonKey,
    storageBucket: DEFAULT_CONFIG.storageBucket,
    isConfigured: true,
    source: "default_config"
  };

  let initPromise = null;

  /**
   * Safe localStorage helper with quota protection
   */
  const safeStorage = {
    get(key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set(key, val) {
      try {
        const str = typeof val === "string" ? val : JSON.stringify(val);
        if (str.length < 2500000) localStorage.setItem(key, str);
      } catch (e) {
        console.warn("[BetroDB] Local cache write skipped:", e);
      }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (e) {}
    }
  };

  /**
   * Helper: Normalize URL to prevent broken relative paths or typos
   */
  function cleanUrl(url) {
    if (!url || typeof url !== "string") return "";
    let clean = url.trim();
    // Auto-fix typo observed in admin console
    clean = clean.replace(/fvbauhcwshgqboak[eia]{2,3}x/gi, "fvbauhcwshgqboakeiux");
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = "https://" + clean;
    }
    return clean.replace(/\/+$/, "");
  }

  function cleanBucket(bucket) {
    if (!bucket || typeof bucket !== "string") return DEFAULT_BUCKET;
    const b = bucket.trim().toLowerCase();
    if (b === "betodata" || b === "portfolio-media") return b;
    return DEFAULT_BUCKET;
  }

  /**
   * Helper: Normalize & validate Anon Key (recovers truncated or corrupted keys)
   */
  function cleanKey(key) {
    if (!key || typeof key !== "string") return DEFAULT_CONFIG.supabaseAnonKey;
    let clean = key.trim();
    // Strip accidental https:// if added previously
    clean = clean.replace(/^https?:\/\//i, "");
    if (clean.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2YmF1aGN3c2hncWJvYWtlaXV4")) {
      return DEFAULT_CONFIG.supabaseAnonKey;
    }
    const parts = clean.split(".");
    if (parts.length !== 3 || clean.length < 150) {
      return DEFAULT_CONFIG.supabaseAnonKey;
    }
    return clean;
  }

  /**
   * Clean filename for cloud storage
   */
  function cleanFileName(filename) {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();
  }

  /**
   * Discover Supabase credentials from available sources:
   * 1. Window runtime config (window.BETRO_CONFIG)
   * 2. Vercel Serverless API (/api/config)
   * 3. LocalStorage override (betro_supabase_config)
   * 4. Built-in verified defaults
   */
  async function discoverConfig() {
    let url = "";
    let key = "";
    let bucket = DEFAULT_BUCKET;
    let source = "none";

    // 1. Check window.BETRO_CONFIG (injected or local config)
    if (window.BETRO_CONFIG && window.BETRO_CONFIG.SUPABASE_URL && window.BETRO_CONFIG.SUPABASE_ANON_KEY) {
      url = cleanUrl(window.BETRO_CONFIG.SUPABASE_URL);
      key = cleanKey(window.BETRO_CONFIG.SUPABASE_ANON_KEY);
      bucket = cleanUrl(window.BETRO_CONFIG.SUPABASE_STORAGE_BUCKET) || DEFAULT_BUCKET;
      source = "window.BETRO_CONFIG";
    }

    // 2. Check localStorage override (e.g. from Admin Settings)
    const stored = safeStorage.get("betro_supabase_config");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
          url = cleanUrl(parsed.supabaseUrl);
          key = cleanKey(parsed.supabaseAnonKey);
          bucket = cleanUrl(parsed.storageBucket) || DEFAULT_BUCKET;
          source = "localStorage";
        }
      } catch (e) {}
    }

    // 3. If still empty, check Vercel Serverless endpoint (/api/config)
    if (!url || !key) {
      if (window.location.protocol.startsWith("http")) {
        try {
          const res = await fetch("/api/config", { cache: "no-cache" });
          if (res.ok) {
            const data = await res.json();
            if (data.configured && data.supabaseUrl && data.supabaseAnonKey) {
              url = cleanUrl(data.supabaseUrl);
              key = cleanKey(data.supabaseAnonKey);
              bucket = cleanUrl(data.storageBucket) || DEFAULT_BUCKET;
              source = "vercel_api";
            }
          }
        } catch (e) {
          // Running in environment without /api/config (e.g. file:/// or raw static server)
        }
      }
    }

    // 4. If still empty, use verified defaults
    if (!url || !key) {
      url = DEFAULT_CONFIG.supabaseUrl;
      key = DEFAULT_CONFIG.supabaseAnonKey;
      bucket = DEFAULT_CONFIG.storageBucket;
      source = "production_defaults";
    }

    activeConfig = {
      supabaseUrl: url,
      supabaseAnonKey: key,
      storageBucket: bucket,
      isConfigured: Boolean(url && key),
      source: source
    };

    return activeConfig;
  }

  /**
   * Initialize Supabase Client instance
   */
  async function initClient(forceRefresh = false) {
    if (supabaseClient && !forceRefresh) return supabaseClient;

    await discoverConfig();

    if (!activeConfig.isConfigured) {
      console.warn("[BetroDB] Supabase credentials not found. System running in fallback mode.");
      supabaseClient = null;
      return null;
    }

    // Wait for Supabase SDK to be ready on window
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      console.error("[BetroDB] Supabase JS SDK not loaded on window. Please include @supabase/supabase-js.");
      return null;
    }

    try {
      supabaseClient = window.supabase.createClient(activeConfig.supabaseUrl, activeConfig.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      console.log(`[BetroDB] Connected to Supabase (${activeConfig.source}): ${activeConfig.supabaseUrl}`);
      return supabaseClient;
    } catch (err) {
      console.error("[BetroDB] Failed to create Supabase client:", err);
      supabaseClient = null;
      return null;
    }
  }

  /**
   * Helper: Map Supabase database row to Case Study object
   */
  function mapDbRowToCaseStudy(row) {
    if (!row) return null;
    return {
      id: row.id,
      slug: row.slug,
      companyName: row.company_name,
      title: row.title || row.company_name,
      category: row.category || "Creative Campaign",
      industry: row.industry || "General",
      clientName: row.client_name || row.company_name,
      year: row.year || "2024 - 2025",
      status: row.status || "published",
      companyLogo: row.company_logo || "images/logo.png",
      cardImage: row.card_image || row.hero_image || "images/p1.jpg",
      heroImage: row.hero_image || "images/p1.jpg",
      shortIntro: row.short_intro || "",
      fullDescription: row.full_description || "",
      brandStory: row.brand_story || "",
      brandGoals: row.brand_goals || "",
      projectObjective: row.project_objective || "",
      services: Array.isArray(row.services) ? row.services : [],
      overview: (row.overview && typeof row.overview === "object") ? row.overview : {},
      media: (row.media && typeof row.media === "object") ? row.media : { gallery: [], videos: [], mockups: {} },
      results: (row.results && typeof row.results === "object") ? row.results : {},
      seo: (row.seo && typeof row.seo === "object") ? row.seo : {},
      gallerySections: Array.isArray(row.gallery_sections) ? row.gallery_sections : [],
      blocks: Array.isArray(row.blocks) ? row.blocks : [],
      sectionVisibility: (row.section_visibility && typeof row.section_visibility === "object") ? row.section_visibility : {},
      sectionOrder: Array.isArray(row.section_order) ? row.section_order : [],
      displayOrder: typeof row.display_order === "number" ? row.display_order : 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Helper: Map Case Study object to Supabase database row
   */
  function mapCaseStudyToDbRow(cs) {
    if (!cs) return null;
    const now = new Date().toISOString();
    return {
      id: cs.id || `cs-${cs.slug || Date.now()}`,
      slug: (cs.slug || `project-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      company_name: cs.companyName || "Untitled Project",
      title: cs.title || cs.companyName || "Case Study",
      category: cs.category || "Creative Campaign",
      industry: cs.industry || "General",
      client_name: cs.clientName || cs.companyName || "",
      year: cs.year || "2024 - 2025",
      status: cs.status || "published",
      company_logo: cs.companyLogo || "images/logo.png",
      card_image: cs.cardImage || cs.heroImage || "images/p1.jpg",
      hero_image: cs.heroImage || "images/p1.jpg",
      short_intro: cs.shortIntro || "",
      full_description: cs.fullDescription || "",
      brand_story: cs.brandStory || "",
      brand_goals: cs.brandGoals || "",
      project_objective: cs.projectObjective || "",
      services: Array.isArray(cs.services) ? cs.services : [],
      overview: cs.overview || {},
      media: cs.media || { gallery: [], videos: [], mockups: {} },
      results: cs.results || {},
      seo: cs.seo || {},
      gallery_sections: Array.isArray(cs.gallerySections) ? cs.gallerySections : [],
      blocks: Array.isArray(cs.blocks) ? cs.blocks : [],
      section_visibility: cs.sectionVisibility || {},
      section_order: Array.isArray(cs.sectionOrder) ? cs.sectionOrder : [],
      display_order: typeof cs.displayOrder === "number" ? cs.displayOrder : 0,
      updated_at: now
    };
  }

  // Authoritative BetroDB Interface
  const BetroDB = {
    /**
     * Initialization guarantee
     */
    async ensureInit(force = false) {
      if (!initPromise || force) {
        initPromise = initClient(force);
      }
      return initPromise;
    },

    isConfigured() {
      return activeConfig.isConfigured;
    },

    getConfig() {
      return { ...activeConfig };
    },

    /**
     * Update configuration at runtime (e.g. from Admin Settings modal)
     */
    async updateConfig({ supabaseUrl, supabaseAnonKey, storageBucket }) {
      const newConfig = {
        supabaseUrl: cleanUrl(supabaseUrl),
        supabaseAnonKey: cleanKey(supabaseAnonKey),
        storageBucket: cleanUrl(storageBucket) || DEFAULT_BUCKET
      };
      safeStorage.set("betro_supabase_config", newConfig);
      await this.ensureInit(true);
      return this.testConnection();
    },

    /**
     * Test live Supabase connection
     */
    async testConnection() {
      const client = await this.ensureInit(true);
      if (!client) {
        return {
          success: false,
          error: "Supabase client not initialized. Check your URL and Anon Key."
        };
      }

      const start = Date.now();
      try {
        const { data, error } = await client
          .from("portfolio_projects")
          .select("id, slug, status")
          .limit(1);

        const latency = Date.now() - start;

        if (error) {
          if (error.code === "PGRST205" || (error.message && error.message.includes("schema cache"))) {
            return {
              success: false,
              connected: true,
              needTables: true,
              error: "Supabase connected! Tables not created yet. Please execute supabase/full_migration.sql in your Supabase SQL Editor.",
              latency
            };
          }
          return {
            success: false,
            error: `Database query failed: ${error.message} (Code: ${error.code})`,
            latency
          };
        }

        return {
          success: true,
          count: data ? data.length : 0,
          latency,
          message: `Connected successfully to Supabase! Latency: ${latency}ms.`
        };
      } catch (err) {
        return {
          success: false,
          error: `Connection error: ${err.message || err}`,
          latency: Date.now() - start
        };
      }
    },

    /**
     * Retrieve all case studies (Published for public, all for admin)
     */
    async getCaseStudies(options = {}) {
      const { forceRefresh = false, includeDrafts = false } = options;

      const client = await this.ensureInit();

      if (client) {
        try {
          let query = client
            .from("portfolio_projects")
            .select("*")
            .order("display_order", { ascending: true })
            .order("created_at", { ascending: false });

          if (!includeDrafts) {
            query = query.eq("status", "published");
          }

          const { data, error } = await query;

          if (!error && Array.isArray(data) && data.length > 0) {
            const mapped = data.map(mapDbRowToCaseStudy);
            // Cache locally for fast page loads and offline resilience
            safeStorage.set("betro_casestudies_cache", mapped);
            return mapped;
          } else if (error) {
            console.error("[BetroDB] Failed to fetch case studies from database:", error.message);
          }
        } catch (e) {
          console.error("[BetroDB] Unexpected database error:", e);
        }
      }

      // Fallback: Check local cache first
      const cached = safeStorage.get("betro_casestudies_cache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (!includeDrafts) return parsed.filter(cs => cs.status === "published");
            return parsed;
          }
        } catch (e) {}
      }

      // Fallback to legacy window seed if available
      if (typeof window.getBetroCaseStudiesSeed === "function") {
        return window.getBetroCaseStudiesSeed();
      }

      return [];
    },

    /**
     * Retrieve single case study by slug or id
     */
    async getCaseStudyBySlug(slugOrId, options = {}) {
      if (!slugOrId) return null;
      const target = String(slugOrId).toLowerCase().trim();

      const client = await this.ensureInit();

      if (client) {
        try {
          // 1. Fetch case study record
          const { data, error } = await client
            .from("portfolio_projects")
            .select("*")
            .or(`slug.ilike.${target},id.eq.${target}`)
            .limit(1);

          if (!error && data && data.length > 0) {
            const cs = mapDbRowToCaseStudy(data[0]);

            // 2. Fetch associated media assets strictly for this case study
            const { data: mediaData, error: mediaErr } = await client
              .from("media_assets")
              .select("*")
              .eq("case_study_id", cs.id)
              .eq("status", "published")
              .order("display_order", { ascending: true });

            if (!mediaErr && Array.isArray(mediaData) && mediaData.length > 0) {
              const galleryAssets = mediaData.filter(m => m.type === "image" || m.target_section === "creative_showcase");
              const videoAssets = mediaData.filter(m => m.type === "video" || m.target_section === "video_showcase");

              cs.media = cs.media || {};
              cs.media.assets = mediaData;
              cs.media.gallery = galleryAssets.map(g => g.url);
              cs.media.videos = videoAssets.map(v => v.url);
            }

            return cs;
          }
        } catch (e) {
          console.error("[BetroDB] Error fetching case study by slug:", e);
        }
      }

      // Fallback: search in list
      const all = await this.getCaseStudies({ includeDrafts: true });
      return all.find(cs => cs.slug.toLowerCase() === target || cs.id === target) || null;
    },

    /**
     * Save / Upsert a Case Study to Production Supabase Database
     */
    async saveCaseStudy(csData) {
      if (!csData) throw new Error("No case study data provided");

      const client = await this.ensureInit();
      const row = mapCaseStudyToDbRow(csData);

      if (!client) {
        // Fallback local save if database not yet configured
        console.warn("[BetroDB] Supabase not connected. Saving to local storage.");
        const current = (await this.getCaseStudies({ includeDrafts: true })) || [];
        const idx = current.findIndex(c => c.id === row.id || c.slug === row.slug);
        const mapped = mapDbRowToCaseStudy(row);
        if (idx >= 0) current[idx] = mapped;
        else current.push(mapped);
        safeStorage.set("betro_casestudies_cache", current);
        this.broadcastChange("CASE_STUDY_UPDATED", mapped);
        return { success: true, data: mapped, warning: "Saved locally (Supabase not configured)" };
      }

      try {
        // 1. Upsert portfolio_projects record
        const { data, error } = await client
          .from("portfolio_projects")
          .upsert(row, { onConflict: "id" })
          .select()
          .single();

        if (error) {
          console.error("[BetroDB] Upsert project error:", error);
          throw new Error(`Database error: ${error.message}`);
        }

        const savedCS = mapDbRowToCaseStudy(data);

        // 2. Synchronize media_assets table
        if (csData.media && Array.isArray(csData.media.assets)) {
          for (let i = 0; i < csData.media.assets.length; i++) {
            const a = csData.media.assets[i];
            if (!a || !a.url) continue;

            const assetRow = {
              id: a.id || `media-${savedCS.id}-${a.type || 'image'}-${Date.now()}-${i}`,
              case_study_id: savedCS.id,
              case_study_slug: savedCS.slug,
              type: a.type || "image",
              target_section: a.target_section || "creative_showcase",
              url: a.url,
              storage_path: a.storage_path || null,
              name: a.name || `Asset ${i + 1}`,
              size: a.size || "Optimized",
              display_order: typeof a.display_order === "number" ? a.display_order : i,
              status: a.status || "published",
              updated_at: new Date().toISOString()
            };

            await client
              .from("media_assets")
              .upsert(assetRow, { onConflict: "id" });
          }
        }

        // Invalidate local caches
        safeStorage.remove("betro_casestudies_cache");
        this.broadcastChange("CASE_STUDY_UPDATED", savedCS);

        return { success: true, data: savedCS };
      } catch (err) {
        console.error("[BetroDB] Save operation failed:", err);
        throw err;
      }
    },

    /**
     * Delete a Case Study from Production Database
     */
    async deleteCaseStudy(id) {
      if (!id) return { success: false, error: "Missing ID" };

      const client = await this.ensureInit();
      if (!client) {
        const current = (await this.getCaseStudies({ includeDrafts: true })) || [];
        const filtered = current.filter(c => c.id !== id);
        safeStorage.set("betro_casestudies_cache", filtered);
        this.broadcastChange("CASE_STUDY_DELETED", { id });
        return { success: true };
      }

      try {
        const { error } = await client
          .from("portfolio_projects")
          .delete()
          .eq("id", id);

        if (error) throw error;

        safeStorage.remove("betro_casestudies_cache");
        this.broadcastChange("CASE_STUDY_DELETED", { id });
        return { success: true };
      } catch (err) {
        console.error("[BetroDB] Delete case study error:", err);
        return { success: false, error: err.message };
      }
    },

    /**
     * Direct Supabase Storage Media Upload
     * Admin Panel -> Upload -> Supabase Storage (portfolio-media) -> Public CDN URL -> Database Record
     */
    async uploadMedia(file, options = {}) {
      if (!file) throw new Error("No file provided");

      const {
        folder = "showcase",
        caseStudyId = "general",
        slug = "project",
        onProgress = null
      } = options;

      const client = await this.ensureInit();

      // Check format
      const ext = file.name.split(".").pop().toLowerCase();
      const isVideo = ["mp4", "webm", "mov"].includes(ext);
      const isImg = ["jpg", "jpeg", "png", "webp", "svg"].includes(ext);
      const fileType = isVideo ? "video" : isImg ? "image" : "document";

      // 50MB check
      if (file.size > 52428800) {
        throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 50MB limit.`);
      }

      if (onProgress) onProgress({ status: "uploading", pct: 15, text: "Preparing cloud upload..." });

      if (!client) {
        console.warn("[BetroDB] Supabase not connected. Uploading to local preview buffer.");
        // Fallback to local DataURL preview
        const dataUrl = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = (e) => res(e.target.result);
          reader.onerror = rej;
          reader.readAsDataURL(file);
        });

        if (onProgress) onProgress({ status: "success", pct: 100, text: "Buffered locally (Supabase not connected)" });

        return {
          id: `media-${caseStudyId}-${fileType}-${Date.now()}`,
          case_study_id: caseStudyId,
          case_study_slug: slug,
          type: fileType,
          target_section: fileType === "video" ? "video_showcase" : "creative_showcase",
          url: dataUrl,
          storage_path: null,
          name: file.name,
          size: (file.size / 1024).toFixed(0) + " KB",
          display_order: 0,
          status: "published"
        };
      }

      try {
        let bucket = cleanBucket(activeConfig.storageBucket || DEFAULT_BUCKET);
        const safeSlug = (slug || "general").toLowerCase().replace(/[^a-z0-9-]/g, "-");
        const cleanName = cleanFileName(file.name);
        const storagePath = `case-studies/${safeSlug}/${Date.now()}_${cleanName}`;

        if (onProgress) onProgress({ status: "uploading", pct: 45, text: `Uploading "${file.name}" to Supabase Storage...` });

        // Direct upload to Supabase Storage
        let uploadResult = await client.storage
          .from(bucket)
          .upload(storagePath, file, {
            cacheControl: "31536000",
            upsert: true
          });

        // Auto-retry with the other verified bucket if first bucket returns not found
        if (uploadResult.error && uploadResult.error.message && uploadResult.error.message.toLowerCase().includes("not found")) {
          const fallback = bucket === "betodata" ? "portfolio-media" : "betodata";
          console.warn(`[BetroDB] Bucket "${bucket}" not found. Retrying with "${fallback}"...`);
          const retry = await client.storage
            .from(fallback)
            .upload(storagePath, file, {
              cacheControl: "31536000",
              upsert: true
            });
          if (!retry.error) {
            bucket = fallback;
            uploadResult = retry;
          }
        }

        const { data: uploadData, error: uploadErr } = uploadResult;

        if (uploadErr) {
          console.error("[BetroDB] Storage upload failed:", uploadErr);
          throw new Error(`Cloud storage upload failed: ${uploadErr.message}`);
        }

        if (onProgress) onProgress({ status: "processing", pct: 85, text: "Retrieving public CDN URL..." });

        // Obtain permanent public CDN URL
        const { data: publicUrlData } = client.storage
          .from(bucket)
          .getPublicUrl(storagePath);

        const publicUrl = publicUrlData ? publicUrlData.publicUrl : "";

        if (!publicUrl) {
          throw new Error("Failed to generate public URL for uploaded media");
        }

        const structuredAsset = {
          id: `media-${caseStudyId}-${fileType}-${Date.now()}`,
          case_study_id: caseStudyId,
          case_study_slug: safeSlug,
          type: fileType,
          target_section: fileType === "video" ? "video_showcase" : "creative_showcase",
          url: publicUrl,
          storage_path: storagePath,
          name: file.name,
          size: (file.size / 1024).toFixed(0) + " KB",
          display_order: 0,
          status: "published",
          created_at: new Date().toISOString()
        };

        if (onProgress) onProgress({ status: "success", pct: 100, text: "Upload Complete — Permanent CDN URL generated" });

        return structuredAsset;
      } catch (err) {
        if (onProgress) onProgress({ status: "error", pct: 0, text: err.message });
        throw err;
      }
    },

    /**
     * Delete media from Supabase Storage & Database
     */
    async deleteMedia(storagePath, assetId = null) {
      const client = await this.ensureInit();
      if (!client) return { success: true };

      try {
        if (storagePath) {
          const bucket = activeConfig.storageBucket || DEFAULT_BUCKET;
          await client.storage.from(bucket).remove([storagePath]);
        }
        if (assetId) {
          await client.from("media_assets").delete().eq("id", assetId);
        }
        return { success: true };
      } catch (e) {
        console.error("[BetroDB] Delete media error:", e);
        return { success: false, error: e.message };
      }
    },

    /**
     * Fetch Brand Logos
     */
    async getBrandLogos() {
      const client = await this.ensureInit();
      if (client) {
        try {
          const { data, error } = await client
            .from("brand_logos")
            .select("*")
            .order("display_order", { ascending: true });

          if (!error && Array.isArray(data) && data.length > 0) {
            return data;
          }
        } catch (e) {}
      }
      return null;
    },

    /**
     * Broadcast change event across tabs & windows
     */
    broadcastChange(type, data) {
      try {
        if ("BroadcastChannel" in window) {
          const channel = new BroadcastChannel("betro_portfolio_sync");
          channel.postMessage({ type, data, timestamp: Date.now() });
        }
      } catch (e) {}
      window.dispatchEvent(new CustomEvent("betro_db_updated", { detail: { type, data } }));
    },

    /**
     * One-click seed synchronizer:
     * Pushes all 16 default case studies and default brands to Supabase in one click!
     */
    async syncAllSeedData(seedList, onProgress = null) {
      const client = await this.ensureInit();
      if (!client) {
        throw new Error("Supabase is not configured. Please enter your credentials first.");
      }

      const list = Array.isArray(seedList) && seedList.length > 0
        ? seedList
        : (typeof window.getBetroCaseStudiesSeed === "function" ? window.getBetroCaseStudiesSeed() : []);

      if (!list || list.length === 0) {
        throw new Error("No seed data found to synchronize.");
      }

      let successCount = 0;
      let total = list.length;

      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (onProgress) {
          onProgress({
            current: i + 1,
            total,
            pct: Math.round(((i + 1) / total) * 100),
            name: item.companyName
          });
        }

        try {
          item.displayOrder = i;
          await this.saveCaseStudy(item);
          successCount++;
        } catch (err) {
          console.error(`Failed to sync project "${item.companyName}":`, err);
        }
      }

      safeStorage.remove("betro_casestudies_cache");
      return { success: true, count: successCount, total };
    }
  };

  // Expose to window
  window.BetroDB = BetroDB;

  // Auto-init on script load
  BetroDB.ensureInit();

})(window);
