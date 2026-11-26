// Fast Preloader Dismissal (dismiss immediately once DOM and initial cards are ready)
const dismissPreloader = () => {
  const preloader = document.getElementById("preloader");
  if (preloader && !preloader.classList.contains("hide")) {
    preloader.classList.add("hide");
  }
};

if (document.readyState === "interactive" || document.readyState === "complete") {
  setTimeout(dismissPreloader, 80);
} else {
  document.addEventListener("DOMContentLoaded", () => setTimeout(dismissPreloader, 100));
}
window.addEventListener("load", dismissPreloader);

// Initialize ScrollReveal with snappy performance timings
if (typeof ScrollReveal !== "undefined") {
  const scrollRevealOption = {
    distance: "30px",
    origin: "bottom",
    duration: 700,
  };

  ScrollReveal().reveal("header.site-header", {
    ...scrollRevealOption,
    delay: 100,
    origin: "top",
  });

  ScrollReveal().reveal(".portfolio-header-container", {
    ...scrollRevealOption,
    delay: 150,
    origin: "bottom",
  });
}

const initPortfolio = () => {
  // --- 1. Sticky Header Background Transition ---
  const header = document.querySelector(".site-header");
  const handleScroll = () => {
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // --- 2. Mobile Drawer Navigation ---
  const menuToggle = document.getElementById("menu-toggle");
  const closeDrawer = document.getElementById("close-drawer");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const drawerOverlay = document.getElementById("drawer-overlay");
  const mobileDrawerLinks = document.querySelectorAll(".mobile-nav-item");

  const openMobileMenu = () => {
    if (menuToggle && mobileDrawer && drawerOverlay) {
      menuToggle.classList.add("active");
      mobileDrawer.classList.add("open");
      drawerOverlay.classList.add("open");
      menuToggle.setAttribute("aria-expanded", "true");
      mobileDrawer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  };

  const closeMobileMenu = () => {
    if (menuToggle && mobileDrawer && drawerOverlay) {
      menuToggle.classList.remove("active");
      mobileDrawer.classList.remove("open");
      drawerOverlay.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      mobileDrawer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  };

  if (menuToggle && mobileDrawer && drawerOverlay) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileDrawer.classList.contains("open");
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    if (closeDrawer) closeDrawer.addEventListener("click", closeMobileMenu);
    drawerOverlay.addEventListener("click", closeMobileMenu);

    mobileDrawerLinks.forEach(link => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  // State variables for search, filtering, and pagination
  let currentFilter = "all";
  let searchQuery = "";
  let visibleProjectsCount = 6;
  let projects = [];

  // --- 3. Dynamic Projects Rendering from LocalStorage ---
  // --- 3. Dynamic Projects Rendering from LocalStorage / IndexedDB (Admin Panel Synced) ---
  const fetchCaseStudiesFromStore = () => {
    return new Promise((resolve) => {
      if (typeof window.getBetroCaseStudies === "function") {
        const cs = window.getBetroCaseStudies();
        if (Array.isArray(cs) && cs.length > 0) return resolve(cs);
      }

      if (window.indexedDB) {
        try {
          const req = indexedDB.open("BetroversePortfolioDB", 1);
          req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("app_store")) {
              db.createObjectStore("app_store");
            }
          };
          req.onsuccess = (e) => {
            const db = e.target.result;
            if (db.objectStoreNames.contains("app_store")) {
              const tx = db.transaction("app_store", "readonly");
              const getReq = tx.objectStore("app_store").get("betro_casestudies");
              getReq.onsuccess = () => {
                if (getReq.result && Array.isArray(getReq.result) && getReq.result.length > 0) {
                  return resolve(getReq.result);
                }
                resolve(fromLocalStorage());
              };
              getReq.onerror = () => resolve(fromLocalStorage());
            } else {
              resolve(fromLocalStorage());
            }
          };
          req.onerror = () => resolve(fromLocalStorage());
        } catch (err) {
          resolve(fromLocalStorage());
        }
      } else {
        resolve(fromLocalStorage());
      }
    });

    function fromLocalStorage() {
      const raw = localStorage.getItem("betro_casestudies");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) { }
      }
      return [];
    }
  };

  const mapAndSetStudies = (studiesList) => {
    if (!Array.isArray(studiesList) || studiesList.length === 0) return;
    let deletedCsIds = [];
    try {
      const rawDel = localStorage.getItem("betro_deleted_casestudy_ids");
      if (rawDel) deletedCsIds = JSON.parse(rawDel);
    } catch (e) { }

    let filtered = studiesList;
    if (Array.isArray(deletedCsIds) && deletedCsIds.length > 0) {
      filtered = filtered.filter(cs => !deletedCsIds.includes(cs.id) && !deletedCsIds.includes(cs.slug));
    }
    const activeStudies = filtered.filter(cs => (cs.status || "published") === "published");
    const targetList = activeStudies.length > 0 ? activeStudies : filtered;

    // Strict sort by sort_order / sortOrder / displayOrder / display_order
    targetList.sort((a, b) => {
      const orderA = (typeof a.sort_order === "number") ? a.sort_order : ((typeof a.sortOrder === "number") ? a.sortOrder : ((typeof a.displayOrder === "number") ? a.displayOrder : ((typeof a.display_order === "number") ? a.display_order : 9999)));
      const orderB = (typeof b.sort_order === "number") ? b.sort_order : ((typeof b.sortOrder === "number") ? b.sortOrder : ((typeof b.displayOrder === "number") ? b.displayOrder : ((typeof b.display_order === "number") ? b.display_order : 9999)));
      return orderA - orderB;
    });

    projects = targetList.map((cs, idx) => {
      let cardImg = cs.cardImage || cs.heroImage || (cs.media && cs.media.gallery && cs.media.gallery[0]) || ("images/p" + ((idx % 8) + 1) + ".jpg");

      // Resilient local mapping if URL points to remote Supabase storage that is unreachable
      if (cardImg && typeof cardImg === "string") {
        const lower = cardImg.toLowerCase();
        for (let i = 1; i <= 8; i++) {
          if (lower.includes("/p" + i + ".") || lower.endsWith("p" + i + ".jpg")) {
            cardImg = "images/p" + i + ".jpg";
            break;
          }
          if (lower.includes("/s" + i + ".") || lower.endsWith("s" + i + ".jpg")) {
            cardImg = "images/s" + i + ".jpg";
            break;
          }
        }
      }

      const thumb = cs.cardImageThumb || (window.BetroDB && BetroDB.getOptimizedAssetUrl(cardImg, { preferThumb: true })) || cardImg;
      return {
        id: cs.id,
        src: cardImg,
        thumb: thumb,
        companyName: cs.companyName || "Creative Project",
        category: cs.category || "Creative Campaign",
        shortDesc: cs.shortIntro || cs.brandStory || "Premium creative content developed by Betroverse.",
        companyDesc: cs.brandStory || cs.fullDescription || "",
        services: cs.services || ["Creative Design", "Branding"],
        companyId: cs.slug || cs.id,
        logo: cs.companyLogo || "images/logo.png"
      };
    });
  };

    const loadDynamicProjects = async () => {
    // 1. Authoritative Cloud Database fetch from Supabase (with forCards: true)
    if (window.BetroDB) {
      try {
        const fromCloud = await BetroDB.getCaseStudies({ includeDrafts: false, forCards: true });
        if (Array.isArray(fromCloud) && fromCloud.length > 0) {
          mapAndSetStudies(fromCloud);
          return;
        }
      } catch (err) {
        console.warn("[Portfolio] Cloud database fetch failed, using fallback:", err);
      }
    }

    // 2. Local fallback if offline or Supabase not yet configured
    const caseStudies = await fetchCaseStudiesFromStore();
    if (Array.isArray(caseStudies) && caseStudies.length > 0) {
      mapAndSetStudies(caseStudies);
      return;
    }

    const rawProj = localStorage.getItem("betro_projects");
    if (rawProj) {
      try { projects = JSON.parse(rawProj); } catch (e) { }
    }
  };

  // --- Render Project Grid Showcase with Progressive Loading ---
  const positionFloatingCards = () => {
    const gridContainer = document.getElementById("portfolio-grid");
    if (!gridContainer) return;

    const signature = projects.map(p => `${p.id}:${p.src}:${p.companyName}`).join("|");
    if (gridContainer.getAttribute("data-signature") === signature && gridContainer.children.length > 0) {
      return; // Stable DOM guard: projects already rendered and unchanged
    }
    gridContainer.setAttribute("data-signature", signature);
    gridContainer.innerHTML = "";

    projects.forEach((p, idx) => {
      const card = document.createElement("div");
      card.className = "portfolio-card";
      card.setAttribute("data-id", p.id);

      // Progressive loading:
      // First 4 items (viewport) load with eager priority.
      // Subsequent items load lazily with async decoding.
      const isPriority = idx < 4;
      const isTopTwo = idx < 2;

      // Use WebP thumbnail if available, fall back to p.src
      const thumbUrl = p.thumb || (window.BetroDB && BetroDB.getOptimizedAssetUrl(p.src, { preferThumb: true })) || p.src;

      card.innerHTML = `
        <div class="portfolio-card-image-wrapper">
          <img class="portfolio-card-image" 
               src="${thumbUrl}" 
               data-fallback="${p.src}"
               alt="${p.companyName || 'Project'}" 
               loading="${isPriority ? 'eager' : 'lazy'}" 
               decoding="async" 
               ${isTopTwo ? 'fetchpriority="high"' : ''}
               width="600" 
               height="375">
        </div>
        <div class="portfolio-card-body">
          <div class="portfolio-card-meta">
            <span class="portfolio-card-category">${p.category || 'Graphic Showcase'}</span>
            <h3 class="portfolio-card-title">${p.companyName || 'Project Name'}</h3>
            <p class="portfolio-card-desc">${p.shortDesc || 'Premium creative work developed by Betroverse.'}</p>
          </div>
          <button class="portfolio-card-btn" aria-label="View details for ${p.companyName || 'Project'}">
            <span>View Details</span>
            <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      `;

      // Resilient image error handling: fallback smoothly without red error texts
      const cardImgElem = card.querySelector(".portfolio-card-image");
      if (cardImgElem) {
        cardImgElem.onerror = function () {
          // If webp or remote failed, try fallback attribute
          const fallback = this.getAttribute("data-fallback");
          if (fallback && this.src !== fallback && !this.dataset.triedFallback) {
            this.dataset.triedFallback = "true";
            this.src = fallback;
            return;
          }
          // If still failing, fallback to local image based on card index
          if (!this.dataset.triedDefault) {
            this.dataset.triedDefault = "true";
            const fallbackNum = (idx % 8) + 1;
            this.src = "images/p" + fallbackNum + ".jpg";
            return;
          }
          this.onerror = null;
        };
      }

      // Click card to navigate to dedicated Case Study page
      card.addEventListener("click", () => {
        const companyId = (p.companyId || "independent").toLowerCase();
        window.location.href = `portfolio/case-study.html?id=${companyId}`;
      });

      gridContainer.appendChild(card);
    });
  };

  const setupControls = () => {
    // Left as placeholder to prevent any references from throwing errors
  };
  // --- 4. Project Details Modal Logic ---
  const modal = document.getElementById("project-details-modal");
  const closeDetailsBtn = document.getElementById("close-details-btn");
  const detailActiveImg = document.getElementById("detail-active-img");
  const detailCompanyTitle = document.getElementById("detail-company-title");
  const detailCompanyDesc = document.getElementById("detail-company-desc");
  const detailServicesList = document.getElementById("detail-services-list");
  const detailRelatedList = document.getElementById("detail-related-list");

  const openProjectDetails = (project, allProjects) => {
    if (!modal) return;

    // Set active image
    if (detailActiveImg) {
      detailActiveImg.src = project.src;
      detailActiveImg.alt = project.companyName || "Project Image";
    }

    // Set company details
    if (detailCompanyTitle) {
      detailCompanyTitle.textContent = project.companyName || "Independent Project";
    }
    if (detailCompanyDesc) {
      detailCompanyDesc.textContent = project.companyDesc || "A creative design project delivered by Betroverse.";
    }

    // Render services
    if (detailServicesList) {
      detailServicesList.innerHTML = "";
      const services = project.services || ["Creative Design", "Branding"];
      services.forEach(service => {
        const li = document.createElement("li");
        li.className = "service-tag";
        li.textContent = service;
        detailServicesList.appendChild(li);
      });
    }

    // Render related projects scroller
    if (detailRelatedList) {
      detailRelatedList.innerHTML = "";
      const companyId = project.companyId || "independent";

      // Filter all projects with the same companyId
      const relatedProjects = (allProjects || []).filter(p => p.companyId === companyId);

        relatedProjects.forEach(rp => {
          const img = document.createElement("img");
          img.src = rp.src;
          img.alt = rp.companyName || "Related Project";
          img.className = "related-thumbnail";
          if (rp.id === project.id) {
            img.classList.add("active");
          }

            // Clicking a related thumbnail switches the active view inside the modal
            img.addEventListener("click", () => {
              detailRelatedList.querySelectorAll(".related-thumbnail").forEach(t => t.classList.remove("active"));
              img.classList.add("active");

              if (detailActiveImg) {
                detailActiveImg.src = rp.src;
                detailActiveImg.alt = rp.companyName || "Project Image";
              }
            });

            detailRelatedList.appendChild(img);
          });
        }

      // Show modal with smooth transition
      modal.classList.remove("hidden");
      modal.offsetWidth; // force reflow
      modal.classList.add("open");
      document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
    };

    const closeProjectDetails = () => {
      if (!modal) return;
      modal.classList.remove("open");
      document.body.style.overflow = ""; // Restore body scrolling

      const handler = () => {
        modal.classList.add("hidden");
        modal.removeEventListener("transitionend", handler);
      };
      modal.addEventListener("transitionend", handler);
    };

    if (closeDetailsBtn) {
      closeDetailsBtn.addEventListener("click", closeProjectDetails);
    }

    if (modal) {
      // Close on click outside modal-card
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeProjectDetails();
        }
      });

      // Close on ESC key
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) {
          closeProjectDetails();
        }
      });
    }

    // 1. Instant Synchronous Cache Render (0ms delay)
    try {
      const cachedRaw = localStorage.getItem("betro_casestudies_cache") || localStorage.getItem("betro_casestudies");
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          mapAndSetStudies(parsed);
          positionFloatingCards();
          dismissPreloader();
        }
      }
    } catch (e) { }

    const reloadPortfolioGrid = async () => {
      await loadDynamicProjects();
      positionFloatingCards();
      dismissPreloader();
    };

    reloadPortfolioGrid();
    setupControls();

    // Real-time synchronization listeners across windows/tabs
    if ("BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel("betro_portfolio_sync");
        channel.onmessage = (e) => {
          if (e.data && e.data.type === "CASE_STUDY_UPDATED") {
            reloadPortfolioGrid();
          }
        };
      } catch (e) { }
    }
    window.addEventListener("storage", (e) => {
      if (e.key === "betro_casestudies" || e.key === "betro_projects") {
        reloadPortfolioGrid();
      }
    });
    window.addEventListener("betro_storage_updated", () => {
      reloadPortfolioGrid();
    });

    // --- 5. Brand Logo Carousel ("Brands Who Believe in Us") ---
    const initBrandsCarousel = () => {
      const defaultBrandsList = [
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

      // Read permanently deleted IDs list so deleted logos NEVER reappear
      let deletedIds = [];
      try {
        const rawDel = localStorage.getItem("betro_deleted_brand_ids");
        if (rawDel) deletedIds = JSON.parse(rawDel);
      } catch (e) { }

      const storedBrandsRaw = localStorage.getItem("betro_brands");
      let activeBrands = [];

      if (storedBrandsRaw !== null) {
        try {
          const parsed = JSON.parse(storedBrandsRaw);
          if (Array.isArray(parsed)) {
            activeBrands = parsed;
          }
        } catch (e) {
          activeBrands = [...defaultBrandsList];
        }
      } else {
        activeBrands = [...defaultBrandsList];
      }

      // Filter out permanently deleted IDs
      if (Array.isArray(deletedIds) && deletedIds.length > 0) {
        activeBrands = activeBrands.filter(b => !deletedIds.includes(b.id));
      }

      // Filter only visible brands
      const visibleBrands = activeBrands.filter(b => b.visible !== false);

      const track = document.getElementById("brands-marquee-track");
      if (!track) return;
      track.innerHTML = "";

      // Render active brands in static grid (no duplication)
      visibleBrands.forEach((b) => {
        const item = document.createElement("div");
        item.className = "brand-marquee-item";
        item.setAttribute("data-brand-id", b.id);

        const img = document.createElement("img");
        const webpSrc = (window.BetroDB && BetroDB.getOptimizedAssetUrl(b.src)) || b.src;
        img.src = webpSrc;
        img.alt = b.companyName || "Brand Logo";
        img.className = "brand-logo-img";
        img.loading = "lazy";
        img.decoding = "async";
        img.setAttribute("data-fallback", b.src);
        img.onerror = function () {
          const fb = this.getAttribute("data-fallback");
          if (fb && this.src !== fb) {
            this.src = fb;
          }
        };
        if (b.style) {
          img.setAttribute("style", b.style);
        }

        item.appendChild(img);

        // On click, navigate to dedicated Case Study page
        item.addEventListener("click", (e) => {
          e.preventDefault();
          const companyId = b.companyId || "independent";
          window.location.href = `portfolio/${companyId}.html`;
        });

        track.appendChild(item);
      });
    };

    initBrandsCarousel();

    // Real-time synchronization listeners across windows/tabs
    const handlePortfolioSync = async () => {
      await loadDynamicProjects();
      positionFloatingCards();
      if (typeof renderGalleryProjects === "function") renderGalleryProjects();
    };

    if ("BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel("betro_portfolio_sync");
        channel.onmessage = (e) => {
          if (e.data && (e.data.type === "CASE_STUDY_UPDATED" || e.data.type === "MEDIA_SYNC" || e.data.type === "CASE_STUDY_DELETED")) {
            handlePortfolioSync();
          }
        };
      } catch (e) { }
    }
    window.addEventListener("storage", (e) => {
      if (e.key === "betro_casestudies" || e.key === "betro_projects" || e.key === "betro_casestudies_cache") {
        handlePortfolioSync();
      }
    });
    window.addEventListener("betro_storage_updated", () => {
      handlePortfolioSync();
    });
    window.addEventListener("betro_db_updated", (e) => {
      if (e && e.detail && e.detail.type) {
        handlePortfolioSync();
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPortfolio);
  } else {
    initPortfolio();
  }

