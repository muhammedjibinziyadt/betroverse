const dismissPreloader = () => {
  const preloader = document.getElementById("preloader");
  if (preloader && !preloader.classList.contains("hide")) {
    preloader.classList.add("hide");
  }
  const content = document.getElementById("content");
  if (content) {
    content.style.display = "block";
  }
};

if (document.readyState === "interactive" || document.readyState === "complete") {
  setTimeout(dismissPreloader, 80);
} else {
  document.addEventListener("DOMContentLoaded", () => setTimeout(dismissPreloader, 100));
}
window.addEventListener("load", dismissPreloader);

const scrollRevealOption = {
  distance: "24px",
  origin: "bottom",
  duration: 700,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  viewFactor: 0.05,
  mobile: true,
};

// -----------------------Hero Animations------------------------------

if (typeof ScrollReveal !== "undefined") {
  ScrollReveal().reveal("header.section__container h1", {
    ...scrollRevealOption,
    delay: 200,
    origin: "bottom",
  });
  ScrollReveal().reveal(".header__container h2", {
    ...scrollRevealOption,
    delay: 100,
    origin: "top",
  });
  ScrollReveal().reveal(".header__container p", {
    ...scrollRevealOption,
    delay: 250,
    origin: "bottom",
  });
  ScrollReveal().reveal(".header__btns", {
    ...scrollRevealOption,
    delay: 300,
  });

  // --------------------------------About ------------------------------------------

  ScrollReveal().reveal(".about_left", {
    ...scrollRevealOption,
    delay: 150,
  });
  ScrollReveal().reveal(".about_right ul li", {
    ...scrollRevealOption,
    interval: 80,
  });

  // ------------------------------------Services-------------------------------------

  ScrollReveal().reveal(".room__card", {
    ...scrollRevealOption,
    interval: 80,
    delay: 100,
  });

  // -----------------------------------Process---------------------------------------
  ScrollReveal().reveal(".process__card", {
    ...scrollRevealOption,
    interval: 80,
    delay: 100,
  });

  // -----------------------------------Subscribe-------------------------------------
  ScrollReveal().reveal(".subscribe__content", {
    ...scrollRevealOption,
    delay: 150,
  });

  //------------------------------------Contact---------------------------------------
  ScrollReveal().reveal(".container .content3", {
    ...scrollRevealOption,
    delay: 150,
  });
}

// document.addEventListener('DOMContentLoaded', () => {
//   const valueDisplays = document.querySelectorAll('.num');
//   const interval = 4000;
//   if (!valueDisplays.length) {
//     console.warn('No .num elements found (.num)');
//     return;
//   }

//   const parseEnd = (el) => {
//     const raw = el.getAttribute('data-val') || '0';
//     return parseInt(raw.replace(/,/g, ''), 10) || 0;
//   };

//   const startCounter = (el) => {
//     if (el.dataset.started) return; // don't restart
//     el.dataset.started = 'true';
//     let start = 0;
//     const end = parseEnd(el);
//     if (end <= 0) { el.textContent = String(end); return; }

//     const stepTime = Math.max(Math.floor(interval / end), 10); // min 10ms
//     const tick = () => {
//       start += 1;
//       el.textContent = start;
//       if (start < end) el._timer = setTimeout(tick, stepTime);
//     };
//     tick();
//   };

//   if ('IntersectionObserver' in window) {
//     const obs = new IntersectionObserver((entries, observer) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           startCounter(entry.target);
//           observer.unobserve(entry.target);
//         }
//       });
//     }, { threshold: 0.5 });
//     valueDisplays.forEach(el => obs.observe(el));
//   } else {
//     const inViewport = (el) => {
//       const r = el.getBoundingClientRect();
//       return r.top < window.innerHeight && r.bottom >= 0;
//     };
//     const onScroll = () => {
//       valueDisplays.forEach(el => { if (!el.dataset.started && inViewport(el)) startCounter(el); });
//       if ([...valueDisplays].every(el => el.dataset.started)) {
//         window.removeEventListener('scroll', onScroll);
//         window.removeEventListener('resize', onScroll);
//       }
//     };
//     window.addEventListener('scroll', onScroll, { passive: true });
//     window.addEventListener('resize', onScroll);
//     onScroll(); // initial check
//   }
// });



