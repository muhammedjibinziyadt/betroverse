/**
 * Betroverse - Admin Dashboard Javascript (Local Storage Version)
 * Handles authentication, local content management (portfolio/brands),
 * and theme toggles.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Preloader element helper
  const hidePreloader = () => {
    const preloader = document.getElementById("admin-preloader");
    if (preloader) {
      preloader.classList.add("hide");
    }
  };

  // Default brand logos
  const defaultBrands = [
    { id: "brand-1", src: "images/golden.png" },
    { id: "brand-2", src: "images/celes.png" },
    { id: "brand-3", src: "images/toi.png", style: "width: 40%;" },
    { id: "brand-4", src: "images/AlainArchitecture.png" },
    { id: "brand-5", src: "images/Gurumitra.png" },
    { id: "brand-6", src: "images/Nahdimandi-white.png" },
    { id: "brand-7", src: "images/NiceMobiles.png" },
    { id: "brand-8", src: "images/Soofimandi-white.png" },
    { id: "brand-9", src: "images/KeyFactory.png" },
    { id: "brand-10", src: "images/ENGO FINAL LOGO-01.png" },
    { id: "brand-11", src: "images/Artboard 5.png" },
    { id: "brand-12", src: "images/Picsart_25-09-24_21-31-47-226.png" }
  ];

  // Default portfolio projects
  const defaultProjects = [
    { id: "proj-1", src: "images/p1.jpg" },
    { id: "proj-2", src: "images/p2.jpg" },
    { id: "proj-3", src: "images/p3.jpg" },
    { id: "proj-4", src: "images/p4.jpg" },
    { id: "proj-5", src: "images/p5.jpg" },
    { id: "proj-6", src: "images/p6.jpg" },
    { id: "proj-7", src: "images/p7.jpg" },
    { id: "proj-8", src: "images/p8.jpg" },
    { id: "proj-9", src: "images/s1.jpg" },
    { id: "proj-10", src: "images/s2.jpg" },
    { id: "proj-11", src: "images/s3.jpg" },
    { id: "proj-12", src: "images/s4.jpg" },
    { id: "proj-13", src: "images/s5.jpg" },
    { id: "proj-14", src: "images/s6.jpg" },
    { id: "proj-15", src: "images/s7.jpg" },
    { id: "proj-16", src: "images/s8.jpg" }
  ];

  // --- Views Navigation ---
  const showView = (viewId) => {
    const loginV = document.getElementById("login-view");
    const dashV = document.getElementById("dashboard-view");
    if (loginV) {
      if (viewId === "login-view") loginV.classList.remove("hidden");
      else loginV.classList.add("hidden");
    }
    if (dashV) {
      if (viewId === "dashboard-view") dashV.classList.remove("hidden");
      else dashV.classList.add("hidden");
    }
  };

  // Guarantee preloader hide fallback
  setTimeout(hidePreloader, 500);

  // --- Auth State Check ---
  let checkAuth = () => {
    const isLoggedIn = localStorage.getItem("betro_admin_logged_in") === "true";

    if (isLoggedIn) {
      const email = localStorage.getItem("betro_admin_email") || "admin@betroverse.in";
      const displayElem = document.getElementById("user-display-email");
      if (displayElem) displayElem.textContent = email;
      showView("dashboard-view");
      if (typeof renderDashboardOverview === "function") {
        renderDashboardOverview();
      }
      if (typeof renderCaseStudiesTab === "function") {
        renderCaseStudiesTab();
      } else {
        renderContentTab();
      }
    } else {
      showView("login-view");
    }
    hidePreloader();
  };

  // --- Authentication Submit Handlers ---
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const errorAlert = document.getElementById("login-error-alert");
    const submitBtn = e.target.querySelector("button[type='submit']");

    errorAlert.classList.add("hidden");
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing In...";

    setTimeout(() => {
      if (email === "admin@betroverse.in" && password === "admin123") {
        localStorage.setItem("betro_admin_logged_in", "true");
        localStorage.setItem("betro_admin_email", email);
        document.getElementById("user-display-email").textContent = email;
        showView("dashboard-view");
        renderDashboardOverview();
        renderCaseStudiesTab();
      } else {
        errorAlert.classList.remove("hidden");
        errorAlert.querySelector(".alert-message").textContent = "Invalid email or password.";
      }
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }, 400);
  });

  // Sign out button
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("betro_admin_logged_in");
    localStorage.removeItem("betro_admin_email");
    window.location.reload();
  });

  // Settings Logout Button
  const settingsLogoutBtn = document.getElementById("settings-logout-btn");
  if (settingsLogoutBtn) {
    settingsLogoutBtn.addEventListener("click", () => {
      localStorage.removeItem("betro_admin_logged_in");
      localStorage.removeItem("betro_admin_email");
      window.location.reload();
    });
  }

  // --- Gallery & Brands Content Management ---
  const renderContentTab = () => {
    // Load brands
    let brands = [];
    try {
      const stored = localStorage.getItem("betro_brands");
      brands = stored ? JSON.parse(stored) : defaultBrands;
    } catch (e) {
      brands = defaultBrands;
    }

    // Render brands
    const brandsGrid = document.getElementById("admin-brands-grid");
    if (brandsGrid) {
      brandsGrid.innerHTML = "";
      brands.forEach(b => {
        const item = document.createElement("div");
        item.className = "gallery-item";
        item.innerHTML = `
          <img src="${b.src}" alt="Brand Logo">
          <div class="delete-overlay">
            <button class="btn-delete" type="button"><i class="ri-delete-bin-line"></i> Delete</button>
          </div>
        `;
        item.querySelector(".btn-delete").addEventListener("click", () => deleteContentItem("brand", b.id));
        brandsGrid.appendChild(item);
      });
    }

    // Load projects
    let projects = [];
    try {
      const stored = localStorage.getItem("betro_projects");
      projects = stored ? JSON.parse(stored) : defaultProjects;
    } catch (e) {
      projects = defaultProjects;
    }

    // Render projects
    const projectsGrid = document.getElementById("admin-projects-grid");
    if (projectsGrid) {
      projectsGrid.innerHTML = "";
      projects.forEach(p => {
        const item = document.createElement("div");
        item.className = "gallery-item";
        item.innerHTML = `
          <img src="${p.src}" alt="Project Image">
          <div class="delete-overlay">
            <button class="btn-delete" type="button"><i class="ri-delete-bin-line"></i> Delete</button>
          </div>
        `;
        item.querySelector(".btn-delete").addEventListener("click", () => deleteContentItem("project", p.id));
        projectsGrid.appendChild(item);
      });
    }
  };

  // Add brand/project modal helpers
  const uploadModal = document.getElementById("content-upload-modal");
  const modalTitle = document.getElementById("content-modal-title");
  const uploadForm = document.getElementById("content-upload-form");
  const contentTypeInput = document.getElementById("content-type");
  const contentFileInput = document.getElementById("content-file");
  const contentUrlInput = document.getElementById("content-url");
  const fileInputGroup = document.getElementById("file-input-group");
  const urlInputGroup = document.getElementById("url-input-group");
  const previewGroup = document.getElementById("preview-group");
  const uploadPreview = document.getElementById("upload-preview");

  const openUploadModal = (type) => {
    contentTypeInput.value = type;
    modalTitle.textContent = type === "brand" ? "Add Brand Logo" : "Add Project Image";
    uploadForm.reset();
    fileInputGroup.classList.remove("hidden");
    urlInputGroup.classList.add("hidden");
    previewGroup.style.display = "none";
    uploadPreview.src = "";
    uploadModal.classList.remove("hidden");
  };

  // Trigger modals
  const addBrandBtn = document.getElementById("add-brand-btn");
  if (addBrandBtn) addBrandBtn.addEventListener("click", () => openUploadModal("brand"));

  const addProjectBtn = document.getElementById("add-project-btn");
  if (addProjectBtn) addProjectBtn.addEventListener("click", () => openUploadModal("project"));

  const closeUploadBtn = document.getElementById("close-upload-btn");
  if (closeUploadBtn) closeUploadBtn.addEventListener("click", () => uploadModal.classList.add("hidden"));

  // Toggle Source Type
  document.querySelectorAll('input[name="img-source"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "file") {
        fileInputGroup.classList.remove("hidden");
        urlInputGroup.classList.add("hidden");
      } else {
        fileInputGroup.classList.add("hidden");
        urlInputGroup.classList.remove("hidden");
      }
      previewGroup.style.display = "none";
      uploadPreview.src = "";
    });
  });

  // Handle file preview
  if (contentFileInput) {
    contentFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadPreview.src = event.target.result;
          previewGroup.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Handle URL preview
  if (contentUrlInput) {
    contentUrlInput.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      if (val) {
        uploadPreview.src = val;
        previewGroup.style.display = "block";
      } else {
        previewGroup.style.display = "none";
        uploadPreview.src = "";
      }
    });
  }

  // Form Submit Action
  if (uploadForm) {
    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const type = contentTypeInput.value;
      const source = uploadForm.querySelector('input[name="img-source"]:checked').value;

      let imgSrc = "";
      if (source === "file") {
        imgSrc = uploadPreview.src;
        if (!imgSrc) {
          alert("Please select an image file first.");
          return;
        }
      } else {
        imgSrc = contentUrlInput.value.trim();
        if (!imgSrc) {
          alert("Please enter a valid remote image URL.");
          return;
        }
      }

      // Save to local storage
      if (type === "brand") {
        const stored = localStorage.getItem("betro_brands");
        const list = stored ? JSON.parse(stored) : [...defaultBrands];
        list.unshift({ id: "brand-" + Date.now(), src: imgSrc });
        localStorage.setItem("betro_brands", JSON.stringify(list));
      } else {
        const stored = localStorage.getItem("betro_projects");
        const list = stored ? JSON.parse(stored) : [...defaultProjects];
        list.unshift({ id: "proj-" + Date.now(), src: imgSrc });
        localStorage.setItem("betro_projects", JSON.stringify(list));
      }

      uploadModal.classList.add("hidden");
      renderContentTab();
    });
  }

  // Delete Content Item
  const deleteContentItem = (type, itemId) => {
    if (!confirm(`Are you sure you want to remove this ${type === "brand" ? "brand logo" : "project image"}?`)) return;

    if (type === "brand") {
      const stored = localStorage.getItem("betro_brands");
      let list = stored ? JSON.parse(stored) : [...defaultBrands];
      list = list.filter(item => item.id !== itemId);
      localStorage.setItem("betro_brands", JSON.stringify(list));
    } else {
      const stored = localStorage.getItem("betro_projects");
      let list = stored ? JSON.parse(stored) : [...defaultProjects];
      list = list.filter(item => item.id !== itemId);
      localStorage.setItem("betro_projects", JSON.stringify(list));
    }

    renderContentTab();
  };

  // --- CENTRAL MEDIA MANAGEMENT SYSTEM ---
  const defaultMediaAssets = [
    { id: "asset-1", name: "logo.png", type: "image", folder: "logos", size: "24 KB", url: "images/logo.png", date: "Default" },
    { id: "asset-2", name: "p1.jpg", type: "image", folder: "banners", size: "142 KB", url: "images/p1.jpg", date: "Default" },
    { id: "asset-3", name: "p2.jpg", type: "image", folder: "showcase", size: "180 KB", url: "images/p2.jpg", date: "Default" },
    { id: "asset-4", name: "p3.jpg", type: "image", folder: "showcase", size: "165 KB", url: "images/p3.jpg", date: "Default" },
    { id: "asset-5", name: "p4.jpg", type: "image", folder: "showcase", size: "190 KB", url: "images/p4.jpg", date: "Default" },
    { id: "asset-6", name: "p5.jpg", type: "image", folder: "showcase", size: "155 KB", url: "images/p5.jpg", date: "Default" },
    { id: "asset-7", name: "s1.jpg", type: "image", folder: "showcase", size: "110 KB", url: "images/s1.jpg", date: "Default" },
    { id: "asset-8", name: "golden.png", type: "image", folder: "logos", size: "35 KB", url: "images/golden.png", date: "Default" },
    { id: "asset-9", name: "celes.png", type: "image", folder: "logos", size: "28 KB", url: "images/celes.png", date: "Default" },
    { id: "asset-10", name: "toi.png", type: "image", folder: "logos", size: "30 KB", url: "images/toi.png", date: "Default" },
    { id: "asset-11", name: "NiceMobiles.png", type: "image", folder: "logos", size: "32 KB", url: "images/NiceMobiles.png", date: "Default" },
    { id: "asset-12", name: "Picsart_25-09-24_21-31-47-226.png", type: "image", folder: "logos", size: "45 KB", url: "images/Picsart_25-09-24_21-31-47-226.png", date: "Default" }
  ];

  // ==========================================
  // INDEXEDDB HIGH-CAPACITY STORAGE ENGINE (Unlimited GB Storage)
  // ==========================================
  const BetroStorage = {
    dbName: "BetroverseMediaDB",
    dbVersion: 1,
    db: null,
    cache: {},

    init() {
      return new Promise((resolve) => {
        if (this.db) return resolve(this.db);
        if (!window.indexedDB) return resolve(null);
        try {
          const req = indexedDB.open(this.dbName, this.dbVersion);
          req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("app_store")) {
              db.createObjectStore("app_store");
            }
          };
          req.onsuccess = (e) => {
            this.db = e.target.result;
            resolve(this.db);
          };
          req.onerror = () => resolve(null);
        } catch (err) {
          resolve(null);
        }
      });
    },

    invalidateCache(key = null) {
      if (key) delete this.cache[key];
      else this.cache = {};
    },

    setItem(key, value) {
      return new Promise(async (resolve) => {
        this.cache[key] = value;
        // 1. Primary High-Capacity Store: IndexedDB (Gigabytes limit)
        const db = await this.init();
        if (db) {
          try {
            const tx = db.transaction("app_store", "readwrite");
            const store = tx.objectStore("app_store");
            store.put(value, key);
            tx.oncomplete = () => {
              // 2. Safe Secondary Store: LocalStorage (guard against quota exceeded)
              try {
                const str = typeof value === "string" ? value : JSON.stringify(value);
                if (str.length < 2000000) { // Keep under 2MB to prevent QuotaExceededError
                  localStorage.setItem(key, str);
                }
              } catch (lsErr) {
                // Quota safely handled; IndexedDB is the authoritative store
              }
              resolve(true);
            };
            tx.onerror = (e) => {
              console.warn("IndexedDB transaction error:", e);
              resolve(false);
            };
            tx.onabort = () => resolve(false);
          } catch (e) {
            console.warn("IndexedDB set error:", e);
            resolve(false);
          }
        } else {
          try {
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
            resolve(true);
          } catch (e) {
            resolve(false);
          }
        }
      });
    },

    async getItem(key) {
      if (this.cache[key] !== undefined) return this.cache[key];
      const db = await this.init();
      if (db) {
        try {
          const val = await new Promise((resolve) => {
            const tx = db.transaction("app_store", "readonly");
            const req = tx.objectStore("app_store").get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
          });
          if (val !== undefined && val !== null) {
            this.cache[key] = val;
            return val;
          }
        } catch (e) { }
      }

      const ls = localStorage.getItem(key);
      if (ls) {
        try {
          const parsed = JSON.parse(ls);
          this.cache[key] = parsed;
          return parsed;
        } catch (e) {
          return ls;
        }
      }
      return null;
    },

    getItemSync(key) {
      if (this.cache[key] !== undefined) return this.cache[key];
      const ls = localStorage.getItem(key);
      if (!ls) return null;
      try {
        const parsed = JSON.parse(ls);
        this.cache[key] = parsed;
        return parsed;
      } catch (e) {
        return ls;
      }
    }
  };

  // Structured Media Asset Normalizer
  const normalizeMediaAsset = (item, caseStudyId, caseStudySlug, type = "image", section = "creative_showcase", index = 0) => {
    if (!item) return null;
    const isObj = typeof item === "object" && item !== null;
    const url = isObj ? (item.url || item.src || "") : String(item);
    const defaultName = url.startsWith("data:") ? `${type}_${index + 1}` : (url.split("/").pop() || "media_asset");

    return {
      id: (isObj && item.id) ? item.id : `media-${caseStudyId || "cs"}-${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      case_study_id: (isObj && item.case_study_id) ? item.case_study_id : (caseStudyId || "cs-general"),
      case_study_slug: (isObj && item.case_study_slug) ? item.case_study_slug : (caseStudySlug || "general"),
      type: (isObj && item.type) ? item.type : type,
      target_section: (isObj && item.target_section) ? item.target_section : section,
      url: url,
      display_order: (isObj && typeof item.display_order === "number") ? item.display_order : index,
      status: (isObj && item.status) ? item.status : "published",
      name: (isObj && item.name) ? item.name : defaultName,
      size: (isObj && item.size) ? item.size : "Optimized",
      created_at: (isObj && item.created_at) ? item.created_at : Date.now(),
      updated_at: Date.now()
    };
  };

  // Auto-migration for existing portfolio media records
  const migrateExistingPortfolioMedia = async (caseStudies) => {
    if (!Array.isArray(caseStudies) || caseStudies.length === 0) return caseStudies;
    let modified = false;

    const migrated = caseStudies.map(cs => {
      if (!cs || !cs.id) return cs;
      const slug = cs.slug || cs.id.replace("cs-", "");
      let gallery = (cs.media && Array.isArray(cs.media.gallery)) ? cs.media.gallery : [];
      let videos = (cs.media && Array.isArray(cs.media.videos)) ? cs.media.videos : [];
      let assets = (cs.media && Array.isArray(cs.media.assets)) ? cs.media.assets : [];

      // Clean out hard-coded demo Rickroll embeds
      const cleanVideos = videos.filter(v => {
        const url = typeof v === "string" ? v : (v ? v.url : "");
        return url && !url.includes("dQw4w9WgXcQ");
      });
      if (cleanVideos.length !== videos.length) {
        videos = cleanVideos;
        modified = true;
      }

      // If structured assets are missing, build them from gallery and videos
      if (assets.length === 0 && (gallery.length > 0 || videos.length > 0)) {
        const newAssets = [];
        gallery.forEach((img, idx) => {
          const norm = normalizeMediaAsset(img, cs.id, slug, "image", "creative_showcase", idx);
          if (norm && norm.url) newAssets.push(norm);
        });
        videos.forEach((vid, idx) => {
          const norm = normalizeMediaAsset(vid, cs.id, slug, "video", "video_showcase", idx);
          if (norm && norm.url) newAssets.push(norm);
        });
        cs.media = {
          ...(cs.media || {}),
          gallery: gallery.map(g => typeof g === "string" ? g : g.url),
          videos: videos.map(v => typeof v === "string" ? v : v.url),
          assets: newAssets
        };
        modified = true;
      }
      return cs;
    });

    if (modified) {
      await BetroStorage.setItem("betro_casestudies", migrated);
    }
    return migrated;
  };

  // Pre-warm storage cache from IndexedDB on initial load
  BetroStorage.init().then(() => {
    BetroStorage.getItem("betro_media_assets").then(assets => {
      if (assets && Array.isArray(assets)) {
        BetroStorage.cache["betro_media_assets"] = assets;
        if (typeof renderMediaLibraryTab === "function") renderMediaLibraryTab();
      }
    });
    BetroStorage.getItem("betro_casestudies").then(async csList => {
      if (csList && Array.isArray(csList) && csList.length > 0) {
        const migrated = await migrateExistingPortfolioMedia(csList);
        BetroStorage.cache["betro_casestudies"] = migrated;
        if (typeof renderCaseStudiesTab === "function") renderCaseStudiesTab();
      }
    });
  });

  const getMediaAssets = () => {
    const cached = BetroStorage.cache["betro_media_assets"];
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;

    const storedSync = BetroStorage.getItemSync("betro_media_assets");
    if (storedSync && Array.isArray(storedSync) && storedSync.length > 0) {
      BetroStorage.cache["betro_media_assets"] = storedSync;
      return storedSync;
    }
    return defaultMediaAssets;
  };

  const saveMediaAssets = (assets) => {
    BetroStorage.cache["betro_media_assets"] = assets;
    BetroStorage.setItem("betro_media_assets", assets);
  };

  // --- REAL-TIME UPLOAD ENGINE & IMAGE OPTIMIZATION ---

  // Toast Notification System
  const showAdminToast = (message, type = "success", duration = 4500) => {
    let container = document.getElementById("admin-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "admin-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `admin-toast ${type}`;

    let icon = "ri-checkbox-circle-fill";
    if (type === "success") {
      toast.style.background = "rgba(16, 185, 129, 0.95)";
      toast.style.borderColor = "rgba(16, 185, 129, 0.5)";
      icon = "ri-checkbox-circle-fill";
    } else if (type === "error") {
      toast.style.background = "rgba(239, 68, 68, 0.95)";
      toast.style.borderColor = "rgba(239, 68, 68, 0.5)";
      icon = "ri-error-warning-fill";
    } else if (type === "info" || type === "processing") {
      toast.style.background = "rgba(59, 130, 246, 0.95)";
      toast.style.borderColor = "rgba(59, 130, 246, 0.5)";
      icon = "ri-loader-4-line ri-spin";
    }

    toast.innerHTML = `<i class="${icon}" style="font-size: 1.25rem;"></i> <span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = "translateX(0)";
      toast.style.opacity = "1";
    });

    setTimeout(() => {
      toast.style.transform = "translateX(120%)";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // Image Optimizer Engine (Supports any aspect ratio, resizes max 1400px, 0.78 quality WebP compression)
  const optimizeImageFile = (file) => {
    return new Promise((resolve) => {
      if (file.type === "image/svg+xml" || file.name.endsWith(".svg")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ dataUrl: e.target.result, sizeKb: (file.size / 1024).toFixed(0) + " KB" });
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1400; // Crisp full-HD max resolution
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const outputType = file.type === "image/png" && width < 600 ? "image/png" : "image/webp";
          const dataUrl = canvas.toDataURL(outputType, 0.78);

          const base64Len = dataUrl.length - (dataUrl.indexOf(',') + 1);
          const sizeInBytes = Math.ceil(base64Len * 0.75);
          const sizeKb = (sizeInBytes / 1024).toFixed(0) + " KB";

          resolve({ dataUrl, sizeKb });
        };
        img.onerror = () => {
          resolve({ dataUrl: e.target.result, sizeKb: (file.size / 1024).toFixed(0) + " KB" });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Robust Upload Engine with Supabase Storage Cloud Integration
  const uploadMediaFile = async (file, folder = "showcase", onProgress = null) => {
    if (!file) throw new Error("No file selected.");

    const ext = file.name.split('.').pop().toLowerCase();
    const validImages = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
    const validVideos = ['mp4', 'webm', 'mov'];
    const validDocs = ['pdf'];

    let fileType = "unknown";
    if (validImages.includes(ext)) fileType = "image";
    else if (validVideos.includes(ext)) fileType = "video";
    else if (validDocs.includes(ext)) fileType = "pdf";
    else {
      const err = `Unsupported file format (.${ext}). Supported: JPG, JPEG, PNG, WEBP, SVG, MP4, WEBM, MOV, PDF.`;
      showAdminToast(err, "error", 5000);
      if (onProgress) onProgress({ status: "error", pct: 0, text: `Unsupported format (.${ext})` });
      throw new Error(err);
    }

    const maxBytes = 50 * 1024 * 1024; // 50MB limit
    if (file.size > maxBytes) {
      const err = `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 50MB limit.`;
      showAdminToast(err, "error", 5000);
      if (onProgress) onProgress({ status: "error", pct: 0, text: "File Too Large (>50MB)" });
      throw new Error(err);
    }

    const currentCsId = document.getElementById("cs-edit-id")?.value || "general";
    const currentSlug = document.getElementById("cs-slug")?.value || "project";

    // 1. If Supabase is configured, upload directly to Supabase Storage bucket
    if (window.BetroDB && BetroDB.isConfigured()) {
      try {
        if (onProgress) onProgress({ status: "uploading", pct: 20, text: `Uploading "${file.name}" to Supabase Storage...` });

        const asset = await BetroDB.uploadMedia(file, {
          folder: folder,
          caseStudyId: currentCsId,
          slug: currentSlug,
          onProgress: onProgress
        });

        const assets = getMediaAssets();
        assets.unshift(asset);
        await saveMediaAssets(assets);
        renderMediaLibraryTab();

        showAdminToast(`Uploaded "${file.name}" to Cloud Storage!`, "success");
        return asset;
      } catch (cloudErr) {
        console.error("Cloud storage upload error:", cloudErr);
        const errMsg = cloudErr.message || "Cloud storage upload failed";
        if (onProgress) onProgress({ status: "error", pct: 0, text: errMsg });
        showAdminToast("Upload Error: " + errMsg, "error", 6000);
        throw cloudErr;
      }
    }

    // 2. Safe Fallback buffer if Supabase credentials are not yet entered
    if (onProgress) onProgress({ status: "uploading", pct: 30, text: "Reading file (Local Fallback)..." });

    let dataUrl = "";
    let sizeKb = (file.size / 1024).toFixed(0) + " KB";

    if (fileType === "image") {
      if (onProgress) onProgress({ status: "processing", pct: 65, text: "Optimizing image..." });
      const optimized = await optimizeImageFile(file);
      dataUrl = optimized.dataUrl;
      sizeKb = optimized.sizeKb;
    } else {
      if (onProgress) onProgress({ status: "uploading", pct: 75, text: "Processing media..." });
      dataUrl = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
    }

    if (onProgress) onProgress({ status: "saving", pct: 90, text: "Saving to local buffer..." });

    const newAsset = {
      id: "asset-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      name: file.name,
      type: fileType,
      folder: folder,
      size: sizeKb,
      url: dataUrl,
      date: new Date().toLocaleDateString()
    };

    const assets = getMediaAssets();
    assets.unshift(newAsset);
    await saveMediaAssets(assets);
    renderMediaLibraryTab();

    if (onProgress) onProgress({ status: "success", pct: 100, text: "Saved locally (Connect Supabase in Settings for live cloud CDN)" });
    showAdminToast(`File buffered locally. Connect Supabase in Settings for production.`, "info", 5000);
    return newAsset;
  };

  // Render Central Media Library Tab Panel
  let currentMediaTypeFilter = "all";
  const renderMediaLibraryTab = async () => {
    const grid = document.getElementById("media-library-grid");
    if (!grid) return;

    if (window.BetroDB && BetroDB.isConfigured()) {
      try {
        const cloudAssets = await BetroDB.getAllMediaAssets();
        if (cloudAssets && cloudAssets.length > 0) {
          BetroStorage.cache["betro_media_assets"] = cloudAssets;
        }
      } catch (e) {
        console.warn("[MediaLibrary] Cloud assets load error:", e);
      }
    }

    let assets = getMediaAssets();
    const searchVal = (document.getElementById("media-library-search")?.value || "").toLowerCase().trim();
    const folderVal = document.getElementById("media-folder-filter")?.value || "all";

    if (searchVal) {
      assets = assets.filter(a => a.name.toLowerCase().includes(searchVal) || a.folder.toLowerCase().includes(searchVal));
    }

    if (currentMediaTypeFilter !== "all") {
      assets = assets.filter(a => a.type === currentMediaTypeFilter);
    }

    if (folderVal !== "all") {
      assets = assets.filter(a => a.folder === folderVal);
    }

    grid.innerHTML = "";

    if (assets.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-secondary);">No media assets found. Drag and drop files above to upload!</div>`;
      return;
    }

    assets.forEach(asset => {
      const card = document.createElement("div");
      card.className = "media-asset-card";

      let thumbHtml = "";
      if (asset.type === "image") {
        thumbHtml = `<img src="${asset.url}" alt="${asset.name}">`;
      } else if (asset.type === "video") {
        thumbHtml = `<video src="${asset.url}" muted></video>`;
      } else {
        thumbHtml = `<i class="ri-file-pdf-fill doc-icon"></i>`;
      }

      card.innerHTML = `
        <div class="media-asset-thumb">
          ${thumbHtml}
        </div>
        <div class="media-asset-info">
          <div class="media-asset-name" title="${asset.name}">${asset.name}</div>
          <div class="media-asset-meta">
            <span>${asset.type.toUpperCase()}</span>
            <span>${asset.size}</span>
          </div>
        </div>
        <div class="media-asset-actions">
          <button type="button" class="admin-btn secondary-btn copy-url-btn" title="Copy URL"><i class="ri-file-copy-line"></i></button>
          <button type="button" class="admin-btn danger-btn delete-asset-btn" title="Delete"><i class="ri-delete-bin-line"></i></button>
        </div>
      `;

      card.querySelector(".copy-url-btn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(asset.url);
        alert("Asset URL copied to clipboard!");
      });

      card.querySelector(".delete-asset-btn")?.addEventListener("click", () => {
        if (confirm(`Delete asset "${asset.name}"?`)) {
          let list = getMediaAssets();
          list = list.filter(a => a.id !== asset.id);
          saveMediaAssets(list);
          renderMediaLibraryTab();
        }
      });

      grid.appendChild(card);
    });
  };

  // Media Library Tab Events
  const dropzone = document.getElementById("media-library-dropzone");
  const mediaFileInput = document.getElementById("media-library-upload-input");

  if (dropzone) {
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      const files = Array.from(e.dataTransfer.files);
      handleMultiFilesUpload(files);
    });
    dropzone.addEventListener("click", () => mediaFileInput?.click());
  }

  if (mediaFileInput) {
    mediaFileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      handleMultiFilesUpload(files);
    });
  }

  const handleMultiFilesUpload = (files) => {
    if (!files || files.length === 0) return;
    const progressBox = document.getElementById("media-upload-progress");
    const progressFill = document.getElementById("media-upload-progress-fill");
    const progressText = document.getElementById("media-upload-progress-text");

    if (progressBox) progressBox.classList.remove("hidden");

    let completed = 0;
    const total = files.length;

    files.forEach((file) => {
      uploadMediaFile(file)
        .then(() => {
          completed++;
          const pct = Math.round((completed / total) * 100);
          if (progressFill) progressFill.style.width = pct + "%";
          if (progressText) progressText.textContent = `Uploading... ${pct}% (${completed}/${total})`;
          if (completed === total) {
            setTimeout(() => {
              if (progressBox) progressBox.classList.add("hidden");
            }, 800);
          }
        })
        .catch(() => { });
    });
  };

  document.getElementById("media-library-search")?.addEventListener("input", renderMediaLibraryTab);
  document.getElementById("media-folder-filter")?.addEventListener("change", renderMediaLibraryTab);

  document.querySelectorAll(".media-type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".media-type-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentMediaTypeFilter = btn.getAttribute("data-type");
      renderMediaLibraryTab();
    });
  });

  // --- REUSABLE MEDIA PICKER MODAL ---
  const mediaPickerModal = document.getElementById("media-picker-modal");
  const mediaPickerGrid = document.getElementById("media-picker-grid");
  let activePickerCallback = null;

  const openMediaPicker = async (callback) => {
    activePickerCallback = callback;
    if (window.BetroDB && BetroDB.isConfigured()) {
      try {
        const cloudAssets = await BetroDB.getAllMediaAssets();
        if (cloudAssets && cloudAssets.length > 0) {
          BetroStorage.cache["betro_media_assets"] = cloudAssets;
        }
      } catch (e) {
        console.warn("[MediaPicker] Error loading cloud media:", e);
      }
    }
    renderMediaPickerItems();
    mediaPickerModal?.classList.remove("hidden");
  };

  const closeMediaPicker = () => {
    mediaPickerModal?.classList.add("hidden");
    activePickerCallback = null;
  };

  const renderMediaPickerItems = () => {
    if (!mediaPickerGrid) return;
    let assets = getMediaAssets();
    const searchVal = (document.getElementById("picker-search-input")?.value || "").toLowerCase().trim();

    if (searchVal) {
      assets = assets.filter(a => a.name.toLowerCase().includes(searchVal));
    }

    mediaPickerGrid.innerHTML = "";

    assets.forEach(asset => {
      const card = document.createElement("div");
      card.className = "media-asset-card";
      card.style.cursor = "pointer";

      let thumbHtml = asset.type === "image"
        ? `<img src="${asset.url}" alt="${asset.name}">`
        : asset.type === "video" ? `<video src="${asset.url}" muted></video>`
          : `<i class="ri-file-pdf-fill doc-icon"></i>`;

      card.innerHTML = `
        <div class="media-asset-thumb">${thumbHtml}</div>
        <div class="media-asset-info">
          <div class="media-asset-name">${asset.name}</div>
        </div>
      `;

      card.addEventListener("click", () => {
        if (activePickerCallback) activePickerCallback(asset.url);
        closeMediaPicker();
      });

      mediaPickerGrid.appendChild(card);
    });
  };

  document.getElementById("close-media-picker-btn")?.addEventListener("click", closeMediaPicker);
  document.getElementById("cancel-media-picker-btn")?.addEventListener("click", closeMediaPicker);
  document.getElementById("picker-search-input")?.addEventListener("input", renderMediaPickerItems);

  document.getElementById("picker-direct-upload")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadMediaFile(file).then(asset => {
        if (activePickerCallback) activePickerCallback(asset.url);
        closeMediaPicker();
      });
    }
  });


  // --- CASE STUDIES CMS MANAGEMENT & EDITOR ENGINE ---

  // Default seed case studies (fallback when storage is empty, e.g. first visit on GitHub Pages)
  const defaultCaseStudies = [
    {
      id: "cs-mylaban", slug: "mylaban", status: "published",
      companyName: "MyLaban", companyLogo: "images/Picsart_25-09-24_21-31-47-226.png",
      heroImage: "images/p1.jpg", cardImage: "images/p1.jpg",
      category: "Creative Branding & Social Campaign", industry: "Food & Beverage Dessert Lounge",
      clientName: "MyLaban Dessert Shop", year: "2024 - 2025",
      shortIntro: "Specialty dessert shop branding and high-converting social media marketing campaign in Kochi.",
      fullDescription: "MyLaban is a popular dessert shop in Kochi specializing in authentic Egyptian desserts and premium sweet treats. The brand is known for its rich flavors, high-quality ingredients, and beautifully crafted desserts that offer a unique experience for every customer.",
      brandStory: "Started with a passion for authentic Middle Eastern sweet delicacies, MyLaban brought traditional Egyptian dessert recipes to Kochi with a modern culinary twist. The brand needed visual storytelling that reflected its premium ingredients and signature presentation.",
      brandGoals: "Expand brand reach across Kerala, drive store footfall to the Kochi dessert lounge, and establish a viral short-form video presence across Instagram Reels and TikTok.",
      projectObjective: "Craft a comprehensive brand identity, mouth-watering food photography, viral AI video reels, and aesthetic social media campaigns to maximize engagement.",
      services: ["Creative Design", "Social Media Management", "Video Production", "AI Video Creation", "Video Content Creation", "Brand Identity", "Photography"],
      overview: { challenge: "Differentiating MyLaban in a competitive food scene by highlighting unique Egyptian dessert flavors.", strategy: "Developing viral short-form video reels, AI-enhanced food visuals, and aesthetic Instagram layouts.", solution: "Creating mouth-watering video content showcasing signature desserts and authentic preparation techniques.", execution: "Multichannel distribution across Instagram, YouTube Shorts, and local influencer campaigns.", results: "Over 500k video views and a significant surge in store footfall and brand engagement." },
      media: { gallery: ["images/p1.jpg", "images/p5.jpg", "images/s1.jpg"], videos: [], mockups: { desktop: "images/p1.jpg", tablet: "images/p5.jpg", mobile: "images/s1.jpg" } },
      results: { stat1Num: "+500K", stat1Label: "Social Reel Views", stat2Num: "+60%", stat2Label: "Footfall Growth", stat3Num: "4.2x", stat3Label: "ROI Increase", stat4Num: "100%", stat4Label: "Brand Satisfaction", feedbackQuote: "Betroverse completely transformed our video marketing. Their reels and short-form content brought us viral traction and customer engagement!", feedbackAuthor: "MyLaban Founder", feedbackRole: "Kochi Dessert Lounge" },
      seo: { title: "MyLaban Case Study | Creative Branding & Video Production by Betroverse", description: "Explore how Betroverse built viral video campaigns, brand strategy, and social media growth for MyLaban Dessert Shop.", keywords: "MyLaban, dessert branding, video production, Kochi marketing, Betroverse", ogImage: "images/p1.jpg", canonicalUrl: "https://betroverse.in/portfolio/mylaban" }
    },
    {
      id: "cs-sa-adiya", slug: "sa-adiya", status: "published",
      companyName: "Sa-Adiya Golden Jubilee", companyLogo: "images/golden.png",
      heroImage: "images/p2.jpg", cardImage: "images/p2.jpg",
      category: "Event Branding & Celebration Collateral", industry: "Event Branding & Academic Institutions",
      clientName: "Sa-Adiya Foundation", year: "2024 - 2025",
      shortIntro: "Flyers, registration guidelines, and social media announcements for Sa-Adiya's grand Golden Jubilee celebrations.",
      fullDescription: "We designed promotional flyers, registration guidelines, and social media announcements for Sa-Adiya's grand Golden Jubilee celebrations.",
      brandStory: "Celebrating 50 years of educational and community service with a landmark Jubilee convention.",
      brandGoals: "Unify event communication, guide registrations, and create memorable celebratory visuals.",
      projectObjective: "Deliver golden-themed stage graphics, registration notices, and commemorative flyers.",
      services: ["Creative Design", "Social Media Management", "Event Branding", "Print Collateral"],
      overview: { challenge: "Designing elegant, cohesive event branding suitable for a major 50-year celebration.", strategy: "Using golden thematic elements, clear typography, and structured announcement layouts.", solution: "Creating registration notices, event schedules, and ceremonial posters.", execution: "Multichannel distribution via social media platforms and print media flyers.", results: "Widespread community reach and successful event attendance across all sessions." },
      media: { gallery: ["images/p2.jpg"], videos: [], mockups: { desktop: "images/p2.jpg", tablet: "images/p2.jpg", mobile: "images/p2.jpg" } },
      results: { stat1Num: "+100K", stat1Label: "Event Reach", stat2Num: "50 Yrs", stat2Label: "Celebrated Legacy", stat3Num: "100%", stat3Label: "Participation", stat4Num: "100%", stat4Label: "Satisfaction", feedbackQuote: "The Golden Jubilee event banners and flyers designed by Betroverse added immense prestige to our 50-year celebrations.", feedbackAuthor: "Sa-Adiya Jubilee Committee", feedbackRole: "Educational Foundation" },
      seo: { title: "Sa-Adiya Golden Jubilee Case Study | Event Branding by Betroverse", description: "Explore Sa-Adiya's Golden Jubilee event branding.", keywords: "Sa-Adiya, Golden Jubilee, event branding, Betroverse", ogImage: "images/p2.jpg", canonicalUrl: "https://betroverse.in/portfolio/sa-adiya" }
    },
    {
      id: "cs-toi-cafe", slug: "toi-cafe", status: "published",
      companyName: "Toi Cafe", companyLogo: "images/toi.png",
      heroImage: "images/p3.jpg", cardImage: "images/p3.jpg",
      category: "Specialty Cafe & Visual Branding", industry: "Specialty Coffee & Desserts",
      clientName: "Toi Cafe & Dessert Lounge", year: "2024 - 2025",
      shortIntro: "Aesthetic social media campaign, specialty beverage photography, and custom menu layout design.",
      fullDescription: "Toi Cafe is a specialty coffee shop and dessert lounge. We designed a series of aesthetic social media posts, promotional campaigns, and menus to highlight their unique sweet and savory offerings.",
      brandStory: "Toi Cafe was founded to create a warm, aesthetic haven for specialty coffee enthusiasts.",
      brandGoals: "Increase weekend cafe traffic, promote signature cold brews, and establish a cohesive warm-toned visual theme online.",
      projectObjective: "Deliver high-end beverage photography, custom menu cards, and targeted social ad campaigns.",
      services: ["Creative Design", "Social Media Management", "Photography", "Menu Layout Design", "Branding"],
      overview: { challenge: "Positioning Toi Cafe as the top aesthetic coffee & dessert spot.", strategy: "High-end beverage photography, warm coffee tone palettes, and clean grid layouts.", solution: "Designing elegant menus and weekly social media highlights.", execution: "Professional photo shoots and targeted digital ad campaigns.", results: "Substantial increase in cafe weekend visits and online social engagement." },
      media: { gallery: ["images/p3.jpg", "images/p6.jpg", "images/s4.jpg"], videos: [], mockups: { desktop: "images/p3.jpg", tablet: "images/p6.jpg", mobile: "images/s4.jpg" } },
      results: { stat1Num: "+350K", stat1Label: "Social Reach", stat2Num: "+50%", stat2Label: "Weekend Customer Increase", stat3Num: "3.0x", stat3Label: "ROI Impact", stat4Num: "100%", stat4Label: "Client Approval", feedbackQuote: "The aesthetic social media posts and menu layouts designed by Betroverse captured our cafe's vibe perfectly!", feedbackAuthor: "Toi Cafe Team", feedbackRole: "Specialty Cafe & Lounge" },
      seo: { title: "Toi Cafe Case Study | Specialty Coffee Branding by Betroverse", description: "Discover Toi Cafe's menu design and aesthetic social media campaigns.", keywords: "Toi Cafe, coffee branding, menu design, Betroverse", ogImage: "images/p3.jpg", canonicalUrl: "https://betroverse.in/portfolio/toi-cafe" }
    },
    {
      id: "cs-ph-mobiles", slug: "ph-mobiles", status: "published",
      companyName: "PH Mobiles", companyLogo: "images/NiceMobiles.png",
      heroImage: "images/p4.jpg", cardImage: "images/p4.jpg",
      category: "Retail Marketing & Visual Advertising", industry: "Smartphone & Electronics Retail",
      clientName: "PH Mobiles Retail", year: "2024 - 2025",
      shortIntro: "Product layouts, festival offer graphics, and visual flyers for smartphone retail campaigns.",
      fullDescription: "PH Mobiles is a trusted retail center for smartphones and home appliances. We developed their visual flyers, festival offer announcements, and product layouts.",
      brandStory: "Providing top-tier mobile phones and appliances with local trust and warranty support across retail stores.",
      brandGoals: "Boost holiday store walk-ins, promote trade-in deals, and launch high-impact retail banners.",
      services: ["Creative Design", "Social Media Management", "Promo Campaigns", "Print Layouts"],
      overview: { challenge: "Standing out in competitive smartphone retail markets during seasonal sales.", strategy: "Creating vibrant product graphics with clear pricing badges.", solution: "Designing digital trade-in flyers and festival offer banners.", execution: "Multichannel broadcast on social media and print distribution.", results: "Increased retail inquiries and store sales conversion." },
      media: { gallery: ["images/p4.jpg", "images/s5.jpg"], videos: [], mockups: { desktop: "images/p4.jpg", tablet: "images/s5.jpg", mobile: "images/p4.jpg" } },
      results: { stat1Num: "+200K", stat1Label: "Ad Impressions", stat2Num: "+40%", stat2Label: "Store Inquiries", stat3Num: "2.8x", stat3Label: "Sales Boost", stat4Num: "100%", stat4Label: "Satisfaction", feedbackQuote: "Betroverse designed outstanding promotional graphics for our festival sales!", feedbackAuthor: "PH Mobiles Leadership", feedbackRole: "Smartphone Retail Store" },
      seo: { title: "PH Mobiles Case Study | Retail Marketing by Betroverse", description: "Smartphone promotion flyers and retail campaigns for PH Mobiles.", keywords: "PH Mobiles, retail marketing, Betroverse", ogImage: "images/p4.jpg", canonicalUrl: "https://betroverse.in/portfolio/ph-mobiles" }
    },
    {
      id: "cs-mylaban-dessert", slug: "mylaban-dessert-shop", status: "published",
      companyName: "MyLaban Dessert Shop", companyLogo: "images/Picsart_25-09-24_21-31-47-226.png",
      heroImage: "images/p5.jpg", cardImage: "images/p5.jpg",
      category: "Content Creation & Video Production", industry: "Dessert & Food Lounge",
      clientName: "MyLaban Desserts", year: "2024 - 2025",
      shortIntro: "Creative dessert video production and digital showcase.",
      fullDescription: "MyLaban is a popular dessert shop in Kochi specializing in authentic Egyptian desserts.",
      brandStory: "Showcasing signature Middle Eastern delicacies with engaging video content.",
      brandGoals: "Boost social engagement and drive dessert lovers to the store.",
      services: ["Creative Design", "Social Media Management", "Video Production"],
      overview: { challenge: "Capturing dessert textures in video.", strategy: "High-frame-rate food shoots.", solution: "Cinematic reel edits.", execution: "Instagram Reels launch.", results: "High customer interaction." },
      media: { gallery: ["images/p5.jpg"], videos: [], mockups: { desktop: "images/p5.jpg", tablet: "images/p5.jpg", mobile: "images/p5.jpg" } },
      results: { stat1Num: "+300K", stat1Label: "Views", stat2Num: "+45%", stat2Label: "Orders", stat3Num: "3.5x", stat3Label: "ROI", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "MyLaban Dessert Shop Case Study", description: "Video content and creative branding for MyLaban Dessert Shop.", keywords: "MyLaban, video production", ogImage: "images/p5.jpg", canonicalUrl: "https://betroverse.in/portfolio/mylaban-dessert-shop" }
    },
    {
      id: "cs-toi-cafe-photo", slug: "toi-cafe-photography", status: "published",
      companyName: "Toi Cafe Photography", companyLogo: "images/toi.png",
      heroImage: "images/p6.jpg", cardImage: "images/p6.jpg",
      category: "Photography & Social Ads", industry: "Cafe & Beverage",
      clientName: "Toi Cafe", year: "2024 - 2025",
      shortIntro: "Premium photography assets and specialty coffee marketing.",
      fullDescription: "High-end product photography and social media ad visuals for Toi Cafe.",
      brandStory: "Highlighting handcrafted cold brews and pastries with aesthetic photography.",
      brandGoals: "Establish a luxury cafe aesthetic across digital channels.",
      services: ["Photography", "Social Media Management", "Creative Design"],
      overview: { challenge: "Creating consistent aesthetic imagery.", strategy: "Dedicated food photography sessions.", solution: "Curated Instagram grid.", execution: "Digital advertising.", results: "Increased brand reputation." },
      media: { gallery: ["images/p6.jpg"], videos: [], mockups: { desktop: "images/p6.jpg", tablet: "images/p6.jpg", mobile: "images/p6.jpg" } },
      results: { stat1Num: "+250K", stat1Label: "Reach", stat2Num: "+40%", stat2Label: "Walk-ins", stat3Num: "2.9x", stat3Label: "ROI", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "Toi Cafe Photography Case Study", description: "Food & beverage photography for Toi Cafe.", keywords: "Toi Cafe, photography", ogImage: "images/p6.jpg", canonicalUrl: "https://betroverse.in/portfolio/toi-cafe-photography" }
    },
    {
      id: "cs-gurumitra", slug: "gurumitra-foundation", status: "published",
      companyName: "Gurumitra Foundation", companyLogo: "images/Gurumitra.png",
      heroImage: "images/p7.jpg", cardImage: "images/p7.jpg",
      category: "Educational Design & Print", industry: "Education & Non-Profit",
      clientName: "Gurumitra Foundation", year: "2024 - 2025",
      shortIntro: "Clean print brochures and notice layouts for academic outreach.",
      fullDescription: "Informative promotional collateral for academic support programs.",
      brandStory: "Empowering students through accessible academic guidance.",
      brandGoals: "Inform parents and students about academic enrollment programs.",
      services: ["Creative Design", "Print Layout", "Branding"],
      overview: { challenge: "Presenting detailed educational data cleanly.", strategy: "Modular grid layouts.", solution: "Clear brochures.", execution: "Print & PDF distribution.", results: "High enrollment intake." },
      media: { gallery: ["images/p7.jpg"], videos: [], mockups: { desktop: "images/p7.jpg", tablet: "images/p7.jpg", mobile: "images/p7.jpg" } },
      results: { stat1Num: "+50K", stat1Label: "Brochures Delivered", stat2Num: "+80%", stat2Label: "Enrollment Intake", stat3Num: "4.0x", stat3Label: "Outreach", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "Gurumitra Foundation Case Study", description: "Educational print collateral for Gurumitra Foundation.", keywords: "Gurumitra, education", ogImage: "images/p7.jpg", canonicalUrl: "https://betroverse.in/portfolio/gurumitra-foundation" }
    },
    {
      id: "cs-nice-mobiles", slug: "nice-mobiles", status: "published",
      companyName: "Nice Mobiles", companyLogo: "images/NiceMobiles.png",
      heroImage: "images/p8.jpg", cardImage: "images/p8.jpg",
      category: "Promo Campaigns & Retail Banners", industry: "Electronics Retail",
      clientName: "Nice Mobiles Retail", year: "2024 - 2025",
      shortIntro: "Holiday promotional graphics and discount visual flyers.",
      fullDescription: "Promotional graphics for holiday retail sales and mobile trade-in offers.",
      brandStory: "Top mobile retail store offering festive smartphone discounts.",
      brandGoals: "Drive foot traffic and increase retail trade-ins.",
      services: ["Creative Design", "Social Media Management", "Promo Campaigns"],
      overview: { challenge: "Capturing holiday shopper attention.", strategy: "Vibrant discount badges.", solution: "Digital offer banners.", execution: "Social ads.", results: "Record store sales." },
      media: { gallery: ["images/p8.jpg"], videos: [], mockups: { desktop: "images/p8.jpg", tablet: "images/p8.jpg", mobile: "images/p8.jpg" } },
      results: { stat1Num: "+400K", stat1Label: "Ad Views", stat2Num: "+65%", stat2Label: "Sales Growth", stat3Num: "3.8x", stat3Label: "ROI", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "Nice Mobiles Case Study", description: "Retail promo campaigns for Nice Mobiles.", keywords: "Nice Mobiles, retail promo", ogImage: "images/p8.jpg", canonicalUrl: "https://betroverse.in/portfolio/nice-mobiles" }
    },
    {
      id: "cs-mylaban-identity", slug: "mylaban-brand-identity", status: "published",
      companyName: "MyLaban Brand Identity", companyLogo: "images/Picsart_25-09-24_21-31-47-226.png",
      heroImage: "images/s1.jpg", cardImage: "images/s1.jpg",
      category: "AI Video Production", industry: "Food & Beverage",
      clientName: "MyLaban", year: "2024 - 2025",
      shortIntro: "AI video creation for signature dessert visual promotions.",
      fullDescription: "AI video generation and dynamic visual effects for dessert advertising.",
      brandStory: "Integrating cutting-edge AI technology into visual food branding.",
      brandGoals: "Create viral short-form video commercials.",
      services: ["AI Video Creation", "Video Production", "Creative Design"],
      overview: { challenge: "Standing out on Instagram Reels.", strategy: "AI-enhanced motion graphics.", solution: "Viral reel series.", execution: "Social rollout.", results: "Massive organic reach." },
      media: { gallery: ["images/s1.jpg"], videos: [], mockups: { desktop: "images/s1.jpg", tablet: "images/s1.jpg", mobile: "images/s1.jpg" } },
      results: { stat1Num: "+600K", stat1Label: "Reel Impressions", stat2Num: "+75%", stat2Label: "Engagement", stat3Num: "4.5x", stat3Label: "ROI", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "MyLaban Brand Identity Case Study", description: "AI video creation for MyLaban.", keywords: "AI video, MyLaban", ogImage: "images/s1.jpg", canonicalUrl: "https://betroverse.in/portfolio/mylaban-brand-identity" }
    },
    {
      id: "cs-nahdi-mandi", slug: "nahdi-mandi", status: "published",
      companyName: "Nahdi Mandi", companyLogo: "images/Nahdimandi-white.png",
      heroImage: "images/s2.jpg", cardImage: "images/s2.jpg",
      category: "Social Media Ads & Branding", industry: "Traditional Dining & Mandi",
      clientName: "Nahdi Mandi Restaurant", year: "2024 - 2025",
      shortIntro: "Arabic dining flyers and promotional visual banners.",
      fullDescription: "Authentic Arabic restaurant branding and promotional campaign graphics.",
      brandStory: "Bringing genuine Mandi flavors to food enthusiasts with cultural aesthetic graphics.",
      brandGoals: "Boost dinner dining reservations and weekend orders.",
      services: ["Creative Design", "Social Media Management", "Branding"],
      overview: { challenge: "Promoting authentic Arabic dining experiences.", strategy: "Rich culinary photography.", solution: "Promotional dining banners.", execution: "Local targeted ads.", results: "Increased dining bookings." },
      media: { gallery: ["images/s2.jpg"], videos: [], mockups: { desktop: "images/s2.jpg", tablet: "images/s2.jpg", mobile: "images/s2.jpg" } },
      results: { stat1Num: "+300K", stat1Label: "Ad Reach", stat2Num: "+55%", stat2Label: "Table Reservations", stat3Num: "3.2x", stat3Label: "ROI", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "Nahdi Mandi Case Study", description: "Social media marketing for Nahdi Mandi.", keywords: "Nahdi Mandi, dining ads", ogImage: "images/s2.jpg", canonicalUrl: "https://betroverse.in/portfolio/nahdi-mandi" }
    },
    {
      id: "cs-celes", slug: "celes-lifestyle", status: "published",
      companyName: "Celes Lifestyle", companyLogo: "images/celes.png",
      heroImage: "images/s3.jpg", cardImage: "images/s3.jpg",
      category: "Luxury Campaign & Aesthetics", industry: "Luxury Fashion & Lifestyle",
      clientName: "Celes Lifestyle", year: "2024 - 2025",
      shortIntro: "Minimalist marketing assets and aesthetic Instagram layout grids.",
      fullDescription: "High-end luxury campaign collateral and Instagram grid layout branding.",
      brandStory: "Exclusive lifestyle brand showcasing minimalist elegance.",
      brandGoals: "Establish high-end brand perception among luxury consumers.",
      services: ["Creative Design", "Social Media Management", "Luxury Branding"],
      overview: { challenge: "Conveying exclusivity and refined aesthetics.", strategy: "Minimalist typography & monochrome palettes.", solution: "Curated grid layouts.", execution: "Instagram showcase.", results: "High brand prestige." },
      media: { gallery: ["images/s3.jpg"], videos: [], mockups: { desktop: "images/s3.jpg", tablet: "images/s3.jpg", mobile: "images/s3.jpg" } },
      results: { stat1Num: "+180K", stat1Label: "Impressions", stat2Num: "+50%", stat2Label: "Brand Inquiries", stat3Num: "3.1x", stat3Label: "ROI", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "Celes Lifestyle Case Study", description: "Luxury branding for Celes Lifestyle.", keywords: "Celes, luxury branding", ogImage: "images/s3.jpg", canonicalUrl: "https://betroverse.in/portfolio/celes-lifestyle" }
    },
    {
      id: "cs-toi-cafe-aesthetics", slug: "toi-cafe-aesthetics", status: "published",
      companyName: "Toi Cafe Aesthetics", companyLogo: "images/toi.png",
      heroImage: "images/s4.jpg", cardImage: "images/s4.jpg",
      category: "Branding Design & Menu Layout", industry: "Cafe & Desserts",
      clientName: "Toi Cafe", year: "2024 - 2025",
      shortIntro: "Menu and beverage promotions with premium visual layout.",
      fullDescription: "Custom menu cards and beverage promotional layouts for Toi Cafe.",
      brandStory: "Crafting beautiful menu layouts for specialty beverage lovers.",
      brandGoals: "Enhance customer ordering experience at the cafe.",
      services: ["Menu Layout Design", "Creative Design", "Branding"],
      overview: { challenge: "Creating a clear, elegant menu.", strategy: "Clean typography & beverage icons.", solution: "Laminated print menus & digital version.", execution: "In-store deployment.", results: "Positive customer feedback." },
      media: { gallery: ["images/s4.jpg"], videos: [], mockups: { desktop: "images/s4.jpg", tablet: "images/s4.jpg", mobile: "images/s4.jpg" } },
      results: { stat1Num: "+150K", stat1Label: "Views", stat2Num: "+35%", stat2Label: "Beverage Sales", stat3Num: "2.7x", stat3Label: "ROI", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "Toi Cafe Aesthetics Case Study", description: "Menu design for Toi Cafe.", keywords: "Toi Cafe, menu design", ogImage: "images/s4.jpg", canonicalUrl: "https://betroverse.in/portfolio/toi-cafe-aesthetics" }
    },
    {
      id: "cs-nice-mobiles-retail", slug: "nice-mobiles-retail", status: "published",
      companyName: "Nice Mobiles Retail", companyLogo: "images/NiceMobiles.png",
      heroImage: "images/s5.jpg", cardImage: "images/s5.jpg",
      category: "Sales Advertising & Promo", industry: "Retail Smartphone Sales",
      clientName: "Nice Mobiles", year: "2024 - 2025",
      shortIntro: "Engaging flyers for mobile trade-in campaigns.",
      fullDescription: "Retail flyers and advertising visuals for trade-in discount campaigns.",
      brandStory: "Empowering customers to upgrade smartphones effortlessly.",
      brandGoals: "Maximize mobile exchange program participation.",
      services: ["Creative Design", "Promo Campaigns", "Print Layout"],
      overview: { challenge: "Communicating exchange values clearly.", strategy: "Comparison flyers with value badges.", solution: "Visual promo flyers.", execution: "In-store and digital blast.", results: "High exchange volume." },
      media: { gallery: ["images/s5.jpg"], videos: [], mockups: { desktop: "images/s5.jpg", tablet: "images/s5.jpg", mobile: "images/s5.jpg" } },
      results: { stat1Num: "+220K", stat1Label: "Ad Reach", stat2Num: "+48%", stat2Label: "Trade-ins", stat3Num: "3.0x", stat3Label: "ROI", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "Nice Mobiles Retail Case Study", description: "Trade-in sales advertising for Nice Mobiles.", keywords: "Nice Mobiles, trade-in ads", ogImage: "images/s5.jpg", canonicalUrl: "https://betroverse.in/portfolio/nice-mobiles-retail" }
    },
    {
      id: "cs-nahdi-mandi-rest", slug: "nahdi-mandi-restaurant", status: "published",
      companyName: "Nahdi Mandi Restaurant", companyLogo: "images/Nahdimandi-white.png",
      heroImage: "images/s6.jpg", cardImage: "images/s6.jpg",
      category: "Visual Marketing & Menu", industry: "Restaurant & Catering",
      clientName: "Nahdi Mandi", year: "2024 - 2025",
      shortIntro: "Menu announcement graphics and specialty dish posts.",
      fullDescription: "Promotional culinary banners for new authentic Mandi dish launches.",
      brandStory: "Celebrating traditional Arabic family dining with vibrant food posters.",
      brandGoals: "Promote new dish additions to weekend family diners.",
      services: ["Creative Design", "Social Media Management"],
      overview: { challenge: "Highlighting new menu items.", strategy: "Rich photography & call-to-action badges.", solution: "Dish announcement graphics.", execution: "Social ads.", results: "Increased dish sales." },
      media: { gallery: ["images/s6.jpg"], videos: [], mockups: { desktop: "images/s6.jpg", tablet: "images/s6.jpg", mobile: "images/s6.jpg" } },
      results: { stat1Num: "+280K", stat1Label: "Reach", stat2Num: "+52%", stat2Label: "Dish Sales", stat3Num: "3.3x", stat3Label: "ROI", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "Nahdi Mandi Restaurant Case Study", description: "Menu launch marketing for Nahdi Mandi.", keywords: "Nahdi Mandi, food marketing", ogImage: "images/s6.jpg", canonicalUrl: "https://betroverse.in/portfolio/nahdi-mandi-restaurant" }
    },
    {
      id: "cs-celes-brand", slug: "celes-lifestyle-brand", status: "published",
      companyName: "Celes Lifestyle Brand", companyLogo: "images/celes.png",
      heroImage: "images/s7.jpg", cardImage: "images/s7.jpg",
      category: "Social Management & Branding", industry: "Lifestyle & Apparel",
      clientName: "Celes", year: "2024 - 2025",
      shortIntro: "Aesthetic branding layout for events and campaigns.",
      fullDescription: "Social media strategy and aesthetic event branding collateral for Celes.",
      brandStory: "A stylish lifestyle brand inspiring contemporary elegance.",
      brandGoals: "Grow social community and drive event attendance.",
      services: ["Social Media Management", "Creative Design", "Branding"],
      overview: { challenge: "Building strong brand loyalty.", strategy: "Consistent visual aesthetics.", solution: "Campaign layouts.", execution: "Monthly social content.", results: "Steady follower growth." },
      media: { gallery: ["images/s7.jpg"], videos: [], mockups: { desktop: "images/s7.jpg", tablet: "images/s7.jpg", mobile: "images/s7.jpg" } },
      results: { stat1Num: "+190K", stat1Label: "Impressions", stat2Num: "+42%", stat2Label: "Follower Growth", stat3Num: "2.8x", stat3Label: "ROI", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "Celes Lifestyle Brand Case Study", description: "Social media management for Celes Lifestyle Brand.", keywords: "Celes, social management", ogImage: "images/s7.jpg", canonicalUrl: "https://betroverse.in/portfolio/celes-lifestyle-brand" }
    },
    {
      id: "cs-independent", slug: "independent", status: "published",
      companyName: "Independent Designs", companyLogo: "images/logo.png",
      heroImage: "images/s8.jpg", cardImage: "images/s8.jpg",
      category: "Graphic Showcase & Posters", industry: "Creative Design & Typography",
      clientName: "Betroverse Studio", year: "2024 - 2025",
      shortIntro: "A collection of typographic layout poster assets.",
      fullDescription: "A showcase of custom typographic layouts, flyer designs, and visual branding assets.",
      brandStory: "Exploring creative boundaries with experimental typography and visual art.",
      brandGoals: "Demonstrate Betroverse's versatile graphic design capabilities.",
      services: ["Creative Design", "Branding", "Typography"],
      overview: { challenge: "Showcasing creative graphic design skills.", strategy: "Diverse typographic styles.", solution: "Portfolio poster gallery.", execution: "Digital showcase.", results: "Inbound design leads." },
      media: { gallery: ["images/s8.jpg"], videos: [], mockups: { desktop: "images/s8.jpg", tablet: "images/s8.jpg", mobile: "images/s8.jpg" } },
      results: { stat1Num: "+120K", stat1Label: "Views", stat2Num: "+38%", stat2Label: "Design Leads", stat3Num: "3.0x", stat3Label: "ROI", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "Independent Designs Case Study", description: "Typographic posters and graphic design showcase by Betroverse.", keywords: "graphic design, typography, Betroverse", ogImage: "images/s8.jpg", canonicalUrl: "https://betroverse.in/portfolio/independent" }
    }
  ];

  window.getBetroCaseStudiesSeed = () => defaultCaseStudies;

  const getBetroCaseStudies = () => {
    const cached = BetroStorage.cache["betro_casestudies"];
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;

    const storedSync = BetroStorage.getItemSync("betro_casestudies");
    if (storedSync && Array.isArray(storedSync) && storedSync.length > 0) {
      BetroStorage.cache["betro_casestudies"] = storedSync;
      return storedSync;
    }
    return defaultCaseStudies;
  };

  const saveBetroCaseStudies = async (list) => {
    BetroStorage.cache["betro_casestudies"] = list;
    await BetroStorage.setItem("betro_casestudies", list);

    // Real-time synchronization broadcast across windows/tabs
    try {
      if (window.BetroDB) {
        BetroDB.broadcastChange("CASE_STUDY_UPDATED", list);
      }
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel("betro_portfolio_sync");
        channel.postMessage({ type: "CASE_STUDY_UPDATED", timestamp: Date.now(), data: list });
      }
    } catch (e) { }
    window.dispatchEvent(new CustomEvent("betro_storage_updated", { detail: { key: "betro_casestudies", list } }));
  };

  const getFreshBetroCaseStudies = async () => {
    if (window.BetroDB) {
      try {
        const fromDb = await BetroDB.getCaseStudies({ forceRefresh: true, includeDrafts: true });
        if (fromDb && Array.isArray(fromDb) && fromDb.length > 0) {
          BetroStorage.cache["betro_casestudies"] = fromDb;
          return fromDb;
        }
      } catch (e) {
        console.warn("[Admin] Cloud database fetch failed, checking local:", e);
      }
    }
    const fresh = await BetroStorage.getItem("betro_casestudies");
    if (fresh && Array.isArray(fresh) && fresh.length > 0) {
      BetroStorage.cache["betro_casestudies"] = fresh;
      return fresh;
    }
    return getBetroCaseStudies();
  };

  // Standard 25 Case Study Sections Master Definition
  const STANDARD_CASE_STUDY_SECTIONS = [
    { key: "hero", name: "1. Case Study Hero", defaultVisible: true },
    { key: "company_overview", name: "2. Company Overview", defaultVisible: true },
    { key: "brand_story", name: "3. Brand Story & Background", defaultVisible: true },
    { key: "project_objectives", name: "4. Project Objectives", defaultVisible: true },
    { key: "services", name: "5. Services Provided", defaultVisible: true },
    { key: "project_overview", name: "6. Project Overview", defaultVisible: true },
    { key: "challenge", name: "7. Challenge", defaultVisible: true },
    { key: "strategy", name: "8. Strategy", defaultVisible: true },
    { key: "solution", name: "9. Solution", defaultVisible: true },
    { key: "execution", name: "10. Execution", defaultVisible: true },
    { key: "results_summary", name: "11. Results", defaultVisible: true },
    { key: "results_impact", name: "12. Results & Impact", defaultVisible: true },
    { key: "performance_metrics", name: "13. Performance & Metrics", defaultVisible: true },
    { key: "client_testimonial", name: "14. Client Testimonial", defaultVisible: true },
    { key: "creative_showcase", name: "15. Creative Showcase", defaultVisible: true },
    { key: "gallery", name: "16. Gallery", defaultVisible: true },
    { key: "video_showcase", name: "17. Video Showcase", defaultVisible: true },
    { key: "website_mockups", name: "18. Website Mockups", defaultVisible: true },
    { key: "mobile_mockups", name: "19. Mobile Mockups", defaultVisible: true },
    { key: "desktop_mockups", name: "20. Desktop Mockups", defaultVisible: true },
    { key: "brand_identity", name: "21. Brand Identity", defaultVisible: true },
    { key: "social_media_campaign", name: "22. Social Media Campaign", defaultVisible: true },
    { key: "marketing_campaign", name: "23. Marketing Campaign", defaultVisible: true },
    { key: "additional_info", name: "24. Additional Information", defaultVisible: true },
    { key: "custom_sections", name: "25. Custom Sections", defaultVisible: true }
  ];

  // State Variables for currently opened Case Study Editor
  let activeTags = [];
  let activeGallery = [];
  let activeVideos = [];
  let activeGallerySections = [];
  let activeBlocks = [];
  let activeSectionVisibility = {};
  let activeSectionOrder = [];
  let isEditorDirty = false;
  let isEditorSaving = false;
  let pendingSaveQueued = false;
  let autoSaveDebounceTimer = null;
  let autoSaveIntervalTimer = null;
  let autoSaveTimer = null;

  // Auto-Save Status Badge & Indicator Handlers
  const markEditorDirty = () => {
    isEditorDirty = true;
    const badge = document.getElementById("cs-autosave-indicator");
    const globalBadge = document.getElementById("cs-autosave-global-badge");

    if (badge) {
      badge.className = "cs-autosave-pill status-unsaved";
      const lbl = badge.querySelector(".autosave-label");
      if (lbl) lbl.textContent = "Unsaved Changes";
      badge.title = "Unsaved changes. Auto-saving shortly or click to save now.";
    }
    if (globalBadge) {
      globalBadge.className = "autosave-badge unsaved";
      globalBadge.classList.remove("hidden");
    }
  };

  const setEditorSaving = () => {
    const badge = document.getElementById("cs-autosave-indicator");
    const globalBadge = document.getElementById("cs-autosave-global-badge");

    if (badge) {
      badge.className = "cs-autosave-pill status-saving";
      const lbl = badge.querySelector(".autosave-label");
      if (lbl) lbl.textContent = "Saving to Cloud...";
      badge.title = "Saving changes to database...";
    }
    if (globalBadge) {
      globalBadge.className = "autosave-badge unsaved";
      globalBadge.classList.remove("hidden");
    }
  };

  const setEditorSaved = () => {
    isEditorDirty = false;
    const badge = document.getElementById("cs-autosave-indicator");
    const globalBadge = document.getElementById("cs-autosave-global-badge");

    if (badge) {
      badge.className = "cs-autosave-pill status-saved";
      const lbl = badge.querySelector(".autosave-label");
      if (lbl) lbl.textContent = "Saved";
      badge.title = "All changes saved to cloud database & live on site.";
    }
    if (globalBadge) {
      globalBadge.className = "autosave-badge saved";
      globalBadge.classList.remove("hidden");
    }
  };

  const setEditorError = (errMessage) => {
    const badge = document.getElementById("cs-autosave-indicator");
    if (badge) {
      badge.className = "cs-autosave-pill status-error";
      const lbl = badge.querySelector(".autosave-label");
      if (lbl) lbl.textContent = "Save Failed (Click to Retry)";
      badge.title = errMessage || "Error saving state. Click to retry.";
    }
  };

  // Dedicated Upload Status Indicator
  const updateUploadStatus = (type, state, message) => {
    const statusElem = document.getElementById(type === "video" ? "video-upload-status" : "gallery-upload-status");
    if (!statusElem) return;

    statusElem.style.display = "flex";
    if (state === "uploading" || state === "processing" || state === "saving") {
      statusElem.style.background = "rgba(59, 130, 246, 0.15)";
      statusElem.style.color = "#60a5fa";
      statusElem.style.border = "1px solid rgba(59, 130, 246, 0.3)";
      statusElem.innerHTML = `<i class="ri-loader-4-line ri-spin" style="font-size: 1.1rem;"></i> <span>${message}</span>`;
    } else if (state === "success") {
      statusElem.style.background = "rgba(16, 185, 129, 0.15)";
      statusElem.style.color = "#4ab96c";
      statusElem.style.border = "1px solid rgba(16, 185, 129, 0.3)";
      statusElem.innerHTML = `<i class="ri-checkbox-circle-fill" style="font-size: 1.1rem;"></i> <span>${message}</span>`;
      setTimeout(() => {
        if (statusElem.innerHTML.includes(message)) {
          statusElem.style.display = "none";
        }
      }, 4000);
    } else if (state === "error") {
      statusElem.style.background = "rgba(239, 68, 68, 0.15)";
      statusElem.style.color = "#ef4444";
      statusElem.style.border = "1px solid rgba(239, 68, 68, 0.3)";
      statusElem.innerHTML = `<i class="ri-error-warning-fill" style="font-size: 1.1rem;"></i> <span>${message}</span>`;
    }
  };

  // Authoritative Case Study State Saver
  async function saveActiveEditorState() {
    const editId = document.getElementById("cs-edit-id")?.value;
    const companyName = document.getElementById("cs-company-name")?.value?.trim() || "New Case Study";
    const rawSlug = document.getElementById("cs-slug")?.value?.trim() || companyName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const slug = (rawSlug || "project").toLowerCase().replace(/[^a-z0-9-]/g, "-");

    const category = document.getElementById("cs-category")?.value?.trim() || "Creative Campaign";
    const industry = document.getElementById("cs-industry")?.value?.trim() || "General Business";
    const clientName = document.getElementById("cs-client-name")?.value?.trim() || companyName;
    const status = document.getElementById("cs-status")?.value || "published";

    const logoUrl = document.getElementById("cs-logo-url")?.value?.trim() || "images/logo.png";
    const cardImageUrl = document.getElementById("cs-cardimg-url")?.value?.trim() || "";
    const heroUrl = document.getElementById("cs-hero-url")?.value?.trim() || "images/p1.jpg";

    const shortIntro = document.getElementById("cs-short-intro")?.value?.trim() || "";
    const brandStory = document.getElementById("cs-brand-story")?.value?.trim() || "";
    const brandGoals = document.getElementById("cs-brand-goals")?.value?.trim() || "";

    const overview = {
      challenge: document.getElementById("cs-overview-challenge")?.value?.trim() || "",
      strategy: document.getElementById("cs-overview-strategy")?.value?.trim() || "",
      solution: document.getElementById("cs-overview-solution")?.value?.trim() || "",
      execution: document.getElementById("cs-overview-execution")?.value?.trim() || "",
      results: document.getElementById("cs-overview-results")?.value?.trim() || ""
    };

    const results = {
      stat1Num: document.getElementById("cs-stat1-num")?.value?.trim() || "+500K",
      stat1Label: document.getElementById("cs-stat1-label")?.value?.trim() || "Social Views",
      stat2Num: document.getElementById("cs-stat2-num")?.value?.trim() || "+60%",
      stat2Label: document.getElementById("cs-stat2-label")?.value?.trim() || "Growth",
      stat3Num: document.getElementById("cs-stat3-num")?.value?.trim() || "4.2x",
      stat3Label: document.getElementById("cs-stat3-label")?.value?.trim() || "ROI",
      stat4Num: document.getElementById("cs-stat4-num")?.value?.trim() || "100%",
      stat4Label: document.getElementById("cs-stat4-label")?.value?.trim() || "Satisfaction",

      feedbackQuote: document.getElementById("cs-feedback-quote")?.value?.trim() || "",
      feedbackAuthor: document.getElementById("cs-feedback-author")?.value?.trim() || "",
      feedbackRole: document.getElementById("cs-feedback-role")?.value?.trim() || ""
    };

    // Re-index display_order before saving
    activeGallery.forEach((item, idx) => { if (typeof item === 'object' && item) item.display_order = idx; });
    activeVideos.forEach((item, idx) => { if (typeof item === 'object' && item) item.display_order = idx; });

    const firstGalUrl = activeGallery[0] ? (typeof activeGallery[0] === 'string' ? activeGallery[0] : activeGallery[0].url) : "";
    const secondGalUrl = activeGallery[1] ? (typeof activeGallery[1] === 'string' ? activeGallery[1] : activeGallery[1].url) : "";

    const deskMockUrl = document.getElementById("cs-desktop-mockup-url")?.value?.trim() || firstGalUrl || heroUrl;
    const mobMockUrl = document.getElementById("cs-mobile-mockup-url")?.value?.trim() || secondGalUrl || logoUrl;

    const allStructuredAssets = [
      ...activeGallery.map((g, idx) => normalizeMediaAsset(g, editId || "cs-" + Date.now(), slug, "image", "creative_showcase", idx)),
      ...activeVideos.map((v, idx) => normalizeMediaAsset(v, editId || "cs-" + Date.now(), slug, "video", "video_showcase", idx))
    ];

    const media = {
      gallery: activeGallery.map(g => typeof g === "string" ? g : (g ? g.url : "")),
      videos: activeVideos.map(v => typeof v === "string" ? v : (v ? v.url : "")),
      assets: allStructuredAssets,
      mockups: {
        desktop: deskMockUrl,
        mobile: mobMockUrl
      }
    };

    const seo = {
      title: document.getElementById("cs-seo-title")?.value?.trim() || `${companyName} Case Study | Betroverse`,
      description: document.getElementById("cs-seo-desc")?.value?.trim() || shortIntro,
      keywords: document.getElementById("cs-seo-keywords")?.value?.trim() || "",
      ogImage: document.getElementById("cs-seo-ogimage")?.value?.trim() || heroUrl,
      canonicalUrl: document.getElementById("cs-seo-canonical")?.value?.trim() || `https://betroverse.in/portfolio/${slug}`
    };

    let list = await getFreshBetroCaseStudies();
    let targetItem = null;

    if (editId) {
      list = list.map(cs => {
        if (cs.id === editId) {
          targetItem = {
            ...cs,
            companyName,
            slug,
            category,
            industry,
            clientName,
            status,
            companyLogo: logoUrl,
            cardImage: cardImageUrl || cs.cardImage || heroUrl,
            heroImage: heroUrl,
            shortIntro,
            brandStory,
            brandGoals,
            services: [...activeTags],
            overview,
            results,
            media,
            gallerySections: [...activeGallerySections],
            blocks: [...activeBlocks],
            sectionVisibility: { ...activeSectionVisibility },
            sectionOrder: [...activeSectionOrder],
            seo
          };
          return targetItem;
        }
        return cs;
      });

      if (!targetItem) {
        targetItem = {
          id: editId,
          companyName,
          slug,
          category,
          industry,
          clientName,
          status,
          year: "2024 - 2025",
          companyLogo: logoUrl,
          cardImage: cardImageUrl || heroUrl,
          heroImage: heroUrl,
          shortIntro,
          brandStory,
          brandGoals,
          services: [...activeTags],
          overview,
          results,
          media,
          gallerySections: [...activeGallerySections],
          blocks: [...activeBlocks],
          sectionVisibility: { ...activeSectionVisibility },
          sectionOrder: [...activeSectionOrder],
          seo
        };
        list.push(targetItem);
      }
    } else {
      const generatedId = "cs-" + Date.now();
      targetItem = {
        id: generatedId,
        companyName,
        slug,
        category,
        industry,
        clientName,
        status,
        year: "2024 - 2025",
        companyLogo: logoUrl,
        cardImage: cardImageUrl || heroUrl,
        heroImage: heroUrl,
        shortIntro,
        brandStory,
        brandGoals,
        services: [...activeTags],
        overview,
        results,
        media,
        gallerySections: [...activeGallerySections],
        blocks: [...activeBlocks],
        sectionVisibility: { ...activeSectionVisibility },
        sectionOrder: [...activeSectionOrder],
        seo
      };
      const idInput = document.getElementById("cs-edit-id");
      if (idInput) idInput.value = generatedId;
      list.push(targetItem);
    }

    // Authoritative Cloud Database Save
    if (window.BetroDB && targetItem) {
      try {
        const cloudResult = await BetroDB.saveCaseStudy(targetItem);
        if (cloudResult && cloudResult.warning) {
          console.warn("[Admin]", cloudResult.warning);
        }
      } catch (cloudErr) {
        console.error("Cloud database save failed:", cloudErr);
        throw new Error("Case study could not be saved to cloud database: " + (cloudErr.message || cloudErr));
      }
    }

    await saveBetroCaseStudies(list);

    // Sync to legacy betro_projects for full backward compatibility
    const legacyProjects = list.map(cs => ({
      id: cs.id,
      src: cs.cardImage || cs.heroImage || (cs.media && cs.media.gallery && cs.media.gallery[0]) || "images/p1.jpg",
      companyName: cs.companyName,
      category: cs.category,
      shortDesc: cs.shortIntro,
      companyDesc: cs.brandStory || cs.fullDescription,
      services: cs.services,
      companyId: cs.slug,
      logo: cs.companyLogo
    }));
    try {
      localStorage.setItem("betro_projects", JSON.stringify(legacyProjects));
    } catch (e) { }

    renderCaseStudiesTab();
    return targetItem;
  }

  // Core Auto-Save Execution Engine (Protected against concurrency)
  async function executeAutoSave() {
    if (isEditorSaving) {
      pendingSaveQueued = true;
      return;
    }
    if (!isEditorDirty) return;

    isEditorSaving = true;
    setEditorSaving();

    try {
      await saveActiveEditorState();
      setEditorSaved();
    } catch (err) {
      console.error("[AutoSave] Save error:", err);
      setEditorError(err.message || "Cloud save error");
    } finally {
      isEditorSaving = false;
      if (pendingSaveQueued) {
        pendingSaveQueued = false;
        setTimeout(executeAutoSave, 150);
      }
    }
  }

  function scheduleAutoSave(delayMs = 1200) {
    markEditorDirty();
    if (typeof updateLivePreview === "function") updateLivePreview();
    if (autoSaveDebounceTimer) clearTimeout(autoSaveDebounceTimer);
    autoSaveDebounceTimer = setTimeout(() => {
      executeAutoSave();
    }, delayMs);
  }

  async function triggerInstantSave() {
    if (autoSaveDebounceTimer) clearTimeout(autoSaveDebounceTimer);
    markEditorDirty();
    if (typeof updateLivePreview === "function") updateLivePreview();
    await executeAutoSave();
  }

  // Immediate Persistent Case Study Media Sync
  const persistCurrentCaseStudyMedia = async () => {
    await triggerInstantSave();
  };

  // ==========================================
  // DASHBOARD OVERVIEW ENGINE (REAL DATA FROM SUPABASE / LOCAL DB)
  // ==========================================
  const renderDashboardOverview = async () => {
    let list = getBetroCaseStudies();
    if (window.BetroDB) {
      try {
        const fresh = await BetroDB.getCaseStudies({ forceRefresh: false, includeDrafts: true });
        if (fresh && Array.isArray(fresh) && fresh.length > 0) list = fresh;
      } catch (e) { }
    }

    const totalCount = list.length;
    const publishedCount = list.filter(c => (c.status || "published") === "published").length;
    const draftCount = list.filter(c => (c.status || "published") === "draft").length;

    // Calculate real gallery assets across case studies and media library
    let totalGallery = 0;
    let totalVideos = 0;
    list.forEach(c => {
      if (c.media && Array.isArray(c.media.gallery)) totalGallery += c.media.gallery.length;
      if (c.media && Array.isArray(c.media.videos)) totalVideos += c.media.videos.length;
    });

    const storedAssets = BetroStorage.cache["betro_media_assets"] || defaultMediaAssets || [];
    totalGallery += storedAssets.filter(a => a.type === "image").length;
    totalVideos += storedAssets.filter(a => a.type === "video").length;

    // Update real metric spans
    const elTotal = document.getElementById("stat-total-projects");
    if (elTotal) elTotal.textContent = totalCount;

    const elPub = document.getElementById("stat-published-projects");
    if (elPub) elPub.textContent = publishedCount;

    const elDraft = document.getElementById("stat-draft-projects");
    if (elDraft) elDraft.textContent = draftCount;

    const elGal = document.getElementById("stat-gallery-images");
    if (elGal) elGal.textContent = totalGallery;

    const elVid = document.getElementById("stat-video-count");
    if (elVid) elVid.textContent = totalVideos;

    const navCounter = document.getElementById("nav-cs-counter");
    if (navCounter) navCounter.textContent = totalCount;

    // Cloud Database real-time status check
    if (window.BetroDB) {
      const cfg = BetroDB.getConfig();
      const dbStatusEl = document.getElementById("stat-db-status");
      const bucketEl = document.getElementById("stat-bucket-info");
      const dbBadge = document.getElementById("dashboard-db-badge");
      if (dbStatusEl) dbStatusEl.textContent = cfg.isConfigured ? "Connected" : "Local Mode";
      if (bucketEl) bucketEl.textContent = `Bucket: ${cfg.storageBucket || "betodata"}`;
      if (dbBadge) {
        dbBadge.innerHTML = cfg.isConfigured
          ? `<i class="ri-checkbox-circle-fill" style="color:#00e575;"></i><span>Supabase Cloud Ready</span>`
          : `<i class="ri-alert-line" style="color:#fbbf24;"></i><span>Local Fallback Mode</span>`;
      }
    }

    // Render Recent Projects Quick Table
    const recentListContainer = document.getElementById("dash-recent-projects-list");
    if (recentListContainer) {
      const recentItems = list.slice(0, 5);
      if (recentItems.length === 0) {
        recentListContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">No projects found. Click "Create New Case Study" to get started.</div>`;
      } else {
        recentListContainer.innerHTML = `
          <table class="recent-cs-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Category</th>
                <th>Status</th>
                <th style="text-align: right;">Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              ${recentItems.map(item => {
                const isPub = (item.status || "published") === "published";
                const thumb = item.cardImage || item.heroImage || (item.media && item.media.gallery && item.media.gallery[0]) || item.companyLogo || 'images/logo.png';
                return `
                  <tr>
                    <td>
                      <div class="recent-cs-item-cell">
                        <img src="${thumb}" alt="${item.companyName}" class="recent-cs-thumb" loading="lazy">
                        <div class="recent-cs-details">
                          <span class="recent-cs-name">${item.companyName}</span>
                          <span class="recent-cs-slug">/portfolio/${item.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="cs-category-badge">${item.category || "Creative"}</span>
                    </td>
                    <td>
                      <span class="cs-floating-status ${isPub ? 'published' : 'draft'}" style="position: static; font-size: 0.72rem; padding: 2px 8px;">
                        ${isPub ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 6px;">
                        <a href="portfolio/${item.slug}.html" target="_blank" class="admin-btn secondary-btn" style="padding: 4px 8px; font-size: 0.75rem;" title="View Live">
                          <i class="ri-external-link-line"></i>
                        </a>
                        <button type="button" class="admin-btn primary-btn dash-edit-btn" data-id="${item.id}" style="padding: 4px 10px; font-size: 0.75rem;">
                          <i class="ri-edit-line"></i> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        `;

        recentListContainer.querySelectorAll(".dash-edit-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            if (id) openCSModal(id);
          });
        });
      }
    }
  };

  // Render Case Studies List Grid with Modern Project Cards
  function renderCaseStudiesTab() {
    const grid = document.getElementById("admin-casestudies-list");
    if (!grid) return;

    let caseStudies = getBetroCaseStudies();
    const searchVal = (document.getElementById("cs-search-input")?.value || "").toLowerCase().trim();
    const statusVal = document.getElementById("cs-status-filter")?.value || "all";

    if (searchVal) {
      caseStudies = caseStudies.filter(cs =>
        (cs.companyName || "").toLowerCase().includes(searchVal) ||
        (cs.category || "").toLowerCase().includes(searchVal) ||
        (cs.slug || "").toLowerCase().includes(searchVal)
      );
    }

    if (statusVal !== "all") {
      caseStudies = caseStudies.filter(cs => (cs.status || "published") === statusVal);
    }

    grid.innerHTML = "";

    if (caseStudies.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem 1.5rem; text-align: center; color: var(--text-secondary); background: rgba(255,255,255,0.02); border-radius: var(--radius-lg); border: 1px dashed var(--panel-border);">
          <i class="ri-folder-open-line" style="font-size: 2.5rem; opacity: 0.4; display: block; margin-bottom: 8px;"></i>
          <h4 style="color: var(--text-primary); font-size: 1.1rem; margin-bottom: 4px;">No Case Studies Found</h4>
          <p style="font-size: 0.85rem; max-width: 360px; margin: 0 auto 1.25rem auto;">No matching projects found. Adjust your filters or create a new case study.</p>
          <button type="button" class="admin-btn primary-btn" onclick="document.getElementById('add-casestudy-btn').click();" style="margin: 0 auto;">
            <i class="ri-add-line"></i> Create New Case Study
          </button>
        </div>
      `;
      return;
    }

    caseStudies.forEach(cs => {
      const card = document.createElement("div");
      card.className = "cs-project-card";

      const isPublished = (cs.status || "published") === "published";
      const isFeatured = !!cs.featured;
      const coverImg = cs.cardImage || cs.heroImage || (cs.media && cs.media.gallery && cs.media.gallery[0]) || cs.companyLogo || 'images/p1.jpg';
      const logoImg = cs.companyLogo || 'images/logo.png';

      card.innerHTML = `
        <div class="cs-card-banner">
          <img src="${coverImg}" alt="${cs.companyName}" class="cs-card-cover-img" loading="lazy">
          <div class="cs-card-scrim"></div>
          <div class="cs-floating-logo">
            <img src="${logoImg}" alt="Logo">
          </div>
          <span class="cs-floating-status ${isPublished ? 'published' : 'draft'}">
            ${isPublished ? (isFeatured ? '★ FEATURED' : 'PUBLISHED') : 'DRAFT'}
          </span>
        </div>
        <div class="cs-card-body">
          <div class="cs-card-category-row">
            <span class="cs-category-badge">${cs.category || 'Creative'}</span>
            <span class="cs-industry-badge">${cs.industry || 'Agency'}</span>
          </div>
          <h4 class="cs-card-title">${cs.companyName}</h4>
          <p class="cs-card-slug">/portfolio/${cs.slug}</p>
          <p class="cs-card-desc">${cs.shortIntro || cs.brandStory || 'Dynamic agency case study'}</p>

          <div class="cs-card-actions">
            <a href="portfolio/${cs.slug}.html" target="_blank" class="admin-btn secondary-btn cs-btn-view" title="View live page">
              <i class="ri-external-link-line"></i> View
            </a>
            <button type="button" class="admin-btn primary-btn cs-btn-edit edit-cs-btn" data-id="${cs.id}">
              <i class="ri-edit-line"></i> Edit
            </button>
            <button type="button" class="admin-btn secondary-btn cs-btn-copy duplicate-cs-btn" data-id="${cs.id}" title="Duplicate Project">
              <i class="ri-file-copy-line"></i>
            </button>
            <button type="button" class="admin-btn secondary-btn cs-btn-toggle toggle-cs-status" data-id="${cs.id}" title="${isPublished ? 'Unpublish project' : 'Publish project'}">
              <i class="ri-repeat-line"></i>
            </button>
            <button type="button" class="admin-btn danger-btn cs-btn-delete delete-cs-btn" data-id="${cs.id}" title="Delete project">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
      `;

      card.querySelector(".edit-cs-btn")?.addEventListener("click", () => openCSModal(cs.id));
      card.querySelector(".duplicate-cs-btn")?.addEventListener("click", () => duplicateCS(cs.id));
      card.querySelector(".toggle-cs-status")?.addEventListener("click", () => toggleCSStatus(cs.id));
      card.querySelector(".delete-cs-btn")?.addEventListener("click", () => deleteCS(cs.id));

      grid.appendChild(card);
    });
  }

  const duplicateCS = async (csId) => {
    let list = await getFreshBetroCaseStudies();
    const target = list.find(item => item.id === csId);
    if (!target) return;

    const copyCS = JSON.parse(JSON.stringify(target));
    copyCS.id = "cs-" + Date.now();
    copyCS.companyName = target.companyName + " (Copy)";
    copyCS.slug = (target.slug || "project") + "-copy-" + Math.floor(Math.random() * 1000);
    copyCS.status = "draft";

    list.push(copyCS);
    if (window.BetroDB) {
      try { await BetroDB.saveCaseStudy(copyCS); } catch (e) { console.error("Cloud duplicate error:", e); }
    }
    await saveBetroCaseStudies(list);
    renderCaseStudiesTab();
    showAdminToast(`Duplicated "${target.companyName}" as draft.`, "success");
  };

  const toggleCSStatus = async (csId) => {
    let list = await getFreshBetroCaseStudies();
    let updatedCS = null;
    list = list.map(cs => {
      if (cs.id === csId) {
        const newStatus = cs.status === "draft" ? "published" : "draft";
        updatedCS = { ...cs, status: newStatus };
        return updatedCS;
      }
      return cs;
    });
    if (updatedCS && window.BetroDB) {
      try { await BetroDB.saveCaseStudy(updatedCS); } catch (e) { console.error("Cloud status toggle error:", e); }
    }
    await saveBetroCaseStudies(list);
    renderCaseStudiesTab();
    showAdminToast(`Project is now ${updatedCS?.status === "published" ? "Live (Published)" : "Draft (Hidden)"}.`, "info");
  };

  const deleteCS = async (csId) => {
    if (!confirm("Are you sure you want to delete this Case Study? This cannot be undone.")) return;
    if (window.BetroDB) {
      try { await BetroDB.deleteCaseStudy(csId); } catch (e) { console.error("Cloud delete error:", e); }
    }
    let list = await getFreshBetroCaseStudies();
    list = list.filter(cs => cs.id !== csId);
    await saveBetroCaseStudies(list);
    renderCaseStudiesTab();
    showAdminToast("Case Study removed successfully.", "info");
  };

  // Case Study Editor Controls & Tabs Initialization
  const csModal = document.getElementById("cs-editor-modal");
  const csForm = document.getElementById("cs-editor-form");
  const addCSBtn = document.getElementById("add-casestudy-btn");
  const closeCSModalBtn = document.getElementById("close-cs-modal-btn");

  // Sub-Tab Switcher inside Editor
  document.querySelectorAll(".cs-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cs-tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".cs-tab-content").forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-cstab");
      document.getElementById(`cstab-${targetId}`)?.classList.add("active");
    });
  });

  // Responsive Viewport Switcher Buttons
  document.querySelectorAll(".cs-device-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cs-device-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const device = btn.getAttribute("data-device");
      const previewContainer = document.getElementById("cs-live-preview-content");
      const label = document.getElementById("preview-viewport-label");

      if (previewContainer) {
        previewContainer.className = `cs-live-preview-container ${device}-mode`;
      }
      if (label) {
        label.textContent = device === "desktop" ? "Desktop View (100%)" : device === "tablet" ? "Tablet View (768px)" : "Mobile View (375px)";
      }
    });
  });

  // Toggle Live Preview Pane
  const togglePreviewBtn = document.getElementById("toggle-cs-preview-btn");
  const previewPane = document.getElementById("cs-preview-pane");
  const editorLeftPane = document.querySelector(".cs-editor-left-pane");
  const togglePreviewText = document.getElementById("toggle-preview-text");

  if (togglePreviewBtn) {
    togglePreviewBtn.addEventListener("click", () => {
      if (previewPane?.classList.contains("hidden")) {
        previewPane.classList.remove("hidden");
        editorLeftPane?.classList.remove("full-width");
        if (togglePreviewText) togglePreviewText.textContent = "Hide Live Preview";
      } else {
        previewPane?.classList.add("hidden");
        editorLeftPane?.classList.add("full-width");
        if (togglePreviewText) togglePreviewText.textContent = "Show Live Preview";
      }
    });
  }

  // --- LOGO, CARD THUMBNAIL & HERO BANNER UPLOAD HANDLERS ---
  const setupSingleAssetUploader = (dropzoneId, inputId, previewBoxId, previewImgId, placeholderId, hiddenValId, replaceBtnId, deleteBtnId, libraryBtnId, defaultFolder, progressBoxId, progressFillId, statusTextId) => {
    const dropzone = document.getElementById(dropzoneId);
    const fileInput = document.getElementById(inputId);
    const previewImg = document.getElementById(previewImgId);
    const placeholder = document.getElementById(placeholderId);
    const hiddenVal = document.getElementById(hiddenValId);
    const replaceBtn = document.getElementById(replaceBtnId);
    const deleteBtn = document.getElementById(deleteBtnId);
    const libraryBtn = document.getElementById(libraryBtnId);

    const progressBox = document.getElementById(progressBoxId);
    const progressFill = document.getElementById(progressFillId);
    const statusText = document.getElementById(statusTextId);

    const updatePreview = (url) => {
      if (hiddenVal) hiddenVal.value = url || "";
      if (url) {
        if (previewImg) { previewImg.src = url; previewImg.classList.remove("hidden"); }
        if (placeholder) placeholder.classList.add("hidden");
        if (replaceBtn) replaceBtn.classList.remove("hidden");
        if (deleteBtn) deleteBtn.classList.remove("hidden");
      } else {
        if (previewImg) { previewImg.src = ""; previewImg.classList.add("hidden"); }
        if (placeholder) placeholder.classList.remove("hidden");
        if (replaceBtn) replaceBtn.classList.add("hidden");
        if (deleteBtn) deleteBtn.classList.add("hidden");
      }
      markEditorDirty();
      updateLivePreview();
    };

    const handleUploadProcess = (file) => {
      if (!file) return;

      if (progressBox) progressBox.classList.remove("hidden");
      if (progressFill) progressFill.style.width = "0%";
      if (statusText) {
        statusText.className = "card-upload-status-text";
        statusText.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Uploading... 0%`;
      }

      uploadMediaFile(file, defaultFolder, (prog) => {
        if (progressFill) progressFill.style.width = prog.pct + "%";
        if (statusText) {
          if (prog.status === "error") {
            statusText.className = "card-upload-status-text error";
            statusText.innerHTML = `<i class="ri-error-warning-line"></i> ${prog.text} <button type="button" class="retry-single-upload-btn" style="margin-left: 8px; background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; cursor: pointer;">Retry</button>`;
            const retryBtn = statusText.querySelector(".retry-single-upload-btn");
            if (retryBtn) retryBtn.onclick = (e) => { e.stopPropagation(); handleUploadProcess(file); };
          } else if (prog.status === "processing") {
            statusText.className = "card-upload-status-text processing";
            statusText.innerHTML = `<i class="ri-settings-4-line ri-spin"></i> ${prog.text}`;
          } else if (prog.status === "success") {
            statusText.className = "card-upload-status-text";
            statusText.innerHTML = `<i class="ri-checkbox-circle-line" style="color: #4ab96c;"></i> ${prog.text}`;
          } else {
            statusText.className = "card-upload-status-text";
            statusText.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> ${prog.text} (${prog.pct}%)`;
          }
        }
      })
        .then(asset => {
          updatePreview(asset.url);
          setTimeout(() => {
            if (progressBox) progressBox.classList.add("hidden");
          }, 1800);
        })
        .catch(err => {
          console.error("Single asset upload failed:", err);
        });
    };

    if (dropzone) {
      dropzone.addEventListener("click", () => fileInput?.click());
      dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.style.borderColor = "var(--accent-color)"; });
      dropzone.addEventListener("dragleave", () => { dropzone.style.borderColor = ""; });
      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "";
        const file = e.dataTransfer.files[0];
        if (file) handleUploadProcess(file);
      });
    }

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) handleUploadProcess(file);
      });
    }

    if (libraryBtn) {
      libraryBtn.addEventListener("click", () => {
        openMediaPicker((url) => updatePreview(url));
      });
    }

    if (replaceBtn) replaceBtn.addEventListener("click", () => fileInput?.click());
    if (deleteBtn) deleteBtn.addEventListener("click", () => updatePreview(""));
  };

  setupSingleAssetUploader("logo-dropzone", "logo-file-input", "logo-preview-box", "logo-preview-img", "logo-preview-placeholder", "cs-logo-url", "logo-replace-btn", "logo-delete-btn", "logo-select-library-btn", "logos", "logo-upload-progress", "logo-upload-progress-fill", "logo-upload-status-text");
  setupSingleAssetUploader("cardimg-dropzone", "cardimg-file-input", "cardimg-preview-box", "cardimg-preview-img", "cardimg-preview-placeholder", "cs-cardimg-url", "cardimg-replace-btn", "cardimg-delete-btn", "cardimg-select-library-btn", "banners", "cardimg-upload-progress", "cardimg-upload-progress-fill", "cardimg-upload-status-text");
  setupSingleAssetUploader("hero-dropzone", "hero-file-input", "hero-preview-box", "hero-preview-img", "hero-preview-placeholder", "cs-hero-url", "hero-replace-btn", "hero-delete-btn", "hero-select-library-btn", "banners", "hero-upload-progress", "hero-upload-progress-fill", "hero-upload-status-text");
  setupSingleAssetUploader("desktop-mockup-dropzone", "desktop-mockup-file-input", "desktop-mockup-preview-box", "desktop-mockup-preview-img", "desktop-mockup-preview-placeholder", "cs-desktop-mockup-url", "desktop-mockup-replace-btn", "desktop-mockup-delete-btn", "desktop-mockup-select-library-btn", "mockups", "desktop-mockup-upload-progress", "desktop-mockup-upload-progress-fill", "desktop-mockup-upload-status-text");
  setupSingleAssetUploader("mobile-mockup-dropzone", "mobile-mockup-file-input", "mobile-mockup-preview-box", "mobile-mockup-preview-img", "mobile-mockup-preview-placeholder", "cs-mobile-mockup-url", "mobile-mockup-replace-btn", "mobile-mockup-delete-btn", "mobile-mockup-select-library-btn", "mockups", "mobile-mockup-upload-progress", "mobile-mockup-upload-progress-fill", "mobile-mockup-upload-status-text");


  // --- SERVICE TAGS SYSTEM ---
  const renderTagsList = () => {
    const listContainer = document.getElementById("cs-tags-list");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    if (activeTags.length === 0) {
      listContainer.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-secondary);">No tags added yet. Click presets or add custom tags above!</span>`;
      return;
    }

    activeTags.forEach((tag, idx) => {
      const pill = document.createElement("div");
      pill.className = "tag-pill-item";
      pill.innerHTML = `
        <span>${tag}</span>
        <button type="button" class="remove-tag-btn" data-index="${idx}"><i class="ri-close-line"></i></button>
      `;
      pill.querySelector(".remove-tag-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        activeTags.splice(idx, 1);
        renderTagsList();
        markEditorDirty();
        updateLivePreview();
      });
      listContainer.appendChild(pill);
    });
  };

  document.querySelectorAll(".preset-tag-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const tag = chip.getAttribute("data-tag");
      if (tag && !activeTags.includes(tag)) {
        activeTags.push(tag);
        renderTagsList();
        markEditorDirty();
        updateLivePreview();
      }
    });
  });

  const addTagBtn = document.getElementById("cs-add-tag-btn");
  const customTagInput = document.getElementById("cs-custom-tag-input");

  if (addTagBtn && customTagInput) {
    addTagBtn.addEventListener("click", () => {
      const val = customTagInput.value.trim();
      if (val && !activeTags.includes(val)) {
        activeTags.push(val);
        customTagInput.value = "";
        renderTagsList();
        markEditorDirty();
        updateLivePreview();
      }
    });
  }


  // --- SHOWCASE GALLERY MANAGER & VIDEO SHOWCASE ---
  const renderShowcaseGallery = () => {
    const grid = document.getElementById("cs-gallery-items-grid");
    if (!grid) return;
    grid.innerHTML = "";

    if (activeGallery.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1 / -1; padding: 1.5rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">No gallery images in database. Drag and drop images above to upload!</div>`;
      return;
    }

    activeGallery.forEach((item, idx) => {
      const url = typeof item === "string" ? item : (item ? item.url : "");
      const isVideo = (typeof item === "object" && item.type === "video") || url.endsWith(".mp4") || url.endsWith(".webm");

      const card = document.createElement("div");
      card.className = "showcase-item-card";

      const mediaHtml = isVideo
        ? `<video src="${url}" muted style="width: 100%; height: 100%; object-fit: cover;"></video>`
        : `<img src="${url}" alt="Gallery Image ${idx + 1}">`;

      card.innerHTML = `
        ${mediaHtml}
        <button type="button" class="gal-delete-badge del-gal-btn" title="Delete Image">
          <i class="ri-delete-bin-line"></i>
        </button>
        <div class="showcase-item-actions">
          <button type="button" class="mini-gal-btn move-left-gal-btn" ${idx === 0 ? 'disabled' : ''} title="Move Left"><i class="ri-arrow-left-s-line"></i></button>
          <button type="button" class="mini-gal-btn move-right-gal-btn" ${idx === activeGallery.length - 1 ? 'disabled' : ''} title="Move Right"><i class="ri-arrow-right-s-line"></i></button>
          <button type="button" class="mini-gal-btn replace-gal-btn" title="Replace Image"><i class="ri-refresh-line"></i></button>
        </div>
      `;

      card.querySelector(".move-left-gal-btn")?.addEventListener("click", async () => {
        if (idx > 0) {
          const temp = activeGallery[idx];
          activeGallery[idx] = activeGallery[idx - 1];
          activeGallery[idx - 1] = temp;
          await persistCurrentCaseStudyMedia();
          renderShowcaseGallery();
          markEditorDirty();
          updateLivePreview();
        }
      });

      card.querySelector(".move-right-gal-btn")?.addEventListener("click", async () => {
        if (idx < activeGallery.length - 1) {
          const temp = activeGallery[idx];
          activeGallery[idx] = activeGallery[idx + 1];
          activeGallery[idx + 1] = temp;
          await persistCurrentCaseStudyMedia();
          renderShowcaseGallery();
          markEditorDirty();
          updateLivePreview();
        }
      });

      card.querySelector(".replace-gal-btn")?.addEventListener("click", () => {
        openMediaPicker(async (newUrl) => {
          const currentCsId = document.getElementById("cs-edit-id")?.value;
          const currentSlug = document.getElementById("cs-slug")?.value || "project";
          activeGallery[idx] = normalizeMediaAsset(newUrl, currentCsId, currentSlug, "image", "creative_showcase", idx);
          await persistCurrentCaseStudyMedia();
          renderShowcaseGallery();
          markEditorDirty();
          updateLivePreview();
        });
      });

      card.querySelector(".del-gal-btn")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        activeGallery.splice(idx, 1);
        await persistCurrentCaseStudyMedia();
        renderShowcaseGallery();
        markEditorDirty();
        updateLivePreview();
        showAdminToast("Image removed from gallery.", "info");
      });

      grid.appendChild(card);
    });
  };

  const handleGalleryFilesUpload = async (files) => {
    if (!files || files.length === 0) return;
    const currentCsId = document.getElementById("cs-edit-id")?.value;
    const currentSlug = document.getElementById("cs-slug")?.value || "project";

    updateUploadStatus("gallery", "uploading", `Uploading ${files.length} gallery image(s)...`);
    showAdminToast(`Uploading ${files.length} gallery image(s)...`, "processing");

    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        updateUploadStatus("gallery", "processing", `Processing & optimizing (${i + 1}/${files.length}): ${file.name}...`);
        const asset = await uploadMediaFile(file, "showcase");

        updateUploadStatus("gallery", "saving", `Saving (${i + 1}/${files.length}): ${file.name} to database...`);
        const structured = normalizeMediaAsset(
          asset,
          currentCsId || "cs-new",
          currentSlug,
          "image",
          "creative_showcase",
          activeGallery.length
        );
        activeGallery.push(structured);
        successCount++;
      } catch (err) {
        console.error("Gallery upload error on", file.name, err);
        const errText = typeof err === "string" ? err : (err.message || "Upload failed");
        updateUploadStatus("gallery", "error", `Upload failed on ${file.name}: ${errText}`);
        showAdminToast(`Failed to upload ${file.name}: ${errText}`, "error", 5000);
      }
    }

    if (successCount > 0) {
      updateUploadStatus("gallery", "saving", "Persisting media records to database...");
      await persistCurrentCaseStudyMedia();
      renderShowcaseGallery();
      markEditorDirty();
      updateLivePreview();
      updateUploadStatus("gallery", "success", `Saved successfully! ${successCount} image(s) active in database & live on site.`);
      showAdminToast(`All ${successCount} gallery image(s) saved & synchronized successfully!`, "success");
    }
  };

  const galleryUploadInput = document.getElementById("gallery-multi-upload");
  if (galleryUploadInput) {
    galleryUploadInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      handleGalleryFilesUpload(files);
      e.target.value = "";
    });
  }

  const galleryDropzoneBox = document.getElementById("gallery-dropzone-box");
  if (galleryDropzoneBox) {
    galleryDropzoneBox.addEventListener("click", () => galleryUploadInput?.click());
    galleryDropzoneBox.addEventListener("dragover", (e) => {
      e.preventDefault();
      galleryDropzoneBox.style.borderColor = "var(--accent-color)";
    });
    galleryDropzoneBox.addEventListener("dragleave", () => {
      galleryDropzoneBox.style.borderColor = "";
    });
    galleryDropzoneBox.addEventListener("drop", (e) => {
      e.preventDefault();
      galleryDropzoneBox.style.borderColor = "";
      const files = Array.from(e.dataTransfer.files);
      handleGalleryFilesUpload(files);
    });
  }

  document.getElementById("gallery-select-library-btn")?.addEventListener("click", () => {
    openMediaPicker(async (url) => {
      const currentCsId = document.getElementById("cs-edit-id")?.value;
      const currentSlug = document.getElementById("cs-slug")?.value || "project";
      const structured = normalizeMediaAsset(
        url,
        currentCsId || "cs-new",
        currentSlug,
        "image",
        "creative_showcase",
        activeGallery.length
      );
      activeGallery.push(structured);
      await persistCurrentCaseStudyMedia();
      renderShowcaseGallery();
      markEditorDirty();
      updateLivePreview();
      showAdminToast("Selected asset linked to gallery & saved!", "success");
    });
  });

  // Render Videos Showcase
  const renderVideosList = () => {
    const list = document.getElementById("cs-video-items-list");
    if (!list) return;
    list.innerHTML = "";

    if (activeVideos.length === 0) {
      list.innerHTML = `<div style="padding: 1rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">No showcase videos in database. Upload an MP4/WEBM or add an embed above!</div>`;
      return;
    }

    activeVideos.forEach((vid, idx) => {
      const vidUrl = typeof vid === "string" ? vid : (vid ? vid.url : "");
      const isEmbed = vidUrl.includes("youtube.com") || vidUrl.includes("vimeo.com") || vidUrl.includes("embed");

      const item = document.createElement("div");
      item.className = "video-item-card";

      let thumb = isEmbed
        ? `<iframe src="${vidUrl}" allowfullscreen style="border: none;"></iframe>`
        : `<video src="${vidUrl}" controls preload="metadata"></video>`;

      item.innerHTML = `
        <div class="video-thumb-preview">${thumb}</div>
        <div style="flex: 1;">
          <strong style="display: block; font-size: 0.85rem; color: var(--text-primary); margin-bottom: 4px;">Video Asset ${idx + 1}</strong>
          <span style="font-size: 0.75rem; color: var(--text-secondary); font-family: monospace;">${vidUrl.substring(0, 45)}...</span>
        </div>
        <div style="display: flex; gap: 4px;">
          <button type="button" class="admin-btn secondary-btn move-up-vid-btn" ${idx === 0 ? 'disabled' : ''} style="padding: 6px 10px;" title="Move Up"><i class="ri-arrow-up-s-line"></i></button>
          <button type="button" class="admin-btn secondary-btn move-down-vid-btn" ${idx === activeVideos.length - 1 ? 'disabled' : ''} style="padding: 6px 10px;" title="Move Down"><i class="ri-arrow-down-s-line"></i></button>
          <button type="button" class="admin-btn danger-btn del-vid-btn" style="padding: 6px 10px;"><i class="ri-delete-bin-line"></i> Remove</button>
        </div>
      `;

      item.querySelector(".move-up-vid-btn")?.addEventListener("click", async () => {
        if (idx > 0) {
          const temp = activeVideos[idx];
          activeVideos[idx] = activeVideos[idx - 1];
          activeVideos[idx - 1] = temp;
          await persistCurrentCaseStudyMedia();
          renderVideosList();
          markEditorDirty();
          updateLivePreview();
        }
      });

      item.querySelector(".move-down-vid-btn")?.addEventListener("click", async () => {
        if (idx < activeVideos.length - 1) {
          const temp = activeVideos[idx];
          activeVideos[idx] = activeVideos[idx + 1];
          activeVideos[idx + 1] = temp;
          await persistCurrentCaseStudyMedia();
          renderVideosList();
          markEditorDirty();
          updateLivePreview();
        }
      });

      item.querySelector(".del-vid-btn")?.addEventListener("click", async () => {
        activeVideos.splice(idx, 1);
        await persistCurrentCaseStudyMedia();
        renderVideosList();
        markEditorDirty();
        updateLivePreview();
        showAdminToast("Video removed from Case Study.", "info");
      });

      list.appendChild(item);
    });
  };

  document.getElementById("video-file-upload")?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const currentCsId = document.getElementById("cs-edit-id")?.value;
    const currentSlug = document.getElementById("cs-slug")?.value || "project";

    try {
      updateUploadStatus("video", "uploading", `Uploading video "${file.name}"...`);
      showAdminToast(`Processing video "${file.name}"...`, "processing");

      const asset = await uploadMediaFile(file, "videos", (prog) => {
        if (prog.status === "uploading") updateUploadStatus("video", "uploading", prog.text);
        if (prog.status === "processing") updateUploadStatus("video", "processing", prog.text);
        if (prog.status === "saving") updateUploadStatus("video", "saving", prog.text);
      });

      updateUploadStatus("video", "saving", `Saving video to database...`);
      const structured = normalizeMediaAsset(
        asset,
        currentCsId || "cs-new",
        currentSlug,
        "video",
        "video_showcase",
        activeVideos.length
      );
      activeVideos.push(structured);

      await persistCurrentCaseStudyMedia();
      renderVideosList();
      markEditorDirty();
      updateLivePreview();
      updateUploadStatus("video", "success", `Video "${file.name}" saved successfully & live on site.`);
      showAdminToast(`Video "${file.name}" saved & linked successfully!`, "success");
    } catch (err) {
      console.error("Video upload error:", err);
      const errText = typeof err === "string" ? err : (err.message || "Video upload failed");
      updateUploadStatus("video", "error", `Video upload failed: ${errText}`);
      showAdminToast(`Video upload failed: ${errText}`, "error", 5000);
    } finally {
      e.target.value = "";
    }
  });

  document.getElementById("add-youtube-embed-btn")?.addEventListener("click", async () => {
    const url = prompt("Enter YouTube Embed URL (e.g. https://www.youtube.com/embed/YOUR_VIDEO_ID):");
    if (url && url.trim()) {
      const currentCsId = document.getElementById("cs-edit-id")?.value;
      const currentSlug = document.getElementById("cs-slug")?.value || "project";
      const structured = normalizeMediaAsset(
        { url: url.trim(), name: "YouTube Video" },
        currentCsId || "cs-new",
        currentSlug,
        "video",
        "video_showcase",
        activeVideos.length
      );
      activeVideos.push(structured);
      await persistCurrentCaseStudyMedia();
      renderVideosList();
      markEditorDirty();
      updateLivePreview();
      showAdminToast("YouTube video added & synchronized!", "success");
    }
  });

  document.getElementById("add-vimeo-embed-btn")?.addEventListener("click", async () => {
    const url = prompt("Enter Vimeo Embed URL (e.g. https://player.vimeo.com/video/123456789):");
    if (url && url.trim()) {
      const currentCsId = document.getElementById("cs-edit-id")?.value;
      const currentSlug = document.getElementById("cs-slug")?.value || "project";
      const structured = normalizeMediaAsset(
        { url: url.trim(), name: "Vimeo Video" },
        currentCsId || "cs-new",
        currentSlug,
        "video",
        "video_showcase",
        activeVideos.length
      );
      activeVideos.push(structured);
      await persistCurrentCaseStudyMedia();
      renderVideosList();
      markEditorDirty();
      updateLivePreview();
      showAdminToast("Vimeo video added & synchronized!", "success");
    }
  });


  // --- PROJECT GALLERY SECTIONS (MULTI-SECTION SHOWCASE) ---
  const renderGallerySections = () => {
    const list = document.getElementById("cs-gallery-sections-list");
    if (!list) return;
    list.innerHTML = "";

    if (activeGallerySections.length === 0) {
      list.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">No showcase sections added yet. Click "Add Showcase Section" above!</div>`;
      return;
    }

    activeGallerySections.forEach((sec, idx) => {
      const card = document.createElement("div");
      card.className = "block-builder-card";
      card.innerHTML = `
        <div class="block-card-header">
          <span class="block-title-tag"><i class="ri-folder-4-line"></i> Section ${idx + 1}: ${sec.title || "Untitled Section"}</span>
          <div class="block-controls">
            <button type="button" class="move-up-sec" data-idx="${idx}"><i class="ri-arrow-up-s-line"></i></button>
            <button type="button" class="move-down-sec" data-idx="${idx}"><i class="ri-arrow-down-s-line"></i></button>
            <button type="button" class="del-sec" data-idx="${idx}"><i class="ri-delete-bin-line"></i></button>
          </div>
        </div>
        <div class="block-card-body">
          <div class="form-group">
            <label>Section Title (e.g. Brand Identity, Packaging, Video Production)</label>
            <input type="text" class="form-input sec-title-input" value="${sec.title || ''}">
          </div>
          <div class="form-group">
            <label>Section Description</label>
            <textarea rows="2" class="form-input sec-desc-input">${sec.description || ''}</textarea>
          </div>
        </div>
      `;

      card.querySelector(".sec-title-input").addEventListener("input", (e) => {
        sec.title = e.target.value;
        markEditorDirty();
        updateLivePreview();
      });

      card.querySelector(".sec-desc-input").addEventListener("input", (e) => {
        sec.description = e.target.value;
        markEditorDirty();
        updateLivePreview();
      });

      card.querySelector(".del-sec").addEventListener("click", () => {
        activeGallerySections.splice(idx, 1);
        renderGallerySections();
        markEditorDirty();
        updateLivePreview();
      });

      list.appendChild(card);
    });
  };

  document.getElementById("add-gallery-section-btn")?.addEventListener("click", () => {
    activeGallerySections.push({ title: "New Showcase Section", description: "", media: [] });
    renderGallerySections();
    markEditorDirty();
    updateLivePreview();
  });


  // --- MODULAR CONTENT BLOCKS BUILDER ---
  const renderBlocksContainer = () => {
    const container = document.getElementById("cs-blocks-container");
    if (!container) return;
    container.innerHTML = "";

    if (activeBlocks.length === 0) {
      container.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">No content blocks added yet. Use the toolbar above to add text, image, video, quote, or stats blocks!</div>`;
      return;
    }

    activeBlocks.forEach((block, idx) => {
      const card = document.createElement("div");
      card.className = "block-builder-card";
      card.innerHTML = `
        <div class="block-card-header">
          <span class="block-title-tag"><i class="ri-drag-drop-line"></i> Block ${idx + 1}: ${block.type.toUpperCase()}</span>
          <div class="block-controls">
            <button type="button" class="move-up-blk" data-idx="${idx}"><i class="ri-arrow-up-s-line"></i></button>
            <button type="button" class="move-down-blk" data-idx="${idx}"><i class="ri-arrow-down-s-line"></i></button>
            <button type="button" class="del-blk" data-idx="${idx}"><i class="ri-delete-bin-line"></i></button>
          </div>
        </div>
        <div class="block-card-body">
          <div class="form-group">
            <label>Heading / Title</label>
            <input type="text" class="form-input blk-heading" value="${block.heading || ''}">
          </div>
          <div class="form-group">
            <label>Content / Body Text</label>
            <textarea rows="3" class="form-input blk-body">${block.body || ''}</textarea>
          </div>
        </div>
      `;

      card.querySelector(".blk-heading").addEventListener("input", (e) => {
        block.heading = e.target.value;
        markEditorDirty();
        updateLivePreview();
      });

      card.querySelector(".blk-body").addEventListener("input", (e) => {
        block.body = e.target.value;
        markEditorDirty();
        updateLivePreview();
      });

      card.querySelector(".del-blk").addEventListener("click", () => {
        activeBlocks.splice(idx, 1);
        renderBlocksContainer();
        markEditorDirty();
        updateLivePreview();
      });

      container.appendChild(card);
    });
  };

  document.querySelectorAll(".block-add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-blocktype");
      activeBlocks.push({ id: "blk-" + Date.now(), type, heading: `${type.toUpperCase()} Section`, body: "" });
      renderBlocksContainer();
      markEditorDirty();
      updateLivePreview();
    });
  });


  // --- SEO PANEL CHAR COUNTERS ---
  const seoTitleInput = document.getElementById("cs-seo-title");
  const seoDescInput = document.getElementById("cs-seo-desc");
  const seoTitleCount = document.getElementById("seo-title-count");
  const seoDescCount = document.getElementById("seo-desc-count");

  if (seoTitleInput && seoTitleCount) {
    seoTitleInput.addEventListener("input", () => {
      seoTitleCount.textContent = `${seoTitleInput.value.length} / 60 chars`;
      markEditorDirty();
    });
  }

  if (seoDescInput && seoDescCount) {
    seoDescInput.addEventListener("input", () => {
      seoDescCount.textContent = `${seoDescInput.value.length} / 160 chars`;
      markEditorDirty();
    });
  }

  document.getElementById("seo-og-select-btn")?.addEventListener("click", () => {
    openMediaPicker((url) => {
      const og = document.getElementById("cs-seo-ogimage");
      if (og) og.value = url;
      markEditorDirty();
    });
  });


  // --- SECTION VISIBILITY & ORDER CONTROL ENGINE ---
  const renderSectionVisibilityTab = () => {
    const grid = document.getElementById("cs-section-vis-grid");
    if (!grid) return;
    grid.innerHTML = "";

    // Guarantee activeSectionOrder contains all keys
    STANDARD_CASE_STUDY_SECTIONS.forEach(s => {
      if (!activeSectionOrder.includes(s.key)) {
        activeSectionOrder.push(s.key);
      }
      if (activeSectionVisibility[s.key] === undefined) {
        activeSectionVisibility[s.key] = s.defaultVisible;
      }
    });

    activeSectionOrder.forEach((secKey, idx) => {
      const secDef = STANDARD_CASE_STUDY_SECTIONS.find(s => s.key === secKey) || { key: secKey, name: secKey.replace(/_/g, " ").toUpperCase(), defaultVisible: true };
      const isVisible = activeSectionVisibility[secKey] !== false;

      const card = document.createElement("div");
      card.className = `section-vis-card ${isVisible ? '' : 'disabled'}`;
      card.innerHTML = `
        <div class="section-vis-left">
          <div class="section-order-controls">
            <button type="button" class="section-order-btn move-up-btn" ${idx === 0 ? 'disabled' : ''} title="Move Up"><i class="ri-arrow-up-s-line"></i></button>
            <button type="button" class="section-order-btn move-down-btn" ${idx === activeSectionOrder.length - 1 ? 'disabled' : ''} title="Move Down"><i class="ri-arrow-down-s-line"></i></button>
          </div>
          <div class="section-info">
            <span class="section-info-name">${secDef.name}</span>
            <span class="section-info-key">Section key: ${secDef.key}</span>
          </div>
        </div>
        <div class="section-vis-right">
          <span class="vis-status-badge ${isVisible ? 'on' : 'off'}">${isVisible ? '<i class="ri-eye-line"></i> Visible' : '<i class="ri-eye-off-line"></i> Hidden'}</span>
          <label class="vis-switch-label">
            <input type="checkbox" class="vis-switch-input" ${isVisible ? 'checked' : ''} data-key="${secKey}">
            <span class="vis-switch-slider"></span>
          </label>
        </div>
      `;

      card.querySelector(".vis-switch-input").addEventListener("change", (e) => {
        const checked = e.target.checked;
        activeSectionVisibility[secKey] = checked;
        renderSectionVisibilityTab();
        markEditorDirty();
        updateLivePreview();
        triggerInstantSave();
      });

      card.querySelector(".move-up-btn").addEventListener("click", () => {
        if (idx > 0) {
          const temp = activeSectionOrder[idx];
          activeSectionOrder[idx] = activeSectionOrder[idx - 1];
          activeSectionOrder[idx - 1] = temp;
          renderSectionVisibilityTab();
          markEditorDirty();
          updateLivePreview();
          triggerInstantSave();
        }
      });

      card.querySelector(".move-down-btn").addEventListener("click", () => {
        if (idx < activeSectionOrder.length - 1) {
          const temp = activeSectionOrder[idx];
          activeSectionOrder[idx] = activeSectionOrder[idx + 1];
          activeSectionOrder[idx + 1] = temp;
          renderSectionVisibilityTab();
          markEditorDirty();
          updateLivePreview();
          triggerInstantSave();
        }
      });

      grid.appendChild(card);
    });
  };


  document.getElementById("cs-vis-enable-all-btn")?.addEventListener("click", () => {
    STANDARD_CASE_STUDY_SECTIONS.forEach(s => activeSectionVisibility[s.key] = true);
    renderSectionVisibilityTab();
    markEditorDirty();
    updateLivePreview();
    triggerInstantSave();
  });

  document.getElementById("cs-vis-disable-all-btn")?.addEventListener("click", () => {
    STANDARD_CASE_STUDY_SECTIONS.forEach(s => activeSectionVisibility[s.key] = false);
    renderSectionVisibilityTab();
    markEditorDirty();
    updateLivePreview();
    triggerInstantSave();
  });

  document.getElementById("cs-vis-reset-order-btn")?.addEventListener("click", () => {
    activeSectionOrder = STANDARD_CASE_STUDY_SECTIONS.map(s => s.key);
    renderSectionVisibilityTab();
    markEditorDirty();
    updateLivePreview();
    triggerInstantSave();
  });


  // --- REAL-TIME RESPONSIVE LIVE PREVIEW SYNCHRONIZER ---
  const updateLivePreview = () => {
    const container = document.getElementById("cs-live-preview-content");
    if (!container) return;

    const companyName = document.getElementById("cs-company-name")?.value || "Company Name";
    const category = document.getElementById("cs-category")?.value || "Category Pill";
    const logoUrl = document.getElementById("cs-logo-url")?.value || "images/logo.png";
    const heroUrl = document.getElementById("cs-hero-url")?.value || "images/p1.jpg";
    const shortIntro = document.getElementById("cs-short-intro")?.value || "Short project intro tagline...";
    const brandStory = document.getElementById("cs-brand-story")?.value || "Brand background story...";
    const brandGoals = document.getElementById("cs-brand-goals")?.value || "Project targets & goals...";

    const challenge = document.getElementById("cs-overview-challenge")?.value || "";
    const strategy = document.getElementById("cs-overview-strategy")?.value || "";
    const solution = document.getElementById("cs-overview-solution")?.value || "";
    const execution = document.getElementById("cs-overview-execution")?.value || "";
    const resultsText = document.getElementById("cs-overview-results")?.value || "";

    const stat1Num = document.getElementById("cs-stat1-num")?.value || "+500K";
    const stat1Label = document.getElementById("cs-stat1-label")?.value || "Reel Views";
    const stat2Num = document.getElementById("cs-stat2-num")?.value || "+60%";
    const stat2Label = document.getElementById("cs-stat2-label")?.value || "Footfall";
    const stat3Num = document.getElementById("cs-stat3-num")?.value || "4.2x";
    const stat3Label = document.getElementById("cs-stat3-label")?.value || "ROI";
    const stat4Num = document.getElementById("cs-stat4-num")?.value || "100%";
    const stat4Label = document.getElementById("cs-stat4-label")?.value || "Satisfaction";

    const feedbackQuote = document.getElementById("cs-feedback-quote")?.value || "";
    const feedbackAuthor = document.getElementById("cs-feedback-author")?.value || "";
    const conclusion = document.getElementById("cs-conclusion")?.value || "";

    let tagsHtml = activeTags.map(t => `<span class="pv-service-tag">${t}</span>`).join("");
    if (!tagsHtml) tagsHtml = `<span class="pv-service-tag">Creative Design</span>`;

    let galleryHtml = activeGallery.map(img => `<div class="pv-gallery-thumb"><img src="${img}"></div>`).join("");

    // Section Dictionary matching activeSectionVisibility
    const previewSectionBlocks = {
      hero: `
        <div class="pv-hero" style="background-image: url('${heroUrl}');">
          <div class="pv-hero-overlay"></div>
          <div class="pv-hero-content">
            <img src="${logoUrl}" class="pv-logo" alt="Logo">
            <span class="pv-pill">${category}</span>
            <h1 class="pv-title">${companyName}</h1>
            <p style="color: #9ca3af; font-size: 0.95rem;">${shortIntro}</p>
          </div>
        </div>
      `,
      company_overview: `
        <div class="pv-section">
          <h3 class="pv-section-heading">Company Overview</h3>
          <p class="pv-text">${shortIntro || brandStory}</p>
        </div>
      `,
      brand_story: `
        <div class="pv-section">
          <h3 class="pv-section-heading">Brand Story & Background</h3>
          <p class="pv-text">${brandStory}</p>
        </div>
      `,
      project_objectives: `
        <div class="pv-section">
          <h3 class="pv-section-heading">Project Objectives & Business Goals</h3>
          <p class="pv-text">${brandGoals}</p>
        </div>
      `,
      services: `
        <div class="pv-section">
          <h3 class="pv-section-heading">Services Provided</h3>
          <div class="pv-services-grid">${tagsHtml}</div>
        </div>
      `,
      project_overview: (challenge || strategy || solution || execution) ? `
        <div class="pv-section">
          <h3 class="pv-section-heading">Project Overview</h3>
          ${challenge ? `<p class="pv-text"><strong>Challenge:</strong> ${challenge}</p>` : ''}
          ${strategy ? `<p class="pv-text" style="margin-top: 0.5rem;"><strong>Strategy:</strong> ${strategy}</p>` : ''}
          ${solution ? `<p class="pv-text" style="margin-top: 0.5rem;"><strong>Solution:</strong> ${solution}</p>` : ''}
          ${execution ? `<p class="pv-text" style="margin-top: 0.5rem;"><strong>Execution:</strong> ${execution}</p>` : ''}
        </div>
      ` : '',
      challenge: challenge ? `<div class="pv-section"><h3 class="pv-section-heading">Challenge</h3><p class="pv-text">${challenge}</p></div>` : '',
      strategy: strategy ? `<div class="pv-section"><h3 class="pv-section-heading">Strategy</h3><p class="pv-text">${strategy}</p></div>` : '',
      solution: solution ? `<div class="pv-section"><h3 class="pv-section-heading">Solution</h3><p class="pv-text">${solution}</p></div>` : '',
      execution: execution ? `<div class="pv-section"><h3 class="pv-section-heading">Execution</h3><p class="pv-text">${execution}</p></div>` : '',
      results_summary: resultsText ? `<div class="pv-section"><h3 class="pv-section-heading">Results</h3><p class="pv-text">${resultsText}</p></div>` : '',
      results_impact: `
        <div class="pv-section">
          <h3 class="pv-section-heading">Results & Impact</h3>
          <div class="pv-stats-grid">
            <div class="pv-stat-card"><div class="pv-stat-num">${stat1Num}</div><div class="pv-stat-lbl">${stat1Label}</div></div>
            <div class="pv-stat-card"><div class="pv-stat-num">${stat2Num}</div><div class="pv-stat-lbl">${stat2Label}</div></div>
            <div class="pv-stat-card"><div class="pv-stat-num">${stat3Num}</div><div class="pv-stat-lbl">${stat3Label}</div></div>
            <div class="pv-stat-card"><div class="pv-stat-num">${stat4Num}</div><div class="pv-stat-lbl">${stat4Label}</div></div>
          </div>
        </div>
      `,
      performance_metrics: `
        <div class="pv-section">
          <h3 class="pv-section-heading">Performance & Metrics</h3>
          <div class="pv-stats-grid">
            <div class="pv-stat-card"><div class="pv-stat-num">${stat1Num}</div><div class="pv-stat-lbl">${stat1Label}</div></div>
            <div class="pv-stat-card"><div class="pv-stat-num">${stat2Num}</div><div class="pv-stat-lbl">${stat2Label}</div></div>
          </div>
        </div>
      `,
      client_testimonial: feedbackQuote ? `
        <div class="pv-section" style="background: rgba(255,255,255,0.02); border: 1px solid var(--panel-border); padding: 1.25rem; border-radius: 12px;">
          <p style="font-style: italic; color: #fff; font-size: 0.95rem;">"${feedbackQuote}"</p>
          <span style="display: block; margin-top: 6px; font-size: 0.8rem; color: var(--accent-color); font-weight: 700;">- ${feedbackAuthor}</span>
        </div>
      ` : '',
      creative_showcase: activeGallery.length > 0 ? `
        <div class="pv-section">
          <h3 class="pv-section-heading">Creative Showcase</h3>
          <div class="pv-gallery-grid">${galleryHtml}</div>
        </div>
      ` : '',
      gallery: activeGallery.length > 0 ? `
        <div class="pv-section">
          <h3 class="pv-section-heading">Gallery</h3>
          <div class="pv-gallery-grid">${galleryHtml}</div>
        </div>
      ` : '',
      video_showcase: activeVideos.length > 0 ? `
        <div class="pv-section">
          <h3 class="pv-section-heading">Video Showcase</h3>
          <p class="pv-text">${activeVideos.length} Video asset(s) active</p>
        </div>
      ` : '',
      website_mockups: `<div class="pv-section"><h3 class="pv-section-heading">Website Mockups</h3><p class="pv-text">Desktop & mobile preview interface</p></div>`,
      mobile_mockups: `<div class="pv-section"><h3 class="pv-section-heading">Mobile Mockups</h3><p class="pv-text">Mobile device screen layout</p></div>`,
      desktop_mockups: `<div class="pv-section"><h3 class="pv-section-heading">Desktop Mockups</h3><p class="pv-text">Desktop display screen mockup</p></div>`,
      brand_identity: `<div class="pv-section"><h3 class="pv-section-heading">Brand Identity</h3><p class="pv-text">Color palettes & typography identity</p></div>`,
      social_media_campaign: `<div class="pv-section"><h3 class="pv-section-heading">Social Media Campaign</h3><p class="pv-text">Social grid layout & viral short-form assets</p></div>`,
      marketing_campaign: `<div class="pv-section"><h3 class="pv-section-heading">Marketing Campaign</h3><p class="pv-text">Digital offer flyers & holiday marketing</p></div>`,
      additional_info: conclusion ? `<div class="pv-section"><h3 class="pv-section-heading">Additional Information</h3><p class="pv-text">${conclusion}</p></div>` : '',
      custom_sections: activeBlocks.length > 0 ? `
        <div class="pv-section">
          <h3 class="pv-section-heading">Custom Sections</h3>
          ${activeBlocks.map(b => `<div style="margin-bottom: 6px;"><strong>${b.heading}:</strong> ${b.body}</div>`).join('')}
        </div>
      ` : ''
    };

    // Render enabled sections in configured order
    let renderedHtml = "";
    const currentOrder = (activeSectionOrder && activeSectionOrder.length > 0)
      ? activeSectionOrder
      : STANDARD_CASE_STUDY_SECTIONS.map(s => s.key);

    currentOrder.forEach(secKey => {
      // Check if section is ON / Visible
      if (activeSectionVisibility[secKey] !== false) {
        if (secKey === "hero") {
          renderedHtml += previewSectionBlocks.hero;
        } else if (previewSectionBlocks[secKey]) {
          renderedHtml += `<div class="pv-body">${previewSectionBlocks[secKey]}</div>`;
        }
      }
    });

    container.innerHTML = renderedHtml || `<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">All sections are turned OFF for this Case Study.</div>`;
  };

  // Bind live sync to form inputs
  if (csForm) {
    csForm.addEventListener("input", () => {
      markEditorDirty();
      updateLivePreview();
    });
  }


  const autoSaveCheck = () => {
    if (!isEditorDirty) return;
    const badge = document.getElementById("cs-autosave-indicator");
    if (badge) {
      badge.className = "cs-autosave-pill status-saving";
      badge.querySelector(".autosave-label").textContent = "Saving...";
    }

    setTimeout(() => {
      saveActiveEditorState();
      setEditorSaved();
    }, 600);
  };

  // Start 30-second Auto Save Timer
  if (autoSaveTimer) clearInterval(autoSaveTimer);
  autoSaveTimer = setInterval(autoSaveCheck, 30000);


  // --- OPEN / CLOSE EDITOR MODAL & SAVE DATA ENGINE ---
  async function openCSModal(csId = null) {
    if (!csModal) return;
    csForm.reset();
    document.getElementById("cs-edit-id").value = "";
    document.getElementById("cs-modal-title").textContent = csId ? "Edit Case Study" : "Create New Case Study";

    // Reset upload status indicators
    const galStatus = document.getElementById("gallery-upload-status");
    if (galStatus) { galStatus.style.display = "none"; galStatus.innerHTML = ""; }
    const vidStatus = document.getElementById("video-upload-status");
    if (vidStatus) { vidStatus.style.display = "none"; vidStatus.innerHTML = ""; }

    activeTags = ["Branding", "Social Media"];
    activeGallery = [];
    activeVideos = [];
    activeGallerySections = [];
    activeBlocks = [];
    activeSectionVisibility = {};
    STANDARD_CASE_STUDY_SECTIONS.forEach(s => activeSectionVisibility[s.key] = s.defaultVisible);
    activeSectionOrder = STANDARD_CASE_STUDY_SECTIONS.map(s => s.key);

    if (csId) {
      const list = await getFreshBetroCaseStudies();
      const cs = list.find(item => item.id === csId);
      if (cs) {
        document.getElementById("cs-edit-id").value = cs.id;
        document.getElementById("cs-company-name").value = cs.companyName || "";
        document.getElementById("cs-slug").value = cs.slug || "";
        document.getElementById("cs-category").value = cs.category || "";
        document.getElementById("cs-industry").value = cs.industry || "";
        document.getElementById("cs-client-name").value = cs.clientName || "";
        document.getElementById("cs-status").value = cs.status || "published";

        document.getElementById("cs-logo-url").value = cs.companyLogo || "";
        document.getElementById("cs-hero-url").value = cs.heroImage || "";

        // Section visibility & ordering loading
        if (cs.sectionVisibility && typeof cs.sectionVisibility === "object") {
          activeSectionVisibility = { ...cs.sectionVisibility };
        }
        if (Array.isArray(cs.sectionOrder) && cs.sectionOrder.length > 0) {
          activeSectionOrder = [...cs.sectionOrder];
        }

        // Trigger previews for logo & hero
        if (cs.companyLogo) {
          const img = document.getElementById("logo-preview-img");
          if (img) { img.src = cs.companyLogo; img.classList.remove("hidden"); }
          document.getElementById("logo-preview-placeholder")?.classList.add("hidden");
          document.getElementById("logo-replace-btn")?.classList.remove("hidden");
          document.getElementById("logo-delete-btn")?.classList.remove("hidden");
        }

        const cardImg = cs.cardImage || cs.heroImage || "";
        if (document.getElementById("cs-cardimg-url")) document.getElementById("cs-cardimg-url").value = cardImg;
        if (cardImg) {
          const img = document.getElementById("cardimg-preview-img");
          if (img) { img.src = cardImg; img.classList.remove("hidden"); }
          document.getElementById("cardimg-preview-placeholder")?.classList.add("hidden");
          document.getElementById("cardimg-replace-btn")?.classList.remove("hidden");
          document.getElementById("cardimg-delete-btn")?.classList.remove("hidden");
        }

        if (cs.heroImage) {
          const img = document.getElementById("hero-preview-img");
          if (img) { img.src = cs.heroImage; img.classList.remove("hidden"); }
          document.getElementById("hero-preview-placeholder")?.classList.add("hidden");
          document.getElementById("hero-replace-btn")?.classList.remove("hidden");
          document.getElementById("hero-delete-btn")?.classList.remove("hidden");
        }

        const deskMock = cs.media?.mockups?.desktop || "";
        if (document.getElementById("cs-desktop-mockup-url")) document.getElementById("cs-desktop-mockup-url").value = deskMock;
        if (deskMock) {
          const img = document.getElementById("desktop-mockup-preview-img");
          if (img) { img.src = deskMock; img.classList.remove("hidden"); }
          document.getElementById("desktop-mockup-preview-placeholder")?.classList.add("hidden");
          document.getElementById("desktop-mockup-replace-btn")?.classList.remove("hidden");
          document.getElementById("desktop-mockup-delete-btn")?.classList.remove("hidden");
        } else {
          document.getElementById("desktop-mockup-preview-img")?.classList.add("hidden");
          document.getElementById("desktop-mockup-preview-placeholder")?.classList.remove("hidden");
          document.getElementById("desktop-mockup-replace-btn")?.classList.add("hidden");
          document.getElementById("desktop-mockup-delete-btn")?.classList.add("hidden");
        }

        const mobMock = cs.media?.mockups?.mobile || "";
        if (document.getElementById("cs-mobile-mockup-url")) document.getElementById("cs-mobile-mockup-url").value = mobMock;
        if (mobMock) {
          const img = document.getElementById("mobile-mockup-preview-img");
          if (img) { img.src = mobMock; img.classList.remove("hidden"); }
          document.getElementById("mobile-mockup-preview-placeholder")?.classList.add("hidden");
          document.getElementById("mobile-mockup-replace-btn")?.classList.remove("hidden");
          document.getElementById("mobile-mockup-delete-btn")?.classList.remove("hidden");
        } else {
          document.getElementById("mobile-mockup-preview-img")?.classList.add("hidden");
          document.getElementById("mobile-mockup-preview-placeholder")?.classList.remove("hidden");
          document.getElementById("mobile-mockup-replace-btn")?.classList.add("hidden");
          document.getElementById("mobile-mockup-delete-btn")?.classList.add("hidden");
        }

        document.getElementById("cs-short-intro").value = cs.shortIntro || "";
        document.getElementById("cs-brand-story").value = cs.brandStory || cs.fullDescription || "";
        document.getElementById("cs-brand-goals").value = cs.brandGoals || cs.projectObjective || "";

        if (cs.overview) {
          document.getElementById("cs-overview-challenge").value = cs.overview.challenge || "";
          document.getElementById("cs-overview-strategy").value = cs.overview.strategy || "";
          document.getElementById("cs-overview-solution").value = cs.overview.solution || "";
          document.getElementById("cs-overview-execution").value = cs.overview.execution || "";
          document.getElementById("cs-overview-results").value = cs.overview.results || "";
        }

        if (cs.results) {
          document.getElementById("cs-stat1-num").value = cs.results.stat1Num || "";
          document.getElementById("cs-stat1-label").value = cs.results.stat1Label || "";
          document.getElementById("cs-stat2-num").value = cs.results.stat2Num || "";
          document.getElementById("cs-stat2-label").value = cs.results.stat2Label || "";
          document.getElementById("cs-stat3-num").value = cs.results.stat3Num || "";
          document.getElementById("cs-stat3-label").value = cs.results.stat3Label || "";
          document.getElementById("cs-stat4-num").value = cs.results.stat4Num || "";
          document.getElementById("cs-stat4-label").value = cs.results.stat4Label || "";

          document.getElementById("cs-feedback-quote").value = cs.results.feedbackQuote || "";
          document.getElementById("cs-feedback-author").value = cs.results.feedbackAuthor || "";
          document.getElementById("cs-feedback-role").value = cs.results.feedbackRole || "";
        }

        if (Array.isArray(cs.services)) activeTags = [...cs.services];

        // Load media using structured assets as single source of truth
        if (Array.isArray(cs.media?.assets) && cs.media.assets.length > 0) {
          activeGallery = cs.media.assets
            .filter(a => a.type === "image" || a.target_section === "creative_showcase")
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
          activeVideos = cs.media.assets
            .filter(a => a.type === "video" || a.target_section === "video_showcase")
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
        } else {
          if (Array.isArray(cs.media?.gallery)) {
            activeGallery = cs.media.gallery.map((g, idx) => normalizeMediaAsset(g, cs.id, cs.slug, "image", "creative_showcase", idx));
          }
          if (Array.isArray(cs.media?.videos)) {
            activeVideos = cs.media.videos
              .filter(v => {
                const u = typeof v === "string" ? v : (v ? v.url : "");
                return u && !u.includes("dQw4w9WgXcQ");
              })
              .map((v, idx) => normalizeMediaAsset(v, cs.id, cs.slug, "video", "video_showcase", idx));
          }
        }

        if (Array.isArray(cs.gallerySections)) activeGallerySections = [...cs.gallerySections];
        if (Array.isArray(cs.blocks)) activeBlocks = [...cs.blocks];

        if (cs.seo) {
          document.getElementById("cs-seo-title").value = cs.seo.title || "";
          document.getElementById("cs-seo-desc").value = cs.seo.description || "";
          document.getElementById("cs-seo-keywords").value = cs.seo.keywords || "";
          document.getElementById("cs-seo-ogimage").value = cs.seo.ogImage || "";
          document.getElementById("cs-seo-canonical").value = cs.seo.canonicalUrl || "";
        }
      }
    }

    renderTagsList();
    renderShowcaseGallery();
    renderVideosList();
    renderGallerySections();
    renderBlocksContainer();
    renderSectionVisibilityTab();
    updateLivePreview();
    setEditorSaved();

    csModal.classList.remove("hidden");
  }

  function closeCSModal() {
    if (isEditorDirty) {
      const confirmLeave = confirm("You have unsaved changes. Are you sure you want to close without saving?");
      if (!confirmLeave) return;
    }
    if (csModal) csModal.classList.add("hidden");
  }

  if (addCSBtn) addCSBtn.addEventListener("click", () => openCSModal());
  if (closeCSModalBtn) closeCSModalBtn.addEventListener("click", closeCSModal);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (mediaPickerModal && !mediaPickerModal.classList.contains("hidden")) {
        closeMediaPicker();
      } else if (csModal && !csModal.classList.contains("hidden")) {
        closeCSModal();
      }
    }
  });


  if (csForm) {
    csForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = csForm.querySelector("button[type='submit']");
      const origText = submitBtn ? submitBtn.innerHTML : "Save";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Saving to Cloud...`;
      }
      try {
        await saveActiveEditorState();
        setEditorSaved();
        closeCSModal();
        renderCaseStudiesTab();
        showAdminToast("Save Successful! Case Study updated in live portfolio.", "success");
      } catch (err) {
        console.error("CS Save error:", err);
        showAdminToast("Save Failed: " + (err.message || "Unknown error"), "error", 6000);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origText;
        }
      }
    });
  }

  // ==========================================
  // SUPABASE CLOUD DATABASE SETTINGS & DIAGNOSTICS
  // ==========================================
  const updateSupabaseStatusUI = async () => {
    const pill = document.getElementById("supabase-status-pill");
    const diag = document.getElementById("supabase-diag-box");
    const syncInd = document.getElementById("sync-indicator");
    const urlInput = document.getElementById("cfg-supabase-url");
    const keyInput = document.getElementById("cfg-supabase-anon-key");
    const bktInput = document.getElementById("cfg-supabase-bucket");

    if (!window.BetroDB) return;

    await BetroDB.ensureInit();
    const cfg = BetroDB.getConfig();

    if (urlInput) urlInput.value = cfg.supabaseUrl || "";
    if (keyInput) keyInput.value = cfg.supabaseAnonKey || "";
    if (bktInput) bktInput.value = cfg.storageBucket || "betodata";

    if (cfg.isConfigured) {
      if (pill) {
        pill.innerHTML = `<i class="ri-checkbox-circle-fill"></i> Cloud Connected (${cfg.source})`;
        pill.style.background = "rgba(74, 185, 108, 0.15)";
        pill.style.color = "#4ab96c";
        pill.style.borderColor = "rgba(74, 185, 108, 0.3)";
      }
      if (diag) {
        diag.innerHTML = `<strong>Production Cloud Database Active:</strong> ${cfg.supabaseUrl}<br><span style="color:var(--text-secondary); font-size:0.8rem;">Bucket: ${cfg.storageBucket} | Source: ${cfg.source}</span>`;
      }
      if (syncInd) {
        syncInd.innerHTML = `<i class="ri-cloud-line" style="color: #4ab96c;"></i> Cloud DB Synced`;
        syncInd.style.borderColor = "rgba(74, 185, 108, 0.3)";
        syncInd.style.color = "#4ab96c";
      }
    } else {
      if (pill) {
        pill.innerHTML = `<i class="ri-alert-line"></i> Local Fallback Mode`;
        pill.style.background = "rgba(234, 179, 8, 0.15)";
        pill.style.color = "#eab308";
        pill.style.borderColor = "rgba(234, 179, 8, 0.3)";
      }
      if (diag) {
        diag.innerHTML = `<span style="color:#eab308; font-weight:600;"><i class="ri-information-line"></i> Supabase Not Connected</span><br><span style="color:var(--text-secondary);">Enter your Supabase Project URL and Anon Key below or add <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> in Vercel Project Settings.</span>`;
      }
      if (syncInd) {
        syncInd.innerHTML = `<i class="ri-database-2-line"></i> Local Fallback Engine`;
        syncInd.style.borderColor = "rgba(234, 179, 8, 0.3)";
        syncInd.style.color = "#eab308";
      }
    }
  };

  // Test Connection Button
  document.getElementById("test-supabase-cfg-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("test-supabase-cfg-btn");
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Testing Connection...`;

    try {
      const url = document.getElementById("cfg-supabase-url")?.value.trim();
      const key = document.getElementById("cfg-supabase-anon-key")?.value.trim();
      const bucket = document.getElementById("cfg-supabase-bucket")?.value.trim() || "betodata";

      if (url && key) {
        await BetroDB.updateConfig({ supabaseUrl: url, supabaseAnonKey: key, storageBucket: bucket });
      }

      const res = await BetroDB.testConnection();
      if (res.success) {
        showAdminToast(`Connection Verified! (Latency: ${res.latency}ms)`, "success", 4000);
      } else if (res.needTables) {
        showAdminToast(`Supabase Connected! Tables need initialization. Run supabase/full_migration.sql in SQL Editor.`, "warning", 8000);
      } else {
        showAdminToast(`Connection Failed: ${res.error}`, "error", 6000);
      }
      await updateSupabaseStatusUI();
    } catch (e) {
      showAdminToast("Connection Error: " + e.message, "error", 5000);
    } finally {
      btn.disabled = false;
      btn.innerHTML = orig;
    }
  });

  // Reset Credentials Button
  document.getElementById("reset-supabase-cfg-btn")?.addEventListener("click", async () => {
    try {
      localStorage.removeItem("betro_supabase_config");
      await BetroDB.ensureInit(true);
      await updateSupabaseStatusUI();
      const res = await BetroDB.testConnection();
      if (res.success) {
        showAdminToast(`Reset & Connected to Supabase Cloud! (Latency: ${res.latency}ms)`, "success", 4000);
      } else {
        showAdminToast(`Reset complete. ${res.error}`, "info", 5000);
      }
      await renderCaseStudiesTab();
    } catch (e) {
      showAdminToast("Reset error: " + e.message, "error");
    }
  });

  // Save Supabase Configuration Form
  document.getElementById("supabase-config-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = document.getElementById("cfg-supabase-url")?.value.trim();
    const key = document.getElementById("cfg-supabase-anon-key")?.value.trim();
    const bucket = document.getElementById("cfg-supabase-bucket")?.value.trim() || "betodata";

    if (!url || !key) {
      showAdminToast("Please provide both Supabase URL and Anon Key.", "error");
      return;
    }

    try {
      const res = await BetroDB.updateConfig({ supabaseUrl: url, supabaseAnonKey: key, storageBucket: bucket });
      if (res.success) {
        showAdminToast("Supabase Configured & Connected Successfully!", "success");
      } else {
        showAdminToast("Credentials Saved. Note: " + res.error, "info", 5000);
      }
      await updateSupabaseStatusUI();
      await renderCaseStudiesTab();
    } catch (err) {
      showAdminToast("Config Error: " + err.message, "error");
    }
  });

  // One-Click Database Seed Button
  document.getElementById("sync-cloud-seed-btn")?.addEventListener("click", async () => {
    if (!confirm("This will populate your connected Supabase database with all 16 portfolio projects and assets. Existing matching projects will be safely updated without data loss. Proceed?")) return;

    const btn = document.getElementById("sync-cloud-seed-btn");
    const prog = document.getElementById("seed-sync-progress");
    const orig = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Initializing Migration...`;
    if (prog) { prog.style.display = "block"; prog.textContent = "Connecting to Supabase..."; }

    try {
      const res = await BetroDB.syncAllSeedData(defaultCaseStudies, (p) => {
        if (prog) prog.textContent = `Syncing project ${p.current} of ${p.total}: "${p.name}" (${p.pct}%)...`;
      });

      if (prog) {
        prog.textContent = `Migration Complete! Successfully synchronized ${res.count} of ${res.total} projects into Supabase.`;
        prog.style.color = "#4ab96c";
      }
      showAdminToast(`Cloud Migration Complete: ${res.count} projects live!`, "success", 5000);
      await renderCaseStudiesTab();
    } catch (err) {
      if (prog) {
        prog.textContent = `Migration Failed: ${err.message}`;
        prog.style.color = "#ef4444";
      }
      showAdminToast("Migration Error: " + err.message, "error", 6000);
    } finally {
      btn.disabled = false;
      btn.innerHTML = orig;
    }
  });

  // Clear Client Cache Button
  document.getElementById("clear-cache-btn")?.addEventListener("click", () => {
    localStorage.removeItem("betro_casestudies_cache");
    showAdminToast("Client cache cleared.", "info");
    setTimeout(() => window.location.reload(), 500);
  });

  // Trigger Supabase status check
  setTimeout(updateSupabaseStatusUI, 300);

  // Search & Filter Listeners
  document.getElementById("cs-search-input")?.addEventListener("input", renderCaseStudiesTab);
  document.getElementById("cs-status-filter")?.addEventListener("change", renderCaseStudiesTab);

  // Centralized Tab Switcher Function
  const sidebarLinks = document.querySelectorAll(".sidebar-link");
  const tabPanels = document.querySelectorAll(".tab-panel");

  const switchTab = (tabId) => {
    sidebarLinks.forEach(l => {
      if (l.getAttribute("data-tab") === tabId) l.classList.add("active");
      else l.classList.remove("active");
    });

    tabPanels.forEach(panel => panel.classList.remove("active"));
    const targetPanel = document.getElementById(`tab-${tabId}`);
    if (targetPanel) {
      targetPanel.classList.add("active");
    }

    const pageTitle = document.getElementById("page-title");
    const pageSubtitle = document.getElementById("page-subtitle");

    if (tabId === "dashboard") {
      if (pageTitle) pageTitle.textContent = "Dashboard Overview";
      if (pageSubtitle) pageSubtitle.textContent = "Live portfolio metrics, cloud storage status, and recent project activity.";
      renderDashboardOverview();
    } else if (tabId === "casestudies") {
      if (pageTitle) pageTitle.textContent = "Case Studies CMS";
      if (pageSubtitle) pageSubtitle.textContent = "Create, edit, publish/unpublish, and manage dynamic case studies.";
      renderCaseStudiesTab();
    } else if (tabId === "medialibrary") {
      if (pageTitle) pageTitle.textContent = "Central Media Library";
      if (pageSubtitle) pageSubtitle.textContent = "Upload, organize, search, and reuse images, videos, and PDFs.";
      renderMediaLibraryTab();
    } else if (tabId === "content") {
      if (pageTitle) pageTitle.textContent = "Gallery & Brands Management";
      if (pageSubtitle) pageSubtitle.textContent = "Add or remove homepage portfolio projects and brand logos.";
      renderContentTab();
    } else if (tabId === "settings") {
      if (pageTitle) pageTitle.textContent = "Cloud DB & Portal Settings";
      if (pageSubtitle) pageSubtitle.textContent = "Manage Supabase cloud database, credentials, and offline storage.";
      if (typeof updateSupabaseStatusUI === "function") {
        updateSupabaseStatusUI();
      }
    }

    // Auto-close mobile drawer
    const sidebar = document.getElementById("admin-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("active");
  };

  sidebarLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tabId = link.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Mobile Drawer Toggle Listeners
  const mobileToggleBtn = document.getElementById("mobile-sidebar-toggle");
  const sidebarElem = document.getElementById("admin-sidebar");
  const backdropElem = document.getElementById("sidebar-backdrop");

  if (mobileToggleBtn && sidebarElem) {
    mobileToggleBtn.addEventListener("click", () => {
      sidebarElem.classList.toggle("open");
      if (backdropElem) backdropElem.classList.toggle("active");
    });
  }

  if (backdropElem && sidebarElem) {
    backdropElem.addEventListener("click", () => {
      sidebarElem.classList.remove("open");
      backdropElem.classList.remove("active");
    });
  }

  // Dashboard Overview Quick Actions Handlers
  document.getElementById("dash-quick-create-btn")?.addEventListener("click", () => openCSModal());
  document.getElementById("sidebar-quick-add-btn")?.addEventListener("click", () => openCSModal());
  document.getElementById("dash-nav-media-btn")?.addEventListener("click", () => switchTab("medialibrary"));
  document.getElementById("dash-nav-brands-btn")?.addEventListener("click", () => switchTab("content"));
  document.getElementById("dash-nav-settings-btn")?.addEventListener("click", () => switchTab("settings"));
  document.getElementById("dash-view-all-cs-btn")?.addEventListener("click", () => switchTab("casestudies"));
  document.getElementById("dash-quick-sync-btn")?.addEventListener("click", async () => {
    showAdminToast("Verifying Supabase Cloud connection...", "info", 2500);
    await updateSupabaseStatusUI();
    await renderDashboardOverview();
    showAdminToast("Supabase Database & Cloud Storage verified!", "success", 4000);
  });

  // Check initial Auth state
  checkAuth();
});


