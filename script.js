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
  distance: "100px",
  origin: "bottom",
  duration: 2000,
};

// -----------------------Hero Animations------------------------------

ScrollReveal().reveal("header.section__container h1", {
  ...scrollRevealOption,
  delay: 700,
  origin:"right",
    interval: 700,
});
ScrollReveal().reveal("nav", {
  ...scrollRevealOption,
  delay: 700,
  origin:"top",
    interval: 700,
});
ScrollReveal().reveal(".header__container h2", {
  ...scrollRevealOption,
  delay: 500,
  origin:"top",
});

ScrollReveal().reveal(".header__container p", {
  ...scrollRevealOption,
  delay: 500,
   origin:"left",
});
ScrollReveal().reveal(".header__btns", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".bgdraw", {
  ...scrollRevealOption,
  delay: 500,
});

// --------------------------------About ------------------------------------------

ScrollReveal().reveal(".about_right h3", {
  ...scrollRevealOption,
  delay: 700,
  origin:"top",
    interval: 700,
});
ScrollReveal().reveal(".about_right ul li", {
  ...scrollRevealOption,
  interval: 500,
});

ScrollReveal().reveal(".about_left", {
  ...scrollRevealOption,
  delay: 500,
  origin:"left",
});


// ------------------------------------Services-------------------------------------

ScrollReveal().reveal(".room__card", {
  ...scrollRevealOption,
  interval: 500,
});

// -----------------------------------sub-------------------------------------------
ScrollReveal().reveal(".subscribe__content .section__header", {
  ...scrollRevealOption,
  delay: 500,
});


//----------------------------------------contact------------------------------------------
ScrollReveal().reveal(".container .content", {
  ...scrollRevealOption,
  delay: 500,
});

ScrollReveal().reveal(".container .content", {
  ...scrollRevealOption,
  delay: 500,
});

ScrollReveal().reveal(".bottom_clint ul li img", {
  ...scrollRevealOption,
  interval: 200,
});

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

document.addEventListener('DOMContentLoaded', () => {
  const interval = 2000;

  const startCounter = (el) => {
    if (el.dataset.started) return;
    el.dataset.started = 'true';

    let start = 0;
    const end = parseInt(el.getAttribute('data-val')) || 0;
    const suffix = el.getAttribute('data-suffix') || "K"; // 👈 new attribute

    el.textContent = start;

    if (end <= 0) return;

    const stepTime = Math.max(Math.floor(interval / end), 10);

    const tick = () => {
      start++;
      el.textContent = start.toLocaleString();
      if (start < end) {
        setTimeout(tick, stepTime);
      } else {
        el.textContent = end.toLocaleString() + suffix; // 👈 add suffix at the end
      }
    };
    tick();
  };

  // Observe each container2 separately
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const num = entry.target.querySelector('.num');
          if (num) startCounter(num);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.count .container2').forEach(box => {
      obs.observe(box);
    });
  }
});

// ==========================================================================
// Betroverse Navigation & Interactive Components
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Sticky Header Background Transition ---
  const header = document.querySelector(".site-header");
  const handleScroll = () => {
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
      const name = document.getElementById("home-contact-name").value.trim();
      const email = document.getElementById("home-contact-email").value.trim();
      const message = document.getElementById("home-contact-message").value.trim();
      
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      
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

  // --- 7. Dynamic Brands Rendering from LocalStorage ---
  const loadDynamicBrands = () => {
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

    const storedBrands = localStorage.getItem("betro_brands");
    let brands = [];
    if (!storedBrands) {
      localStorage.setItem("betro_brands", JSON.stringify(defaultBrands));
      brands = defaultBrands;
    } else {
      brands = JSON.parse(storedBrands);
    }

    const brandsList = document.getElementById("home-brands-list");
    if (brandsList) {
      brandsList.innerHTML = "";
      brands.forEach(b => {
        const li = document.createElement("li");
        const img = document.createElement("img");
        const base = b.src.replace(/\.(png|jpe?g)$/i, "");
        img.src = `${base}.webp`;
        img.alt = "Brand Logo";
        img.loading = "lazy";
        img.decoding = "async";
        img.setAttribute("data-fallback", b.src);
        img.onerror = function() {
          const fb = this.getAttribute("data-fallback");
          if (fb && this.src !== fb) this.src = fb;
        };
        if (b.style) {
          img.setAttribute("style", b.style);
        }
        li.appendChild(img);
        brandsList.appendChild(li);
      });
    }
  };

  loadDynamicBrands();
});