// ==========================================================================
// Betroverse Navigation & Interactive Components
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Sticky Header Background Transition ---
  const header = document.querySelector(".site-header");
  const handleScroll = () => {
    if (!header) return;
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll(); // Initial run

  // --- 2. Mobile Drawer Navigation ---
  const menuToggle = document.getElementById("menu-toggle");
  const closeDrawer = document.getElementById("close-drawer");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const drawerOverlay = document.getElementById("drawer-overlay");
  const mobileDrawerLinks = document.querySelectorAll(".mobile-nav-item");

  const openMobileMenu = () => {
    menuToggle.classList.add("active");
    mobileDrawer.classList.add("open");
    drawerOverlay.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
    mobileDrawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Prevent scrolling behind drawer
  };

  const closeMobileMenu = () => {
    menuToggle.classList.remove("active");
    mobileDrawer.classList.remove("open");
    drawerOverlay.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    mobileDrawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // Enable scrolling
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

  // --- 3. ScrollSpy Active Page Indicator ---
  const sections = document.querySelectorAll("section[id], header[id]");
  const navItems = document.querySelectorAll(".nav-item");
  const mobileNavItems = document.querySelectorAll(".mobile-nav-item");

  const scrollSpyOptions = {
    root: null,
    rootMargin: "-20% 0px -60% 0px", // Fires active indicators when sections cover the center screen
    threshold: 0
  };

  const scrollSpyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute("id");

        // Skip background utility section ids
        if (activeId === "subscribe") return;

        // Desktop nav active indicator
        navItems.forEach(item => {
          if (item.getAttribute("href") === `#${activeId}`) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });

        // Mobile nav active indicator
        mobileNavItems.forEach(item => {
          if (item.getAttribute("href") === `#${activeId}`) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
      }
    });
  }, scrollSpyOptions);

  sections.forEach(section => {
    scrollSpyObserver.observe(section);
  });

  // --- 4. Interactive FAQ Accordion ---
  const faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach(item => {
    const question = item.querySelector(".faq__question");
    const answer = item.querySelector(".faq__answer");

    if (question && answer) {
      question.addEventListener("click", () => {
        const isActive = item.classList.contains("active");

        // Close all other accordion items
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains("active")) {
            otherItem.classList.remove("active");
            otherItem.querySelector(".faq__answer").style.maxHeight = null;
          }
        });

        // Toggle state of current item
        item.classList.toggle("active");
        if (isActive) {
          answer.style.maxHeight = null;
        } else {
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    }
  });

  // --- 5. Swiper Testimonials Slider ---
  if (typeof Swiper !== "undefined" && document.querySelector(".testimonials-swiper")) {
    new Swiper(".testimonials-swiper", {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 2,
        }
      },
      navigation: {
        nextEl: ".next-btn",
        prevEl: ".prev-btn",
      },
    });
  }

  // --- 6. Homepage Contact Form Submission to Google Sheets & LocalStorage ---
  const homeForm = document.getElementById("home-contact-form");
  if (homeForm) {
    homeForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = homeForm.querySelector("button[type='submit']");
      const name = document.getElementById("home-contact-name")?.value.trim() || "";
      const email = document.getElementById("home-contact-email")?.value.trim() || "";
      const message = document.getElementById("home-contact-message")?.value.trim() || "";

      const originalText = submitBtn ? submitBtn.textContent : "Send Message";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      // Parse first name and last name
      const nameParts = name.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      const params = new URLSearchParams();
      params.append("First name", firstName);
      params.append("Last name", lastName || "");
      params.append("email", email);
      params.append("phone", "");
      params.append("service", "General Inquiry");

      try {
        // Submit to Google Apps Script
        await fetch("https://script.google.com/macros/s/AKfycbz-YUhYE2JkkqDzCeNjkPikgvSRhwuxOz3PR_FHk-d1Zab_ki5Jnd6C2pIjRfwLOGSN/exec", {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: params.toString()
        });

        // Save locally to localStorage under 'betro_leads' for local admin dashboard
        const newLead = {
          id: "local-" + Date.now(),
          created_at: new Date().toISOString(),
          first_name: firstName,
          last_name: lastName || "",
          email: email,
          phone: "",
          service: "General Inquiry",
          message: message,
          status: "new",
          notes: ""
        };

        const localLeadsData = localStorage.getItem("betro_leads");
        const leadsList = localLeadsData ? JSON.parse(localLeadsData) : [];
        leadsList.unshift(newLead);
        localStorage.setItem("betro_leads", JSON.stringify(leadsList));

        alert("Thank you! Your message has been sent successfully.");
        homeForm.reset();
      } catch (err) {
        console.error("Error submitting lead:", err);
        alert("Failed to send message: " + (err.message || err));
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // --- 7. Dynamic Brands Rendering from LocalStorage & Admin Panel ---
  const loadDynamicBrands = () => {
    const defaultBrands = [
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
        activeBrands = [...defaultBrands];
      }
    } else {
      activeBrands = [...defaultBrands];
      try {
        localStorage.setItem("betro_brands", JSON.stringify(activeBrands));
      } catch (e) { }
    }

    // Filter out permanently deleted IDs
    if (Array.isArray(deletedIds) && deletedIds.length > 0) {
      activeBrands = activeBrands.filter(b => !deletedIds.includes(b.id));
    }

    // Filter only visible brands for live website
    const visibleBrands = activeBrands.filter(b => b.visible !== false);


    // Asynchronously update with live Supabase database if available
    if (window.BetroDB && typeof window.BetroDB.getBrandLogos === "function") {
      BetroDB.getBrandLogos().then(cloudList => {
        if (Array.isArray(cloudList) && cloudList.length > 0 && cloudList.length !== activeBrands.length) {
          try {
            localStorage.setItem("betro_brands", JSON.stringify(cloudList));
            loadDynamicBrands();
          } catch (e) { }
        }
      }).catch(() => {});
    }
      const track = document.getElementById("brands-marquee-track");
    if (track) {
      track.innerHTML = "";

      visibleBrands.forEach((b) => {
        const item = document.createElement("div");
        item.className = "brand-marquee-item";
        item.setAttribute("data-brand-id", b.id);

        const img = document.createElement("img");
        const webpSrc = (window.BetroDB && BetroDB.getOptimizedAssetUrl(b.src)) || b.src;
        img.src = webpSrc;
        img.alt = b.name || b.companyName || "Brand Logo";
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
          const companyId = b.companyId || b.company_id || "independent";
          window.location.href = `portfolio/${companyId}.html`;
        });

        track.appendChild(item);
      });
    }
  };

  loadDynamicBrands();

  // Real-time synchronization listeners across windows/tabs
  window.addEventListener("storage", (e) => {
    if (e.key === "betro_brands" || e.key === "betro_deleted_brand_ids") {
      loadDynamicBrands();
    }
  });
  window.addEventListener("betro_storage_updated", () => {
    loadDynamicBrands();
  });
  window.addEventListener("betro_db_updated", () => {
    loadDynamicBrands();
  });
  if ("BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel("betro_portfolio_sync");
      channel.onmessage = (msg) => {
        if (msg && msg.data && (msg.data.type === "brands_updated" || msg.data.type === "brand_logos")) {
          loadDynamicBrands();
        }
      };
    } catch (e) { }
  }
});




