"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";

export default function PortfolioClient({ initialProjects = [] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [preloaderHidden, setPreloaderHidden] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPreloaderHidden(true), 80);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Sync latest from MongoDB API
    fetch("/api/portfolio?includeDrafts=false")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
        }
      })
      .catch(() => { });

    let channel = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel("betro_portfolio_sync");
        channel.onmessage = (e) => {
          if (
            e?.data?.type === "CASE_STUDY_UPDATED" ||
            e?.data?.type === "CASE_STUDY_DELETED"
          ) {
            fetch("/api/portfolio?includeDrafts=false")
              .then((r) => (r.ok ? r.json() : null))
              .then((data) => {
                if (data?.projects) setProjects(data.projects);
              });
          }
        };
      } catch { }
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      if (channel) channel.close();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
  }, [mobileMenuOpen]);

  const resolveImage = (val, fallbackIdx) => {
    if (!val || typeof val !== "string") {
      return `/images/p${(fallbackIdx % 8) + 1}.jpg`;
    }
    const lower = val.toLowerCase();
    for (let i = 1; i <= 8; i++) {
      if (lower.includes(`/p${i}.`) || lower.endsWith(`p${i}.jpg`)) {
        return `/images/p${i}.jpg`;
      }
      if (lower.includes(`/s${i}.`) || lower.endsWith(`s${i}.jpg`)) {
        return `/images/s${i}.jpg`;
      }
    }
    if (val.startsWith("images/")) return "/" + val;
    return val;
  };

  const initScrollReveal = () => {
    if (typeof window !== "undefined" && typeof window.ScrollReveal !== "undefined") {
      const sr = window.ScrollReveal();
      sr.reveal("header.site-header", {
        distance: "30px",
        origin: "top",
        duration: 700,
        delay: 100,
      });
      sr.reveal(".portfolio-header-container", {
        distance: "30px",
        origin: "bottom",
        duration: 700,
        delay: 150,
      });
    }
  };

  return (
    <>
      <Script
        src="https://unpkg.com/scrollreveal"
        strategy="afterInteractive"
        onLoad={initScrollReveal}
      />

      <div id="preloader" className={preloaderHidden ? "hide" : ""}>
        <div className="loader"></div>
      </div>

      {/* HEADER */}
      <header className={`site-header${scrolled ? " scrolled" : ""}`}>
        <div className="header-container">
          <div className="logo-container">
            <Link href="/" className="logo-link">
              <img src="/images/logo.png" alt="Betroverse Logo" className="logo-img" />
            </Link>
          </div>

          <nav className="desktop-nav" aria-label="Main Navigation">
            <ul className="nav-menu">
              <li><Link href="/#home" className="nav-item">Home</Link></li>
              <li><Link href="/#about" className="nav-item">About</Link></li>
              <li><Link href="/#services" className="nav-item">Services</Link></li>
              <li>
                <Link
                  href="/portfolio"
                  className="nav-item active"
                  style={{ borderBottom: "2px solid var(--primary-color)" }}
                >
                  Portfolio
                </Link>
              </li>
              <li><Link href="/#process" className="nav-item">Process</Link></li>
              <li><Link href="/#contact" className="nav-item">Contact</Link></li>
            </ul>
          </nav>

          <div className="header-actions">
            <a
              href="https://wa.me/916282528914"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn"
            >
              <span>Get Started</span>
              <i className="ri-arrow-right-line"></i>
            </a>

            <button
              className={`mobile-menu-btn${mobileMenuOpen ? " active" : ""}`}
              id="menu-toggle"
              aria-expanded={mobileMenuOpen}
              aria-label="Open navigation menu"
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div
          className={`mobile-nav-drawer${mobileMenuOpen ? " open" : ""}`}
          id="mobile-drawer"
          aria-hidden={!mobileMenuOpen}
        >
          <div className="mobile-drawer-header">
            <img src="/images/logo.png" alt="Betroverse Logo" className="logo-img" />
            <button
              className="close-drawer-btn"
              id="close-drawer"
              aria-label="Close navigation menu"
              type="button"
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
          <ul className="mobile-menu">
            <li><Link href="/#home" className="mobile-nav-item">Home</Link></li>
            <li><Link href="/#about" className="mobile-nav-item">About</Link></li>
            <li><Link href="/#services" className="mobile-nav-item">Services</Link></li>
            <li><Link href="/portfolio" className="mobile-nav-item active">Portfolio</Link></li>
            <li><Link href="/#process" className="mobile-nav-item">Process</Link></li>
            <li><Link href="/#contact" className="mobile-nav-item">Contact</Link></li>
          </ul>
          <div className="mobile-drawer-actions">
            <a
              href="https://wa.me/916282528914"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-cta-btn"
            >
              Get Started <i className="ri-arrow-right-line"></i>
            </a>
          </div>
        </div>
        <div
          className={`drawer-overlay${mobileMenuOpen ? " open" : ""}`}
          id="drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      </header>

      {/* PORTFOLIO HERO & GALLERY */}
      <section id="gallery" className="premium-portfolio-section">
        <div className="portfolio-header-container">
          <span className="portfolio-subtitle">OUR CREATIVE WORK</span>
          <h1 className="portfolio-title">Creative Portfolio</h1>
          <p className="portfolio-desc">
            Showcasing premium branding, websites, social media creatives, digital
            campaigns and creative solutions built by Betroverse.
          </p>
        </div>

        <div className="portfolio-grid-container">
          <div className="portfolio-grid" id="portfolio-grid">
            {projects.map((p, idx) => {
              const cardSrc = resolveImage(
                p.cardImage ||
                p.heroImage ||
                (p.media && p.media.gallery && p.media.gallery[0]),
                idx
              );
              const slug = (p.slug || p.id || "independent").toLowerCase();
              const isPriority = idx < 4;

              return (
                <div
                  key={p.id || idx}
                  className="portfolio-card"
                  data-id={p.id}
                  onClick={() => router.push(`/portfolio/${slug}`)}
                >
                  <div className="portfolio-card-image-wrapper">
                    <img
                      className="portfolio-card-image"
                      src={cardSrc}
                      alt={p.companyName || "Project"}
                      loading={isPriority ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={idx < 2 ? "high" : undefined}
                      width="600"
                      height="375"
                      onError={(e) => {
                        const fallback = `/images/p${(idx % 8) + 1}.jpg`;
                        if (e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                    />
                  </div>
                  <div className="portfolio-card-body">
                    <div className="portfolio-card-meta">
                      <span className="portfolio-card-category">
                        {p.category || "Graphic Showcase"}
                      </span>
                      <h3 className="portfolio-card-title">
                        {p.companyName || "Project Name"}
                      </h3>
                      <p className="portfolio-card-desc">
                        {p.shortIntro ||
                          p.brandStory ||
                          "Premium creative work developed by Betroverse."}
                      </p>
                    </div>
                    <button
                      className="portfolio-card-btn"
                      aria-label={`View details for ${p.companyName || "Project"}`}
                    >
                      <span>View Details</span>
                      <i className="ri-arrow-right-line"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="section__container7 footer__container">
          <div className="footer__col">
            <div className="footer__logo">
              <Link href="/">Betroverse</Link>
            </div>
            <ul className="footer__socials">
              <li><a href="#"><i className="ri-facebook-fill"></i></a></li>
              <li><a href="#"><i className="ri-twitter-fill"></i></a></li>
              <li><a href="#"><i className="ri-instagram-line"></i></a></li>
              <li><a href="#"><i className="ri-behance-fill"></i></a></li>
              <li><a href="#"><i className="ri-dribbble-fill"></i></a></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>Quick Links</h4>
            <ul className="footer__links">
              <li><Link href="/#home">Home</Link></li>
              <li><Link href="/#about">About</Link></li>
              <li><Link href="/#services">Services</Link></li>
              <li><Link href="/portfolio">Portfolio</Link></li>
              <li><Link href="/#contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>Support</h4>
            <ul className="footer__links">
              <li><a>Help Center</a></li>
              <li><a>Privacy Policy</a></li>
              <li><a>Report an Issue</a></li>
              <li><Link href="/">Get a Quote</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer__bar">
          Copyright © 2027 betroverse. All rights reserved.
        </div>
      </footer>
    </>
  );
}
