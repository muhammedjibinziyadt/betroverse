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
      try { localStorage.removeItem(key); } catch (e) { }
    }
  };

  /**
   * Helper: Normalize URL to prevent broken relative paths or typos
   */
  function cleanUrl(url) {
    if (!url || typeof url !== "string") return "";
    let clean = url.trim();
    clean = clean.replace(/\s+/g, "");
    clean = clean.replace(/\/+$/, "");
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = "https://" + clean;
    }
    return clean;
  }

  function cleanKey(key) {
    if (!key || typeof key !== "string") return "";
    return key.trim().replace(/\s+/g, "");
  }

  function cleanBucket(name) {
    if (!name || typeof name !== "string") return DEFAULT_BUCKET;
    return name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  }

  function extractStoragePath(url, fallbackPath = null) {
    let p = null;
    if (url && typeof url === "string") {
      const match = url.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/?#]+)\/(.+?)(?:\?.*)?$/i);
      if (match) {
        p = decodeURIComponent(match[2]);
      }
    }
    if (!p && fallbackPath && typeof fallbackPath === "string" && fallbackPath !== "null") {
      p = fallbackPath.trim();
    }
    if (p) {
      p = p.replace(/^\/+/, "");
      p = p.replace(/^(?:betodata|portfolio-media)\/+/i, "");
      return p;
    }
    return null;
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
      } catch (e) { }
    }

    // 3. If still empty, check Vercel Serverless endpoint (/api/config)
    if (!url || !key) {
      if (typeof window !== "undefined" && window.location && typeof window.location.protocol === "string" && window.location.protocol.startsWith("http")) {
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
   * Helper: Return optimized WebP URL if available for static images
   */
  function getOptimizedAssetUrl(pathOrUrl, options = {}) {
    if (!pathOrUrl || typeof pathOrUrl !== "string") return pathOrUrl || "";
    let clean = pathOrUrl.trim();
    const { preferThumb = false } = options;

    // Resilient mapping of remote Supabase URLs to verified local assets when applicable
    const remoteMatch = clean.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/[^/?#]+\/(?:portfolio\/|brands\/)?([a-zA-Z0-9_\-\.\s%()]+\.(?:png|jpe?g|webp|svg))(?:?.*)?$/i);
    const remoteMatch = clean.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/[^/?#]+\/(?:portfolio\/|brands\/)?([a-zA-Z0-9_\-\.\s%()]+\.(?:png|jpe?g|webp|svg))(?:\?.*)?$/i);
    if (remoteMatch) {
      clean = "images/" + decodeURIComponent(remoteMatch[1]);
    }

    const match = clean.match(/^(\.\.\/)?images\/([a-zA-Z0-9_\-\.\s%()]+\.(?:png|jpg|jpeg))$/i);
    if (match) {
      const prefix = match[1] || "";
      const filename = match[2];
      const baseName = filename.replace(/\.(png|jpe?g)$/i, "");
      if (baseName.toLowerCase().startsWith("frame 1")) return clean;
      if (preferThumb) {
        return `${prefix}images/${baseName}_thumb.webp`;
      }
      return `${prefix}images/${baseName}.webp`;
    }

    return clean;
  }

  /**
   * Helper: Map Supabase database row to Case Study object
   */
  function mapDbRowToCaseStudy(row) {
    if (!row) return null;
    const cardImg = row.card_image || row.hero_image || "images/p1.jpg";
    const heroImg = row.hero_image || "images/p1.jpg";
    const logoImg = row.company_logo || "images/logo.png";

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
      companyLogo: logoImg,
      companyLogoWebp: getOptimizedAssetUrl(logoImg),
      cardImage: cardImg,
      cardImageThumb: getOptimizedAssetUrl(cardImg, { preferThumb: true }),
      cardImageWebp: getOptimizedAssetUrl(cardImg),
      heroImage: heroImg,
      heroImageWebp: getOptimizedAssetUrl(heroImg),
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
      displayOrder: typeof row.sort_order === "number" ? row.sort_order : (typeof row.display_order === "number" ? row.display_order : 0),
      sortOrder: typeof row.sort_order === "number" ? row.sort_order : (typeof row.display_order === "number" ? row.display_order : 0),
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
      display_order: typeof cs.displayOrder === "number" ? cs.displayOrder : (typeof cs.sortOrder === "number" ? cs.sortOrder : 0),
      sort_order: typeof cs.sortOrder === "number" ? cs.sortOrder : (typeof cs.displayOrder === "number" ? cs.displayOrder : 0),
      updated_at: now
    };
  }

  // Authoritative BetroDB Interface
  const BetroDB = {
    /**
     * Authenticate administrator via Google OAuth
     */
    async signInWithGoogle() {
      const client = await this.ensureInit();
      if (!client) throw new Error("Supabase client not initialized.");
      return client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });
    },

    /**
     * Get current authenticated session/user
     */
    async getAuthSession() {
      const client = await this.ensureInit();
      if (!client) return null;
      try {
        const { data } = await client.auth.getSession();
        return (data && data.session) || null;
      } catch (e) {
        return null;
      }
    },

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

    broadcastChange(type, payload) {
      try {
        if (typeof window !== "undefined" && window.BroadcastChannel) {
          const bc = new window.BroadcastChannel("betro_db_sync");
          bc.postMessage({ type, payload, timestamp: Date.now() });
          bc.close();
        }
      } catch (e) { }
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

      let projectRef = "";
      try {
        const parsed = new URL(activeConfig.supabaseUrl);
        const parts = parsed.hostname.split(".");
        if (parts.length >= 3 && parts[1] === "supabase" && parts[2] === "co") {
          projectRef = parts[0];
        }
      } catch (e) { }

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
            error: 'Database query failed: ' + error.message + ' (Code: ' + error.code + ')',
            latency
          };
        }

        return {
          success: true,
          count: data ? data.length : 0,
          latency,
          message: 'Connected successfully to Supabase! Latency: ' + latency + 'ms.'
        };
      } catch (err) {
        const latency = Date.now() - start;
        const errMsg = err ? (err.message || String(err)) : "Network failure";
        const isDnsError = errMsg.includes("Failed to fetch") || errMsg.includes("ENOTFOUND") || errMsg.includes("NetworkError");

        return {
          success: false,
          isDnsError,
          projectRef,
          dashboardUrl: projectRef ? ('https://supabase.com/dashboard/project/' + projectRef) : null,
          error: isDnsError
            ? 'Supabase host (' + activeConfig.supabaseUrl + ') is unreachable. If this is a free-tier project, Supabase has paused it due to inactivity. Click "Restore Project" in Supabase or update your credentials.'
            : ('Connection error: ' + errMsg),
          latency
        };
      }
    },

    getOptimizedAssetUrl(url, opts) {
      return getOptimizedAssetUrl(url, opts);
    },

    /**
     * Retrieve all case studies (Published for public, all for admin)
     * Features: Stale-While-Revalidate caching, selective column queries
     */
    async getCaseStudies(options = {}) {
      const { forceRefresh = false, includeDrafts = false, forCards = false } = options;

      let deletedCsIds = [];
      try {
        const rawDel = safeStorage.get("betro_deleted_casestudy_ids");
        if (rawDel) deletedCsIds = JSON.parse(rawDel);
      } catch (e) { }

      // 1. PRIMARY: Authoritative remote query to shared Supabase cloud database
      try {
        const cloudRes = await this.revalidateCaseStudies({ includeDrafts, forCards });
        if (Array.isArray(cloudRes) && cloudRes.length > 0) {
          let res = cloudRes;
          if (Array.isArray(deletedCsIds) && deletedCsIds.length > 0) {
            res = res.filter(cs => !deletedCsIds.includes(cs.id) && !deletedCsIds.includes(cs.slug));
          }
          return res;
        }
      } catch (cloudErr) {
        console.warn("[BetroDB] Cloud fetch notice, checking local cache:", cloudErr);
      }

      // 2. SECONDARY: Local cache fallback when offline or during transient network loss
      const cached = safeStorage.get("betro_casestudies_cache");
      if (cached) {
        try {
          let parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (Array.isArray(deletedCsIds) && deletedCsIds.length > 0) {
              parsed = parsed.filter(cs => !deletedCsIds.includes(cs.id) && !deletedCsIds.includes(cs.slug));
            }
            if (!includeDrafts) return parsed.filter(cs => cs.status === "published");
            return parsed;
          }
        } catch (e) { }
      }

      return [];
    },

    /**
     * Revalidate case studies from Supabase remote database
     */
    async revalidateCaseStudies(options = {}) {
      const { includeDrafts = false, forCards = false } = options;
      const client = await this.ensureInit();

      if (client) {
        try {
          // Column selection optimization per Section 10 of requirements
          const selectCols = forCards
            ? "id, slug, company_name, title, category, industry, client_name, year, status, company_logo, card_image, hero_image, short_intro, brand_story, services, display_order, created_at, updated_at"
            : "*";

          let query = client
            .from("portfolio_projects")
            .select(selectCols)
            .order("display_order", { ascending: true })
            .order("created_at", { ascending: false });

          if (!includeDrafts) {
            query = query.eq("status", "published");
          }

          const { data, error } = await query;

          if (!error && Array.isArray(data)) {
            const mapped = data.map(mapDbRowToCaseStudy);
            mapped.sort((a, b) => {
              const oA = typeof a.sortOrder === "number" ? a.sortOrder : (typeof a.displayOrder === "number" ? a.displayOrder : 9999);
              const oB = typeof b.sortOrder === "number" ? b.sortOrder : (typeof b.displayOrder === "number" ? b.displayOrder : 9999);
              return oA - oB;
            });
            if (!forCards) {
              safeStorage.set("betro_casestudies_cache", mapped);
            } else {
              const existingRaw = safeStorage.get("betro_casestudies_cache");
              if (!existingRaw) safeStorage.set("betro_casestudies_cache", mapped);
            }
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
        } catch (e) { }
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
      const { forceRefresh = false } = options;

      // 1. FAST PATH: Check cache for instant initial render
      if (!forceRefresh) {
        const cached = safeStorage.get("betro_casestudies_cache");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              const found = parsed.find(c => (c.slug && c.slug.toLowerCase() === target) || c.id === target);
              if (found && found.media && Array.isArray(found.media.gallery) && found.media.gallery.length > 0) {
                return found;
              }
            }
          } catch (e) { }
        }
      }

      return this.revalidateSingleCaseStudy(target);
    },

    async revalidateSingleCaseStudy(target) {
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
              // If portfolio_projects had explicit media.gallery order, keep it, but ensure all URLs are active
              if (Array.isArray(cs.media.gallery) && cs.media.gallery.length > 0) {
                const activeUrls = new Set(mediaData.map(m => m.url));
                const filtered = cs.media.gallery.filter(u => activeUrls.has(u));
                cs.media.gallery = filtered.length > 0 ? filtered : galleryAssets.map(g => g.url);
              } else {
                cs.media.gallery = galleryAssets.map(g => g.url);
              }

              if (Array.isArray(cs.media.videos) && cs.media.videos.length > 0) {
                const activeVids = new Set(mediaData.map(m => m.url));
                const filtered = cs.media.videos.filter(u => activeVids.has(u));
                cs.media.videos = filtered.length > 0 ? filtered : videoAssets.map(v => v.url);
              } else {
                cs.media.videos = videoAssets.map(v => v.url);
              }
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

      // 1. Ensure any deleted blacklist entry for this item is cleared so it stays visible
      let deletedCsIds = [];
      try {
        const rawDel = safeStorage.get("betro_deleted_casestudy_ids");
        if (rawDel) deletedCsIds = JSON.parse(rawDel);
      } catch (e) { }
      if (Array.isArray(deletedCsIds) && deletedCsIds.length > 0) {
        deletedCsIds = deletedCsIds.filter(dId => dId !== csData.id && dId !== csData.slug);
        safeStorage.set("betro_deleted_casestudy_ids", deletedCsIds);
      }

      const row = mapCaseStudyToDbRow(csData);
      const mapped = mapDbRowToCaseStudy(row);

      // 2. ALWAYS update local cache first so data is NEVER lost regardless of network state
      try {
        const current = (await this.getCaseStudies({ includeDrafts: true })) || [];
        const existingIdx = current.findIndex(c => c.id === mapped.id || c.slug === mapped.slug);
        if (existingIdx >= 0) {
          current[existingIdx] = { ...current[existingIdx], ...mapped };
        } else {
          current.push(mapped);
        }
        safeStorage.set("betro_casestudies_cache", current);
        this.broadcastChange("CASE_STUDY_UPDATED", mapped);
      } catch (localErr) {
        console.warn("[BetroDB] Local cache update notice:", localErr);
      }

      const client = await this.ensureInit();
      if (!client) {
        return { success: true, data: mapped, warning: "Saved locally (Supabase not configured)" };
      }

      try {
        // 3. Resolve potential slug conflicts in Supabase portfolio_projects
        try {
          const { data: existingBySlug } = await client
            .from("portfolio_projects")
            .select("id")
            .eq("slug", row.slug)
            .maybeSingle();

          if (existingBySlug && existingBySlug.id && existingBySlug.id !== row.id) {
            // Align ID with existing DB row to avoid unique slug constraint error
            row.id = existingBySlug.id;
            mapped.id = existingBySlug.id;
          }
        } catch (slugCheckErr) {
          console.warn("[BetroDB] Slug conflict resolution notice:", slugCheckErr);
        }

        // 4. Upsert portfolio_projects record
        const { data, error } = await client
          .from("portfolio_projects")
          .upsert(row, { onConflict: "id" })
          .select();

        if (error) {
          console.error("[BetroDB] Upsert project error:", error);
          // Return clear error without throwing so local persistence is preserved
          return { success: true, data: mapped, warning: `Saved locally (${error.message})` };
        }

        const savedRow = (Array.isArray(data) && data.length > 0) ? data[0] : row;
        const savedCS = mapDbRowToCaseStudy(savedRow);

        // 5. Update local cache with authoritative saved record
        try {
          const current = (await this.getCaseStudies({ includeDrafts: true })) || [];
          const idx = current.findIndex(c => c.id === savedCS.id || c.slug === savedCS.slug);
          if (idx >= 0) current[idx] = savedCS;
          else current.push(savedCS);
          safeStorage.set("betro_casestudies_cache", current);
        } catch (e) { }

        // 6. Synchronize media_assets table safely
        if (csData.media) {
          const currentAssets = Array.isArray(csData.media.assets) ? csData.media.assets : [];
          const activeUrls = new Set();

          if (Array.isArray(csData.media.gallery)) {
            csData.media.gallery.forEach(u => {
              const val = typeof u === 'string' ? u : (u ? u.url : "");
              if (val) activeUrls.add(val);
            });
          }
          if (Array.isArray(csData.media.videos)) {
            csData.media.videos.forEach(u => {
              const val = typeof u === 'string' ? u : (u ? u.url : "");
              if (val) activeUrls.add(val);
            });
          }
          currentAssets.forEach(a => {
            if (a && a.url) activeUrls.add(a.url);
          });

          // Unlink any assets previously linked to this case study that have been removed
          try {
            const { data: prevLinked } = await client
              .from("media_assets")
              .select("id, url")
              .eq("case_study_id", savedCS.id);

            if (Array.isArray(prevLinked)) {
              for (const oldA of prevLinked) {
                if (!activeUrls.has(oldA.url)) {
                  await client
                    .from("media_assets")
                    .update({ case_study_id: null, case_study_slug: null })
                    .eq("id", oldA.id);
                }
              }
            }
          } catch (unlinkErr) {
            console.warn("[BetroDB] Media unlink check notice:", unlinkErr);
          }

          // Upsert current assets without creating duplicate rows
          for (let i = 0; i < currentAssets.length; i++) {
            const a = currentAssets[i];
            if (!a || !a.url) continue;

            const stPath = extractStoragePath(a.url, a.storage_path || a.storagePath);

            // Reuse existing record ID for this URL to avoid duplicates
            let targetId = a.id;
            try {
              const { data: existingRecords } = await client
                .from("media_assets")
                .select("id")
                .eq("url", a.url)
                .limit(1);
              if (existingRecords && existingRecords.length > 0) {
                targetId = existingRecords[0].id;
              }
            } catch (findErr) { }

            const assetRow = {
              id: targetId || `media-${savedCS.id}-${a.type || 'image'}-${i}`,
              case_study_id: savedCS.id,
              case_study_slug: savedCS.slug,
              type: a.type || "image",
              target_section: a.target_section || "creative_showcase",
              url: a.url,
              storage_path: stPath,
              name: a.name || `Asset ${i + 1}`,
              size: a.size || "Optimized",
              display_order: typeof a.display_order === "number" ? a.display_order : i,
              status: a.status || "published",
              updated_at: new Date().toISOString()
            };

            try {
              await client
                .from("media_assets")
                .upsert(assetRow, { onConflict: "id" });
            } catch (assetErr) {
              console.warn(`[BetroDB] Asset upsert notice for ${a.url}:`, assetErr);
            }
          }
        }

        // Invalidate local caches and broadcast sync
        safeStorage.remove("betro_media_assets");
        this.broadcastChange("CASE_STUDY_UPDATED", savedCS);

        return { success: true, data: savedCS };
      } catch (err) {
        console.error("[BetroDB] Save case study cloud exception:", err);
        return { success: true, data: mapped, warning: `Saved locally (${err.message})` };
      }
    },

    /**
     * Reorder Case Studies in batch and persist to Supabase & local storage
     */
    async reorderCaseStudies(list) {
      if (!Array.isArray(list) || list.length === 0) return { success: true };

      const normalized = list.map((item, idx) => ({
        ...item,
        sortOrder: idx,
        sort_order: idx,
        displayOrder: idx,
        display_order: idx
      }));

      // 1. Immediately update local cache & broadcast
      safeStorage.set("betro_casestudies_cache", normalized);
      this.broadcastChange("CASE_STUDY_UPDATED", normalized);

      const client = await this.ensureInit();
      if (!client) {
        return { success: true, warning: "Saved locally (Supabase not connected)" };
      }

      try {
        const updates = normalized.map((item, idx) => ({
          id: item.id,
          slug: item.slug,
          company_name: item.companyName || item.title || "Project",
          display_order: idx,
          sort_order: idx,
          updated_at: new Date().toISOString()
        }));

        const { error } = await client
          .from("portfolio_projects")
          .upsert(updates, { onConflict: "id" });

        if (error) {
          // Fallback to display_order only if sort_order column does not exist
          const fallbackUpdates = normalized.map((item, idx) => ({
            id: item.id,
            slug: item.slug,
            company_name: item.companyName || item.title || "Project",
            display_order: idx,
            updated_at: new Date().toISOString()
          }));
          await client.from("portfolio_projects").upsert(fallbackUpdates, { onConflict: "id" });
        }

        return { success: true };
      } catch (err) {
        console.warn("[BetroDB] Reorder cloud exception:", err);
        return { success: true, warning: err.message };
      }
    },

    /**
     * Delete a Case Study from Production Database
     */
    async deleteCaseStudy(id) {
      if (!id) return { success: false, error: "Missing ID" };

      // Ensure deleted ID is tracked in safeStorage so it never reappears
      let deletedCsIds = [];
      try {
        const rawDel = safeStorage.get("betro_deleted_casestudy_ids");
        if (rawDel) deletedCsIds = JSON.parse(rawDel);
      } catch (e) { }
      if (!deletedCsIds.includes(id)) deletedCsIds.push(id);
      safeStorage.set("betro_deleted_casestudy_ids", deletedCsIds);

      // Purge from cache immediately
      try {
        const cached = safeStorage.get("betro_casestudies_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(c => c.id !== id && c.slug !== id);
            safeStorage.set("betro_casestudies_cache", filtered);
          }
        }
      } catch (e) { }

      const client = await this.ensureInit();
      if (!client) {
        this.broadcastChange("CASE_STUDY_DELETED", { id });
        return { success: true };
      }

      try {
        // 1. Cascading cleanup: delete associated media assets from storage and media_assets table
        try {
          const { data: mediaRows } = await client
            .from("media_assets")
            .select("id, storage_path, url")
            .or(`case_study_id.eq.${id},case_study_slug.eq.${id}`);

          if (Array.isArray(mediaRows) && mediaRows.length > 0) {
            const bucket = cleanBucket(activeConfig.storageBucket || DEFAULT_BUCKET);
            const otherBucket = bucket === "betodata" ? "portfolio-media" : "betodata";
            const pathsToRemove = mediaRows
              .map(m => m.storage_path)
              .filter(p => !!p);

            if (pathsToRemove.length > 0) {
              await client.storage.from(bucket).remove(pathsToRemove);
              await client.storage.from(otherBucket).remove(pathsToRemove);
            }

            await client
              .from("media_assets")
              .delete()
              .or(`case_study_id.eq.${id},case_study_slug.eq.${id}`);
          }
        } catch (mediaErr) {
          console.warn("[BetroDB] Media cascade cleanup notice:", mediaErr);
        }

        // 2. Delete the project record from portfolio_projects
        const { error } = await client
          .from("portfolio_projects")
          .delete()
          .or(`id.eq.${id},slug.eq.${id}`);

        if (error) throw error;

        // 3. Purge cached data
        safeStorage.remove("betro_casestudies_cache");
        this.broadcastChange("CASE_STUDY_DELETED", { id });
        return { success: true };
      } catch (err) {
        console.error("[BetroDB] Delete case study error:", err);
        // Even if remote database delete failed, local purge succeeded
        this.broadcastChange("CASE_STUDY_DELETED", { id });
        return { success: true, warning: err.message };
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
          id: `media-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          case_study_id: (caseStudyId && caseStudyId !== "general" && !String(caseStudyId).startsWith("cs-temp")) ? caseStudyId : null,
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

        // Persist record to Supabase media_assets table
        try {
          const { error: insErr } = await client
            .from("media_assets")
            .insert([structuredAsset]);

          if (insErr) {
            if (insErr.code === "23503" && structuredAsset.case_study_id) {
              // Foreign key violation fallback: store with case_study_id = null
              structuredAsset.case_study_id = null;
              await client.from("media_assets").insert([structuredAsset]);
            } else {
              console.warn("[BetroDB] media_assets insert warning:", insErr.message);
            }
          }
        } catch (dbErr) {
          console.warn("[BetroDB] Could not insert to media_assets:", dbErr);
        }

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
    async deleteMedia(storagePath, assetId = null, url = null, options = {}) {
      const pathToDel = extractStoragePath(url, storagePath);

      // 1. Permanently record in deleted blacklist so it NEVER reappears
      try {
        let delList = [];
        const raw = safeStorage.get("betro_deleted_media_ids");
        if (raw) delList = JSON.parse(raw);
        if (!Array.isArray(delList)) delList = [];
        if (assetId && !delList.includes(assetId)) delList.push(assetId);
        if (url && !delList.includes(url)) delList.push(url);
        if (pathToDel && !delList.includes(pathToDel)) delList.push(pathToDel);
        safeStorage.set("betro_deleted_media_ids", delList);
      } catch (e) { }

      // 2. Remove from local cache immediately
      try {
        const local = safeStorage.get("betro_media_assets");
        if (local) {
          let parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            parsed = parsed.filter(a => a.id !== assetId && a.url !== url && a.storage_path !== pathToDel);
            safeStorage.set("betro_media_assets", parsed);
          }
        }
        this.broadcastChange("MEDIA_DELETED", { id: assetId, storagePath: pathToDel, url });
      } catch (e) { }

      const client = await this.ensureInit();
      if (!client) return { success: true, warning: "Deleted locally (Supabase client offline)" };

      try {
        // Remove storage object if applicable and not skipped
        if (pathToDel && !options.skipStorageDelete) {
          const bucket = cleanBucket(activeConfig.storageBucket || DEFAULT_BUCKET);
          const otherBucket = bucket === "betodata" ? "portfolio-media" : "betodata";
          try {
            await client.storage.from(bucket).remove([pathToDel]);
          } catch (stErr) {
            console.warn("[BetroDB] Storage remove notice (bucket):", stErr);
          }
          try {
            await client.storage.from(otherBucket).remove([pathToDel]);
          } catch (stErr2) { }
        }

        // Delete from media_assets table
        if (assetId) {
          const { error: errId } = await client.from("media_assets").delete().eq("id", assetId);
          if (errId) console.warn("[BetroDB] Delete by ID notice:", errId.message);
        }
        if (url) {
          const { error: errUrl } = await client.from("media_assets").delete().eq("url", url);
          if (errUrl) console.warn("[BetroDB] Delete by URL notice:", errUrl.message);
        }

        safeStorage.remove("betro_media_assets");
        safeStorage.remove("betro_casestudies_cache");
        return { success: true };
      } catch (e) {
        console.warn("[BetroDB] Cloud media delete notice:", e);
        return { success: true, warning: "Deleted locally. Cloud sync pending: " + (e.message || "Host unreachable") };
      }
    },

    /**
     * Retrieve all media assets from Supabase cloud
     */
    async getAllMediaAssets(options = {}) {
      let deletedIds = [];
      try {
        const rawDel = safeStorage.get("betro_deleted_media_ids");
        if (rawDel) deletedIds = JSON.parse(rawDel);
        if (!Array.isArray(deletedIds)) deletedIds = [];
      } catch (e) { }

      let list = [];
      const client = await this.ensureInit();
      if (client) {
        try {
          const { data, error } = await client
            .from("media_assets")
            .select("*")
            .order("created_at", { ascending: false });

          if (!error && Array.isArray(data)) {
            list = data;
          }
        } catch (e) {
          console.warn("[BetroDB] Cloud media fetch notice:", e);
        }
      }

      if (!list || list.length === 0) {
        const local = safeStorage.get("betro_media_assets");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) list = parsed;
          } catch (e) { }
        }
      }

      // Strict filter out any deleted assets
      if (deletedIds.length > 0 && Array.isArray(list)) {
        list = list.filter(a => !deletedIds.includes(a.id) && !deletedIds.includes(a.url) && !deletedIds.includes(a.storage_path));
      }

      // Deduplicate by URL
      const seen = new Set();
      const unique = [];
      for (const item of list) {
        if (!item || !item.url) continue;
        if (seen.has(item.url)) continue;
        seen.add(item.url);
        unique.push(item);
      }
      return unique;
    },
    /**
     * Fetch authoritative brand logos from Supabase with offline fallback
     */
    async getBrandLogos(options = {}) {
      let deletedIds = [];
      try {
        const rawDel = safeStorage.get("betro_deleted_brand_ids");
        if (rawDel) deletedIds = JSON.parse(rawDel);
        if (!Array.isArray(deletedIds)) deletedIds = [];
      } catch (e) { }

      let list = null;
      const client = await this.ensureInit();
      if (client) {
        try {
          const { data, error } = await client
            .from("brand_logos")
            .select("*")
            .order("display_order", { ascending: true });

          if (!error && Array.isArray(data) && data.length > 0) {
            list = data.map((row, idx) => ({
              id: row.id,
              name: row.name || row.company_name || "Brand Logo",
              companyName: row.company_name || row.name || "Brand Logo",
              companyId: row.company_id || row.id,
              src: row.src,
              style: row.style || "",
              visible: row.visible !== false,
              order: typeof row.display_order === "number" ? row.display_order : (typeof row.sort_order === "number" ? row.sort_order : idx + 1)
            }));
            safeStorage.set("betro_brands", list);
          }
        } catch (e) {
          console.warn("[BetroDB] Cloud brand fetch notice:", e);
        }
      }

      if (!list || list.length === 0) {
        const stored = safeStorage.get("betro_brands");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              list = parsed;
            }
          } catch (e) { }
        }
      }

      if (!list || list.length === 0) {
        list = [
          { id: "brand-6", name: "Nahdi Mandi Restaurant", companyName: "Nahdi Mandi Restaurant", companyId: "nahdi-mandi", src: "images/Nahdimandi-white.png", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/Nahdimandi-white.png", visible: true, order: 1 },
          { id: "brand-8", name: "Soofi Mandi", companyName: "Soofi Mandi", companyId: "soofi-mandi", src: "images/Soofimandi-white.png", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/Soofimandi-white.png", visible: true, order: 2 },
          { id: "brand-mylaban", name: "MyLaban", companyName: "MyLaban", companyId: "mylaban", src: "images/mylaban-logo.svg", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/mylaban-logo.svg", visible: true, order: 3 },
          { id: "brand-haihyrah", name: "Haihyrah", companyName: "Haihyrah", companyId: "haihyrah", src: "images/haihyrah.svg", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/haihyrah.svg", visible: true, order: 4 },
          { id: "brand-jamia-nadwiya", name: "Jamia Nadwiya Edavanna", companyName: "Jamia Nadwiya Edavanna", companyId: "jamia-nadwiya-edavanna", src: "images/jamia-nadwiya.svg", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/jamia-nadwiya.svg", visible: true, order: 5 },
          { id: "brand-convex-fitness", name: "Convex Fitness", companyName: "Convex Fitness", companyId: "convex-fitness", src: "images/convex-fitness.svg", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/convex-fitness.svg", visible: true, order: 6 },
          { id: "brand-7", name: "Nice Mobiles", companyName: "Nice Mobiles", companyId: "nice-mobiles", src: "images/NiceMobiles.png", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/NiceMobiles.png", visible: true, order: 7 },
          { id: "brand-4", name: "Alain Architecture", companyName: "Alain Architecture", companyId: "alain-architecture", src: "images/AlainArchitecture.png", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/AlainArchitecture.png", visible: true, order: 8 },
          { id: "brand-gourmet-cloud", name: "Gourmet Cloud Kitchen", companyName: "Gourmet Cloud Kitchen", companyId: "gourmet-cloud-kitchen", src: "images/gourmet-cloud.svg", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/gourmet-cloud.svg", visible: true, order: 9 },
          { id: "brand-2", name: "CelesteHive", companyName: "Celes Lifestyle", companyId: "celes", src: "images/celes.png", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/celes.png", visible: true, order: 10 },
          { id: "brand-3", name: "Toi Cafe", companyName: "Toi Cafe", companyId: "toi-cafe", src: "images/toi.png", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/toi.png", style: "width: 40%;", visible: true, order: 11 },
          { id: "brand-12", name: "Al-Khaleej Tours & Travels", companyName: "Al-Khaleej Tours & Travels", companyId: "al-khaleej", src: "images/Picsart_25-09-24_21-31-47-226.png", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/Picsart_25-09-24_21-31-47-226.png", visible: true, order: 12 },
          { id: "brand-zufra", name: "Zufra Restaurant", companyName: "Zufra Restaurant", companyId: "zufra-restauren", src: "images/zufra.svg", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/zufra.svg", visible: true, order: 13 },
          { id: "brand-1", name: "Sa-Adiya Golden Jubilee", companyName: "Sa-Adiya Golden Jubilee", companyId: "sa-adiya", src: "images/golden.png", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/golden.png", visible: true, order: 14 },
          { id: "brand-5", name: "Gurumitra Foundation", companyName: "Gurumitra Foundation", companyId: "gurumitra", src: "images/Gurumitra.png", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/Gurumitra.png", visible: true, order: 15 },
          { id: "brand-9", name: "Key Factory", companyName: "Key Factory", companyId: "key-factory", src: "images/KeyFactory.png", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/KeyFactory.png", visible: true, order: 16 },
          { id: "brand-10", name: "ENGO", companyName: "ENGO", companyId: "engo", src: "images/ENGO FINAL LOGO-01.png", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/ENGO_FINAL_LOGO-01.png", visible: true, order: 17 },
          { id: "brand-11", name: "EduCart", companyName: "EduCart", companyId: "educart", src: "images/Artboard 5.png", fallbackSrc: "https://fvbauhcwshgqboakeiux.supabase.co/storage/v1/object/public/betodata/brands/Artboard_5.png", visible: true, order: 18 }
        ];
        safeStorage.set("betro_brands", list);
      }

      if (deletedIds.length > 0 && Array.isArray(list)) {
        list = list.filter(b => !deletedIds.includes(b.id));
      }

      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      return list;
    },

    /**
     * Save brand logos permanently in Supabase & broadcast live sync
     */
    async saveBrandLogos(brandList, deletedIds = []) {
      if (!Array.isArray(brandList)) return { success: false, error: "Invalid brands list" };

      // 1. Immediately persist to shared local storage cache
      safeStorage.set("betro_brands", brandList);
      if (Array.isArray(deletedIds) && deletedIds.length > 0) {
        safeStorage.set("betro_deleted_brand_ids", deletedIds);
      }

      // 2. Broadcast change across all open windows & tabs
      this.broadcastChange("brands_updated", { count: brandList.length, timestamp: Date.now() });
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("betro_storage_updated", { detail: { key: "betro_brands" } }));
        }
      } catch (e) { }

      // 3. Authoritative Cloud Database Sync (Supabase)
      const client = await this.ensureInit();
      if (!client) {
        return { success: true, warning: "Saved locally (Supabase offline)" };
      }

      try {
        if (Array.isArray(deletedIds) && deletedIds.length > 0) {
          await client.from("brand_logos").delete().in("id", deletedIds);
        }

        const upsertRows = brandList.map((b, idx) => ({
          id: b.id,
          name: b.name || b.companyName || "Brand Logo",
          company_name: b.companyName || b.name || "Brand Logo",
          company_id: b.companyId || b.id || "brand",
          src: b.src,
          style: b.style || "",
          visible: b.visible !== false,
          display_order: idx + 1,
          sort_order: idx + 1,
          updated_at: new Date().toISOString()
        }));

        const { error } = await client.from("brand_logos").upsert(upsertRows, { onConflict: "id" });
        if (error) {
          console.warn("[BetroDB] Brand logos upsert warning:", error);
          return { success: true, warning: "Saved locally (" + error.message + ")" };
        }
        return { success: true };
      } catch (e) {
        console.warn("[BetroDB] Cloud brand logos save notice:", e);
        return { success: true, warning: "Saved locally. Cloud sync pending: " + (e.message || "Host unreachable") };
      }
    },
  };




  // Expose to window
  window.BetroDB = BetroDB;

  // Auto-init on script load
  BetroDB.ensureInit();

})(window);
