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
        renderCaseStudiesTab();
      } else {
        errorAlert.classList.remove("hidden");
        errorAlert.querySelector(".alert-message").textContent = "Invalid email or password.";
      }
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }, 400);
  });

  // Demo Mode entry button (directly logs in)
  document.getElementById("demo-login-btn").addEventListener("click", () => {
    localStorage.setItem("betro_admin_logged_in", "true");
    localStorage.setItem("betro_admin_email", "demo@betroverse.in");
    window.location.reload();
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

    async setItem(key, value) {
      this.cache[key] = value;
      // 1. Primary High-Capacity Store: IndexedDB (Gigabytes limit)
      const db = await this.init();
      if (db) {
        try {
          const tx = db.transaction("app_store", "readwrite");
          tx.objectStore("app_store").put(value, key);
        } catch (e) {
          console.warn("IndexedDB set error:", e);
        }
      }

      // 2. Secondary Store: LocalStorage (Silently ignore QuotaExceededError since IndexedDB holds full data)
      try {
        localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
      } catch (lsErr) {
        // Quota error ignored safely because IndexedDB saved it!
      }
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
        } catch (e) {}
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

  // Pre-warm storage cache from IndexedDB on initial load
  BetroStorage.init().then(() => {
    BetroStorage.getItem("betro_media_assets").then(assets => {
      if (assets && Array.isArray(assets)) {
        BetroStorage.cache["betro_media_assets"] = assets;
        if (typeof renderMediaLibraryTab === "function") renderMediaLibraryTab();
      }
    });
    BetroStorage.getItem("betro_casestudies").then(csList => {
      if (csList && Array.isArray(csList)) {
        BetroStorage.cache["betro_casestudies"] = csList;
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

  // Robust Upload Engine with Real-time Progress, Auto Optimization & Error Handling
  const uploadMediaFile = (file, folder = "showcase", onProgress = null) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!file) return reject("No file selected.");

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
          return reject(err);
        }

        const maxBytes = 50 * 1024 * 1024; // 50MB limit
        if (file.size > maxBytes) {
          const err = `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 50MB limit.`;
          showAdminToast(err, "error", 5000);
          if (onProgress) onProgress({ status: "error", pct: 0, text: "File Too Large (>50MB)" });
          return reject(err);
        }

        if (onProgress) onProgress({ status: "uploading", pct: 30, text: "Reading file..." });

        let dataUrl = "";
        let sizeKb = (file.size / 1024).toFixed(0) + " KB";

        if (fileType === "image") {
          if (onProgress) onProgress({ status: "processing", pct: 65, text: "Processing & Optimizing image..." });
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

        if (onProgress) onProgress({ status: "saving", pct: 90, text: "Saving to storage engine..." });

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

        // Store into High-Capacity IndexedDB engine
        await saveMediaAssets(assets);

        renderMediaLibraryTab();

        if (onProgress) onProgress({ status: "success", pct: 100, text: "Upload Complete — File Saved & Media Linked Successfully" });
        showAdminToast(`Uploaded "${file.name}" successfully! Media linked.`, "success");
        resolve(newAsset);

      } catch (err) {
        const errMsg = typeof err === "string" ? err : (err.message || "Failed to process upload.");
        if (onProgress) onProgress({ status: "error", pct: 0, text: errMsg });
        showAdminToast(errMsg, "error", 5000);
        reject(errMsg);
      }
    });
  };

  // Render Central Media Library Tab Panel
  let currentMediaTypeFilter = "all";
  const renderMediaLibraryTab = () => {
    const grid = document.getElementById("media-library-grid");
    if (!grid) return;

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
        .catch(() => {});
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

  const openMediaPicker = (callback) => {
    activePickerCallback = callback;
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
  const getBetroCaseStudies = () => {
    const cached = BetroStorage.cache["betro_casestudies"];
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;

    const storedSync = BetroStorage.getItemSync("betro_casestudies");
    if (storedSync && Array.isArray(storedSync) && storedSync.length > 0) {
      BetroStorage.cache["betro_casestudies"] = storedSync;
      return storedSync;
    }
    return [];
  };

  const saveBetroCaseStudies = (list) => {
    BetroStorage.cache["betro_casestudies"] = list;
    BetroStorage.setItem("betro_casestudies", list);

    // Real-time synchronization broadcast across windows/tabs
    try {
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel("betro_portfolio_sync");
        channel.postMessage({ type: "CASE_STUDY_UPDATED", timestamp: Date.now(), data: list });
      }
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("betro_storage_updated", { detail: { key: "betro_casestudies", list } }));
  };

  // State Variables for currently opened Case Study Editor
  let activeTags = [];
  let activeGallery = [];
  let activeVideos = [];
  let activeGallerySections = [];
  let activeBlocks = [];
  let isEditorDirty = false;
  let autoSaveTimer = null;

  // Render Case Studies List Grid
  const renderCaseStudiesTab = () => {
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
      grid.innerHTML = `<div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-secondary);">No Case Studies found. Click "Create New Case Study" to add one!</div>`;
      return;
    }

    caseStudies.forEach(cs => {
      const card = document.createElement("div");
      card.className = "glass-card";
      card.style.padding = "1.5rem";
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.justifySpaceBetween = "space-between";
      card.style.position = "relative";

      const isPublished = (cs.status || "published") === "published";
      const isFeatured = !!cs.featured;

      const statusBadge = isPublished 
        ? `<span style="background: rgba(74, 185, 108, 0.15); color: #4ab96c; padding: 4px 10px; border-radius: 50px; font-size: 0.75rem; font-weight: 700;">${isFeatured ? '★ FEATURED' : 'PUBLISHED'}</span>`
        : `<span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 4px 10px; border-radius: 50px; font-size: 0.75rem; font-weight: 700;">DRAFT</span>`;

      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div style="width: 48px; height: 48px; background: rgba(0,0,0,0.3); border-radius: 10px; padding: 6px; border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center;">
              <img src="${cs.companyLogo || 'images/logo.png'}" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
            ${statusBadge}
          </div>
          <h4 style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${cs.companyName}</h4>
          <p style="font-size: 0.8rem; color: #4ab96c; font-family: monospace; margin-bottom: 8px;">/portfolio/${cs.slug}</p>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.25rem;">${cs.shortIntro || cs.category || 'Case study overview'}</p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; border-top: 1px solid var(--panel-border); padding-top: 1rem;">
          <a href="portfolio/${cs.slug}.html" target="_blank" class="admin-btn secondary-btn" style="padding: 6px 12px; font-size: 0.8rem; text-decoration: none;">
            <i class="ri-external-link-line"></i> View
          </a>
          <button type="button" class="admin-btn secondary-btn edit-cs-btn" data-id="${cs.id}" style="padding: 6px 12px; font-size: 0.8rem;">
            <i class="ri-edit-line"></i> Edit
          </button>
          <button type="button" class="admin-btn secondary-btn duplicate-cs-btn" data-id="${cs.id}" style="padding: 6px 12px; font-size: 0.8rem;" title="Duplicate Project">
            <i class="ri-file-copy-line"></i> Copy
          </button>
          <button type="button" class="admin-btn secondary-btn toggle-cs-status" data-id="${cs.id}" style="padding: 6px 12px; font-size: 0.8rem;">
            <i class="ri-repeat-line"></i> ${isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button type="button" class="admin-btn danger-btn delete-cs-btn" data-id="${cs.id}" style="padding: 6px 12px; font-size: 0.8rem;">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      `;

      card.querySelector(".edit-cs-btn")?.addEventListener("click", () => openCSModal(cs.id));
      card.querySelector(".duplicate-cs-btn")?.addEventListener("click", () => duplicateCS(cs.id));
      card.querySelector(".toggle-cs-status")?.addEventListener("click", () => toggleCSStatus(cs.id));
      card.querySelector(".delete-cs-btn")?.addEventListener("click", () => deleteCS(cs.id));

      grid.appendChild(card);
    });
  };

  const duplicateCS = (csId) => {
    let list = getBetroCaseStudies();
    const target = list.find(item => item.id === csId);
    if (!target) return;

    const copyCS = JSON.parse(JSON.stringify(target));
    copyCS.id = "cs-" + Date.now();
    copyCS.companyName = target.companyName + " (Copy)";
    copyCS.slug = target.slug + "-copy";
    copyCS.status = "draft";

    list.push(copyCS);
    saveBetroCaseStudies(list);
    renderCaseStudiesTab();
  };

  const toggleCSStatus = (csId) => {
    let list = getBetroCaseStudies();
    list = list.map(cs => {
      if (cs.id === csId) {
        return { ...cs, status: cs.status === "draft" ? "published" : "draft" };
      }
      return cs;
    });
    saveBetroCaseStudies(list);
    renderCaseStudiesTab();
  };

  const deleteCS = (csId) => {
    if (!confirm("Are you sure you want to delete this Case Study?")) return;
    let list = getBetroCaseStudies();
    list = list.filter(cs => cs.id !== csId);
    saveBetroCaseStudies(list);
    renderCaseStudiesTab();
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
      grid.innerHTML = `<div style="grid-column: 1 / -1; padding: 1rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">No gallery images added yet.</div>`;
      return;
    }

    activeGallery.forEach((url, idx) => {
      const card = document.createElement("div");
      card.className = "showcase-item-card";
      card.innerHTML = `
        <img src="${url}" alt="Gallery Image ${idx + 1}">
        <div class="showcase-item-actions">
          <button type="button" class="admin-btn secondary-btn replace-gal-btn" title="Replace"><i class="ri-refresh-line"></i></button>
          <button type="button" class="admin-btn danger-btn del-gal-btn" title="Delete"><i class="ri-delete-bin-line"></i></button>
        </div>
      `;

      card.querySelector(".replace-gal-btn").addEventListener("click", () => {
        openMediaPicker((newUrl) => {
          activeGallery[idx] = newUrl;
          renderShowcaseGallery();
          markEditorDirty();
          updateLivePreview();
        });
      });

      card.querySelector(".del-gal-btn").addEventListener("click", () => {
        activeGallery.splice(idx, 1);
        renderShowcaseGallery();
        markEditorDirty();
        updateLivePreview();
      });

      grid.appendChild(card);
    });
  };

  const handleGalleryFilesUpload = (files) => {
    if (!files || files.length === 0) return;
    showAdminToast(`Uploading ${files.length} gallery file(s)...`, "processing");

    let completed = 0;
    const total = files.length;

    files.forEach(file => {
      uploadMediaFile(file, "showcase", (prog) => {
        if (prog.status === "error") {
          showAdminToast(`Failed to upload ${file.name}: ${prog.text}`, "error", 5000);
        }
      })
      .then(asset => {
        activeGallery.push(asset.url);
        completed++;
        renderShowcaseGallery();
        markEditorDirty();
        updateLivePreview();

        if (completed === total) {
          showAdminToast(`All ${total} gallery image(s) uploaded & saved successfully!`, "success");
        }
      })
      .catch(err => console.error("Gallery upload error:", err));
    });
  };

  const galleryUploadInput = document.getElementById("gallery-multi-upload");
  if (galleryUploadInput) {
    galleryUploadInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      handleGalleryFilesUpload(files);
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
    openMediaPicker((url) => {
      activeGallery.push(url);
      renderShowcaseGallery();
      markEditorDirty();
      updateLivePreview();
      showAdminToast("Selected asset linked to gallery!", "success");
    });
  });

  // Render Videos Showcase
  const renderVideosList = () => {
    const list = document.getElementById("cs-video-items-list");
    if (!list) return;
    list.innerHTML = "";

    if (activeVideos.length === 0) {
      list.innerHTML = `<div style="padding: 1rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">No showcase videos added yet.</div>`;
      return;
    }

    activeVideos.forEach((vid, idx) => {
      const item = document.createElement("div");
      item.className = "video-item-card";

      let thumb = vid.type === "youtube" || vid.type === "vimeo" || vid.url.includes("embed")
        ? `<iframe src="${vid.url}" allowfullscreen></iframe>`
        : `<video src="${vid.url}" controls></video>`;

      item.innerHTML = `
        <div class="video-thumb-preview">${thumb}</div>
        <div style="flex: 1;">
          <strong style="display: block; font-size: 0.85rem; color: var(--text-primary); margin-bottom: 4px;">Video Asset ${idx + 1}</strong>
          <span style="font-size: 0.75rem; color: var(--text-secondary); font-family: monospace;">${vid.url.substring(0, 45)}...</span>
        </div>
        <button type="button" class="admin-btn danger-btn del-vid-btn" style="padding: 6px 10px;"><i class="ri-delete-bin-line"></i> Remove</button>
      `;

      item.querySelector(".del-vid-btn").addEventListener("click", () => {
        activeVideos.splice(idx, 1);
        renderVideosList();
        markEditorDirty();
        updateLivePreview();
      });

      list.appendChild(item);
    });
  };

  document.getElementById("video-file-upload")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      showAdminToast(`Processing video "${file.name}"...`, "processing");
      uploadMediaFile(file, "videos", (prog) => {
        if (prog.status === "error") {
          showAdminToast(`Video upload failed: ${prog.text}`, "error", 5000);
        }
      })
      .then(asset => {
        activeVideos.push({ type: "file", url: asset.url });
        renderVideosList();
        markEditorDirty();
        updateLivePreview();
        showAdminToast(`Video "${file.name}" linked successfully!`, "success");
      })
      .catch(err => console.error("Video upload error:", err));
    }
  });

  document.getElementById("add-youtube-embed-btn")?.addEventListener("click", () => {
    const url = prompt("Enter YouTube Embed URL (e.g. https://www.youtube.com/embed/dQw4w9WgXcQ):");
    if (url) {
      activeVideos.push({ type: "youtube", url: url.trim() });
      renderVideosList();
      markEditorDirty();
      updateLivePreview();
    }
  });

  document.getElementById("add-vimeo-embed-btn")?.addEventListener("click", () => {
    const url = prompt("Enter Vimeo Embed URL (e.g. https://player.vimeo.com/video/123456789):");
    if (url) {
      activeVideos.push({ type: "vimeo", url: url.trim() });
      renderVideosList();
      markEditorDirty();
      updateLivePreview();
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

    container.innerHTML = `
      <div class="pv-hero" style="background-image: url('${heroUrl}');">
        <div class="pv-hero-overlay"></div>
        <div class="pv-hero-content">
          <img src="${logoUrl}" class="pv-logo" alt="Logo">
          <span class="pv-pill">${category}</span>
          <h1 class="pv-title">${companyName}</h1>
          <p style="color: #9ca3af; font-size: 0.95rem;">${shortIntro}</p>
        </div>
      </div>
      <div class="pv-body">
        <div class="pv-section">
          <h3 class="pv-section-heading">Brand Story & Objectives</h3>
          <p class="pv-text">${brandStory}</p>
          <p class="pv-text" style="margin-top: 0.75rem;">${brandGoals}</p>
        </div>

        <div class="pv-section">
          <h3 class="pv-section-heading">Services Provided</h3>
          <div class="pv-services-grid">${tagsHtml}</div>
        </div>

        ${challenge ? `
        <div class="pv-section">
          <h3 class="pv-section-heading">Project Breakdown</h3>
          <p class="pv-text"><strong>Challenge:</strong> ${challenge}</p>
          ${strategy ? `<p class="pv-text" style="margin-top: 0.5rem;"><strong>Strategy:</strong> ${strategy}</p>` : ''}
          ${solution ? `<p class="pv-text" style="margin-top: 0.5rem;"><strong>Solution:</strong> ${solution}</p>` : ''}
          ${execution ? `<p class="pv-text" style="margin-top: 0.5rem;"><strong>Execution:</strong> ${execution}</p>` : ''}
        </div>
        ` : ''}

        <div class="pv-section">
          <h3 class="pv-section-heading">Campaign Results</h3>
          <p class="pv-text">${resultsText || 'Key campaign metric achievements:'}</p>
          <div class="pv-stats-grid">
            <div class="pv-stat-card"><div class="pv-stat-num">${stat1Num}</div><div class="pv-stat-lbl">${stat1Label}</div></div>
            <div class="pv-stat-card"><div class="pv-stat-num">${stat2Num}</div><div class="pv-stat-lbl">${stat2Label}</div></div>
            <div class="pv-stat-card"><div class="pv-stat-num">${stat3Num}</div><div class="pv-stat-lbl">${stat3Label}</div></div>
            <div class="pv-stat-card"><div class="pv-stat-num">${stat4Num}</div><div class="pv-stat-lbl">${stat4Label}</div></div>
          </div>
        </div>

        ${activeGallery.length > 0 ? `
        <div class="pv-section">
          <h3 class="pv-section-heading">Creative Showcase</h3>
          <div class="pv-gallery-grid">${galleryHtml}</div>
        </div>
        ` : ''}

        ${feedbackQuote ? `
        <div class="pv-section" style="background: rgba(255,255,255,0.02); border: 1px solid var(--panel-border); padding: 1.25rem; border-radius: 12px;">
          <p style="font-style: italic; color: #fff; font-size: 0.95rem;">"${feedbackQuote}"</p>
          <span style="display: block; margin-top: 6px; font-size: 0.8rem; color: var(--accent-color); font-weight: 700;">- ${feedbackAuthor}</span>
        </div>
        ` : ''}

        ${conclusion ? `
        <div class="pv-section" style="margin-top: 2rem;">
          <h3 class="pv-section-heading">Conclusion</h3>
          <p class="pv-text">${conclusion}</p>
        </div>
        ` : ''}
      </div>
    `;
  };

  // Bind live sync to form inputs
  if (csForm) {
    csForm.addEventListener("input", () => {
      markEditorDirty();
      updateLivePreview();
    });
  }

  // Auto Save Indicator & Timer
  const markEditorDirty = () => {
    isEditorDirty = true;
    const badge = document.getElementById("cs-autosave-indicator");
    const globalBadge = document.getElementById("cs-autosave-global-badge");

    if (badge) {
      badge.className = "cs-autosave-pill status-unsaved";
      badge.querySelector(".autosave-label").textContent = "Unsaved Changes";
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
      badge.querySelector(".autosave-label").textContent = "Saved";
    }
    if (globalBadge) {
      globalBadge.className = "autosave-badge saved";
      globalBadge.classList.remove("hidden");
    }
  };

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
  const openCSModal = (csId = null) => {
    if (!csModal) return;
    csForm.reset();
    document.getElementById("cs-edit-id").value = "";
    document.getElementById("cs-modal-title").textContent = csId ? "Edit Case Study" : "Create New Case Study";

    activeTags = ["Branding", "Social Media"];
    activeGallery = [];
    activeVideos = [];
    activeGallerySections = [];
    activeBlocks = [];

    if (csId) {
      const list = getBetroCaseStudies();
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
        if (Array.isArray(cs.media?.gallery)) activeGallery = [...cs.media.gallery];
        if (Array.isArray(cs.media?.videos)) {
          activeVideos = cs.media.videos.map(v => typeof v === "string" ? { type: "url", url: v } : v);
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
    updateLivePreview();
    setEditorSaved();

    csModal.classList.remove("hidden");
  };

  const closeCSModal = () => {
    if (csModal) csModal.classList.add("hidden");
  };

  if (addCSBtn) addCSBtn.addEventListener("click", () => openCSModal());
  if (closeCSModalBtn) closeCSModalBtn.addEventListener("click", closeCSModal);

  const saveActiveEditorState = () => {
    const editId = document.getElementById("cs-edit-id").value;
    const companyName = document.getElementById("cs-company-name").value.trim() || "New Case Study";
    const rawSlug = document.getElementById("cs-slug").value.trim() || companyName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const slug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    const category = document.getElementById("cs-category").value.trim() || "Creative Campaign";
    const industry = document.getElementById("cs-industry").value.trim() || "General Business";
    const clientName = document.getElementById("cs-client-name").value.trim() || companyName;
    const status = document.getElementById("cs-status").value;

    const logoUrl = document.getElementById("cs-logo-url").value.trim() || "images/logo.png";
    const cardImageUrl = document.getElementById("cs-cardimg-url")?.value.trim() || "";
    const heroUrl = document.getElementById("cs-hero-url").value.trim() || "images/p1.jpg";

    const shortIntro = document.getElementById("cs-short-intro").value.trim();
    const brandStory = document.getElementById("cs-brand-story").value.trim();
    const brandGoals = document.getElementById("cs-brand-goals").value.trim();

    const overview = {
      challenge: document.getElementById("cs-overview-challenge")?.value.trim() || "",
      strategy: document.getElementById("cs-overview-strategy")?.value.trim() || "",
      solution: document.getElementById("cs-overview-solution")?.value.trim() || "",
      execution: document.getElementById("cs-overview-execution")?.value.trim() || "",
      results: document.getElementById("cs-overview-results")?.value.trim() || ""
    };

    const results = {
      stat1Num: document.getElementById("cs-stat1-num")?.value.trim() || "+500K",
      stat1Label: document.getElementById("cs-stat1-label")?.value.trim() || "Social Views",
      stat2Num: document.getElementById("cs-stat2-num")?.value.trim() || "+60%",
      stat2Label: document.getElementById("cs-stat2-label")?.value.trim() || "Growth",
      stat3Num: document.getElementById("cs-stat3-num")?.value.trim() || "4.2x",
      stat3Label: document.getElementById("cs-stat3-label")?.value.trim() || "ROI",
      stat4Num: document.getElementById("cs-stat4-num")?.value.trim() || "100%",
      stat4Label: document.getElementById("cs-stat4-label")?.value.trim() || "Satisfaction",

      feedbackQuote: document.getElementById("cs-feedback-quote")?.value.trim() || "",
      feedbackAuthor: document.getElementById("cs-feedback-author")?.value.trim() || "",
      feedbackRole: document.getElementById("cs-feedback-role")?.value.trim() || ""
    };

    const deskMockUrl = document.getElementById("cs-desktop-mockup-url")?.value.trim() || activeGallery[0] || heroUrl;
    const mobMockUrl = document.getElementById("cs-mobile-mockup-url")?.value.trim() || activeGallery[1] || logoUrl;

    const media = {
      gallery: [...activeGallery],
      videos: activeVideos.map(v => v.url),
      mockups: {
        desktop: deskMockUrl,
        mobile: mobMockUrl
      }
    };

    const seo = {
      title: document.getElementById("cs-seo-title")?.value.trim() || `${companyName} Case Study | Betroverse`,
      description: document.getElementById("cs-seo-desc")?.value.trim() || shortIntro,
      keywords: document.getElementById("cs-seo-keywords")?.value.trim() || "",
      ogImage: document.getElementById("cs-seo-ogimage")?.value.trim() || heroUrl,
      canonicalUrl: document.getElementById("cs-seo-canonical")?.value.trim() || `https://betroverse.in/portfolio/${slug}`
    };

    let list = getBetroCaseStudies();

    if (editId) {
      list = list.map(cs => {
        if (cs.id === editId) {
          return {
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
            seo
          };
        }
        return cs;
      });
    } else {
      const newCS = {
        id: "cs-" + Date.now(),
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
        seo
      };
      list.push(newCS);
    }

    saveBetroCaseStudies(list);

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
    localStorage.setItem("betro_projects", JSON.stringify(legacyProjects));

    renderCaseStudiesTab();
  };

  if (csForm) {
    csForm.addEventListener("submit", (e) => {
      e.preventDefault();
      try {
        saveActiveEditorState();
        setEditorSaved();
        closeCSModal();
        renderCaseStudiesTab();
        showAdminToast("Save Successful! Case Study updated in live portfolio.", "success");
      } catch (err) {
        console.error("CS Save error:", err);
        showAdminToast("Save Failed: " + (err.message || "Unknown error"), "error");
      }
    });
  }

  // Search & Filter Listeners
  document.getElementById("cs-search-input")?.addEventListener("input", renderCaseStudiesTab);
  document.getElementById("cs-status-filter")?.addEventListener("change", renderCaseStudiesTab);

  // Sidebar Links Tab Switcher
  const sidebarLinks = document.querySelectorAll(".sidebar-link");
  const tabPanels = document.querySelectorAll(".tab-panel");

  sidebarLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tabId = link.getAttribute("data-tab");

      sidebarLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      tabPanels.forEach(panel => panel.classList.remove("active"));
      const targetPanel = document.getElementById(`tab-${tabId}`);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }

      const pageTitle = document.getElementById("page-title");
      const pageSubtitle = document.getElementById("page-subtitle");

      if (tabId === "casestudies") {
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
        if (pageTitle) pageTitle.textContent = "Portal Settings";
        if (pageSubtitle) pageSubtitle.textContent = "Manage offline storage settings and session logs.";
      }
    });
  });

  // Check initial Auth state
  checkAuth();
});


