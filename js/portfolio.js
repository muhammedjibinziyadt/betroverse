window.addEventListener("load", function() {
  // Delay so preloader fade out is visible
  setTimeout(() => {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.classList.add("hide");
    }
  }, 900);
});

// Initialize ScrollReveal for portfolio page
const scrollRevealOption = {
  distance: "100px",
  origin: "bottom",
  duration: 2000,
};

ScrollReveal().reveal("header.site-header", {
  ...scrollRevealOption,
  delay: 300,
  origin: "top",
});

ScrollReveal().reveal(".header__container h1", {
  ...scrollRevealOption,
  delay: 500,
  origin: "bottom",
});

ScrollReveal().reveal(".header__container p", {
  ...scrollRevealOption,
  delay: 700,
  origin: "bottom",
});

ScrollReveal().reveal("#gallery ul li.project-card", {
  ...scrollRevealOption,
  interval: 150,
});

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
          const req = indexedDB.open("BetroverseMediaDB", 1);
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
        } catch (e) {}
      }
      return [];
    }
  };

  const loadDynamicProjects = async () => {
    let caseStudies = await fetchCaseStudiesFromStore();

    if (!Array.isArray(caseStudies) || caseStudies.length === 0) {
      const rawProj = localStorage.getItem("betro_projects");
      if (rawProj) {
        try { projects = JSON.parse(rawProj); return; } catch (e) {}
      }
    }

    const activeStudies = caseStudies.filter(cs => (cs.status || "published") === "published");
    const targetList = activeStudies.length > 0 ? activeStudies : caseStudies;

    projects = targetList.map(cs => {
      const cardImg = cs.cardImage || cs.heroImage || (cs.media && cs.media.gallery && cs.media.gallery[0]) || "images/p1.jpg";
      return {
        id: cs.id,
        src: cardImg,
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

  // --- Render Project Grid Showcase ---
  const positionFloatingCards = () => {
    const gridContainer = document.getElementById("portfolio-grid");
    if (!gridContainer) return;
    gridContainer.innerHTML = "";

    projects.forEach((p) => {
      const card = document.createElement("div");
      card.className = "portfolio-card";
      card.setAttribute("data-id", p.id);

      card.innerHTML = `
        <div class="portfolio-card-image-wrapper">
          <img class="portfolio-card-image" src="${p.src}" alt="${p.companyName || 'Project'}" loading="lazy">
        </div>
        <div class="portfolio-card-body">
          <div class="portfolio-card-meta">
            <span class="portfolio-card-category">${p.category || 'Graphic Showcase'}</span>
            <h3 class="portfolio-card-title">${p.companyName || 'Project Name'}</h3>
            <p class="portfolio-card-desc">${p.shortDesc || 'Premium creative work developed by Betroverse.'}</p>
          </div>
          <button class="portfolio-card-btn">
            <span>View Details</span>
            <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      `;

      // Image Load Error Handling
      const cardImgElem = card.querySelector(".portfolio-card-image");
      if (cardImgElem) {
        cardImgElem.onerror = function() {
          this.onerror = null;
          this.style.display = "none";
          const wrapper = card.querySelector(".portfolio-card-image-wrapper");
          if (wrapper) {
            wrapper.innerHTML = `
              <div class="img-error-fallback" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(30,41,59,0.8); color: #ef4444; font-size: 0.85rem; gap: 6px; padding: 12px; text-align: center;">
                <i class="ri-image-warning-line" style="font-size: 1.5rem;"></i>
                <span>Image failed to load</span>
              </div>
            `;
          }
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
    detailActiveImg.src = project.src;
    detailActiveImg.alt = project.companyName || "Project Image";

    // Set company details
    detailCompanyTitle.textContent = project.companyName || "Independent Project";
    detailCompanyDesc.textContent = project.companyDesc || "A creative design project delivered by Betroverse.";

    // Render services
    detailServicesList.innerHTML = "";
    const services = project.services || ["Creative Design", "Branding"];
    services.forEach(service => {
      const li = document.createElement("li");
      li.className = "service-tag";
      li.textContent = service;
      detailServicesList.appendChild(li);
    });

    // Render related projects scroller
    detailRelatedList.innerHTML = "";
    const companyId = project.companyId || "independent";
    
    // Filter all projects with the same companyId
    const relatedProjects = allProjects.filter(p => p.companyId === companyId);
    
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
        
        detailActiveImg.src = rp.src;
        detailActiveImg.alt = rp.companyName || "Project Image";
      });
      
      detailRelatedList.appendChild(img);
    });

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

  const reloadPortfolioGrid = async () => {
    await loadDynamicProjects();
    positionFloatingCards();
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
    } catch (e) {}
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
      { 
        id: "brand-1", 
        src: "images/golden.png", 
        companyId: "sa-adiya", 
        companyName: "Sa-Adiya Golden Jubilee",
        category: "Event Branding",
        shortDesc: "Flyers and layouts for Sa-Adiya's grand Golden Jubilee celebrations.",
        companyDesc: "We designed promotional flyers, registration guidelines, and social media announcements for Sa-Adiya's grand Golden Jubilee celebrations.",
        services: ["Creative Design", "Social Media Management"],
        previewImg: "images/p2.jpg"
      },
      { 
        id: "brand-2", 
        src: "images/celes.png", 
        companyId: "celes", 
        companyName: "Celes Lifestyle",
        category: "Luxury Campaign",
        shortDesc: "Minimalist marketing assets and aesthetic Instagram layout grids.",
        companyDesc: "Celes is an exclusive lifestyle brand. We created elegant, minimalist marketing materials, aesthetic Instagram grid layout posts, and event announcements.",
        services: ["Creative Design", "Social Media Management"],
        previewImg: "images/s3.jpg"
      },
      { 
        id: "brand-3", 
        src: "images/toi.png", 
        style: "width: 40%;", 
        companyId: "toi-cafe", 
        companyName: "Toi Cafe",
        category: "Specialty Cafe",
        shortDesc: "Aesthetic social media campaign and custom menu layouts.",
        companyDesc: "Toi Cafe is a specialty coffee shop and dessert lounge. We designed a series of aesthetic social media posts, promotional campaigns, and menus to highlight their unique sweet and savory offerings.",
        services: ["Creative Design", "Social Media Management", "Photography"],
        previewImg: "images/p3.jpg"
      },
      { 
        id: "brand-4", 
        src: "images/AlainArchitecture.png", 
        companyId: "alain-architecture", 
        companyName: "Alain Architecture",
        category: "Architectural Design",
        shortDesc: "Luxury architectural presentations and digital portfolio showcases.",
        companyDesc: "Alain Architecture specializes in luxury architectural design, structural engineering, and modern interior concepts. We created their brand presentation, project showcases, and digital marketing materials.",
        services: ["Architectural Branding", "Visual Design", "Digital Marketing"],
        previewImg: "images/p2.jpg"
      },
      { 
        id: "brand-5", 
        src: "images/Gurumitra.png", 
        companyId: "gurumitra", 
        companyName: "Gurumitra Foundation",
        category: "Educational Design",
        shortDesc: "Clean print brochures and notice layouts for academic outreach.",
        companyDesc: "Gurumitra Foundation is an educational support center. We developed clean, informative promotional brochures, registration notices, and print layouts to connect them with parents and students.",
        services: ["Creative Design", "Print Layout"],
        previewImg: "images/p7.jpg"
      },
      { 
        id: "brand-6", 
        src: "images/Nahdimandi-white.png", 
        companyId: "nahdi-mandi", 
        companyName: "Nahdi Mandi Restaurant",
        category: "Social Media Ads",
        shortDesc: "Arabic dining flyers and promotional visual banners.",
        companyDesc: "Nahdi Mandi serves authentic traditional mandi and grilled food. We crafted visual social media advertisements, new dish announcements, and restaurant branding layouts.",
        services: ["Creative Design", "Social Media Management"],
        previewImg: "images/s2.jpg"
      },
      { 
        id: "brand-7", 
        src: "images/NiceMobiles.png", 
        companyId: "nice-mobiles", 
        companyName: "Nice Mobiles",
        category: "Promo Campaigns",
        shortDesc: "Holiday promotional graphics and discount visual flyers.",
        companyDesc: "Nice Mobiles is a top smartphone retailer. We designed highly engaging discount flyers, trade-in program advertisements, and holiday promo campaigns to drive retail store foot traffic.",
        services: ["Creative Design", "Social Media Management"],
        previewImg: "images/p8.jpg"
      },
      { 
        id: "brand-8", 
        src: "images/Soofimandi-white.png", 
        companyId: "soofi-mandi", 
        companyName: "Soofi Mandi",
        category: "Yemeni Culinary Branding",
        shortDesc: "Authentic restaurant visual identity and promotional dining media.",
        companyDesc: "Soofi Mandi is a premier Yemeni cuisine restaurant known for authentic culinary experiences. We managed their visual identity, promotional campaigns, and brand marketing.",
        services: ["Creative Design", "Social Media Management", "Video Production"],
        previewImg: "images/s2.jpg"
      },
      { 
        id: "brand-9", 
        src: "images/KeyFactory.png", 
        companyId: "key-factory", 
        companyName: "Key Factory",
        category: "Commercial Marketing",
        shortDesc: "High-end security and locking solutions digital branding.",
        companyDesc: "Key Factory provides high-end security and locking solutions. We delivered their digital promotional content, visual flyers, and social media assets.",
        services: ["Creative Design", "Promotional Campaigns"],
        previewImg: "images/s5.jpg"
      },
      { 
        id: "brand-10", 
        src: "images/ENGO FINAL LOGO-01.png", 
        companyId: "engo", 
        companyName: "ENGO",
        category: "Tech & Lifestyle",
        shortDesc: "Digital campaign assets and innovative graphic design.",
        companyDesc: "ENGO is an innovative technology & lifestyle brand. We developed their digital campaign materials, graphic design assets, and promotional media.",
        services: ["Branding Design", "Digital Content Creation"],
        previewImg: "images/p1.jpg"
      },
      { 
        id: "brand-11", 
        src: "images/Artboard 5.png", 
        companyId: "educart", 
        companyName: "EduCart",
        category: "Publishing & EdTech",
        shortDesc: "Custom publishing layouts and digital learning marketing.",
        companyDesc: "EduCart is an educational publishing and learning materials platform. We designed custom book layouts, promotional collateral, and digital marketing creatives.",
        services: ["Print Layout", "Educational Design", "Social Media Management"],
        previewImg: "images/p7.jpg"
      },
      { 
        id: "brand-12", 
        src: "images/Picsart_25-09-24_21-31-47-226.png", 
        companyId: "mylaban", 
        companyName: "MyLaban",
        category: "Creative Branding",
        shortDesc: "Specialty dessert branding and social media campaign in Kochi.",
        companyDesc: "MyLaban is a popular dessert shop in Kochi specializing in authentic Egyptian desserts and premium sweet treats. The brand is known for its rich flavors, high-quality ingredients, and beautifully crafted desserts that offer a unique experience for every customer.\n\nWith a focus on creativity and customer satisfaction, MyLaban continues to delight dessert lovers through innovative offerings and an engaging digital presence that showcases its signature products.",
        services: ["Creative Design", "Social Media Management", "Video Production", "AI Video Creation", "Video Content Creation"],
        previewImg: "images/p1.jpg"
      }
    ];

    const storedBrandsRaw = localStorage.getItem("betro_brands");
    let activeBrands = defaultBrandsList;
    if (storedBrandsRaw) {
      try {
        const parsed = JSON.parse(storedBrandsRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          activeBrands = parsed.map(b => {
            const matchedDef = defaultBrandsList.find(db => db.id === b.id || db.src === b.src);
            return matchedDef ? { ...matchedDef, ...b } : {
              id: b.id || "brand-" + Math.random(),
              src: b.src,
              companyId: b.companyId || "brand-partner",
              companyName: b.name || "Partner Brand",
              category: "Client Branding",
              shortDesc: "Partner brand collaboration with Betroverse.",
              companyDesc: "A valued brand partner collaborating with Betroverse for visual excellence and digital campaigns.",
              services: ["Branding", "Creative Design"],
              previewImg: "images/p1.jpg"
            };
          });
        }
      } catch (e) {
        activeBrands = defaultBrandsList;
      }
    }

    const track = document.getElementById("brands-marquee-track");
    if (!track) return;
    track.innerHTML = "";

    // Duplicate list to create 2 identical consecutive sets for 100% seamless marquee scrolling
    const marqueeBrands = [...activeBrands, ...activeBrands];

    marqueeBrands.forEach((b) => {
      const item = document.createElement("div");
      item.className = "brand-marquee-item";
      item.setAttribute("data-brand-id", b.id);

      const img = document.createElement("img");
      img.src = b.src;
      img.alt = b.companyName || "Brand Logo";
      img.className = "brand-logo-img";
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

  // Re-render gallery on window resize to adjust columns dynamically
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      positionFloatingCards();
    }, 150);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPortfolio);
} else {
  initPortfolio();
}

