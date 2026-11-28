"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { trackContactClick, trackWhatsAppClick } from "@/lib/gtag";

export default function CaseStudyClient({ project, allProjects = [] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [copied, setCopied] = useState(false);

  const data = project || allProjects[0] || {};

  const resolveUrl = (u) => {
    if (!u || typeof u !== "string") return "/images/p1.jpg";
    if (u.startsWith("images/")) return "/" + u;
    return u;
  };

  // Gallery images for Creative Showcase
  const showcaseMedia = [];
  if (data.media && Array.isArray(data.media.gallery)) {
    data.media.gallery.forEach((item, i) => {
      if (!item) return;
      if (typeof item === "object") {
        if (item.status === "deleted" || item.type === "video") return;
        if (item.url?.trim()) {
          showcaseMedia.push({
            id: item.id || `asset-${i}`,
            url: resolveUrl(item.url.trim()),
            title: item.name || `${data.companyName || "Visual"} Asset ${i + 1}`,
          });
        }
      } else if (typeof item === "string" && item.trim()) {
        const lower = item.toLowerCase();
        if (
          !lower.endsWith(".mp4") &&
          !lower.endsWith(".webm") &&
          !lower.endsWith(".mov") &&
          !lower.includes("youtube.com") &&
          !lower.includes("vimeo.com")
        ) {
          showcaseMedia.push({
            id: `asset-${i}`,
            url: resolveUrl(item.trim()),
            title: `${data.companyName || "Visual"} Asset ${i + 1}`,
          });
        }
      }
    });
  }

  // Videos for Video Showcase
  const activeVideos = [];
  if (data.media && Array.isArray(data.media.videos)) {
    data.media.videos.forEach((item, idx) => {
      if (!item) return;
      if (typeof item === "object" && item.status !== "deleted" && item.url?.trim()) {
        activeVideos.push({
          url: resolveUrl(item.url.trim()),
          title: item.name || `${data.companyName || "Motion"} Video ${idx + 1}`,
        });
      } else if (typeof item === "string" && item.trim()) {
        activeVideos.push({
          url: resolveUrl(item.trim()),
          title: `${data.companyName || "Motion"} Video ${idx + 1}`,
        });
      }
    });
  }

  // Related, Prev & Next Projects
  const currentIndex = allProjects.findIndex(
    (cs) =>
      (cs.slug && data.slug && cs.slug.toLowerCase() === data.slug.toLowerCase()) ||
      cs.id === data.id
  );
  const otherProjects = allProjects.filter(
    (cs) =>
      cs.id !== data.id &&
      (!cs.slug || !data.slug || cs.slug.toLowerCase() !== data.slug.toLowerCase())
  );
  const relatedProjects = otherProjects.slice(0, 3);
  const prevStudy = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextStudy =
    currentIndex >= 0 && currentIndex < allProjects.length - 1
      ? allProjects[currentIndex + 1]
      : null;

  const rotations = [-3.5, 2.5, -1.8, 3.8, -2.4, 4.2, -1.5, 3.0, -2.8, 2.0];
  const zIndexes = [10, 8, 6, 7, 9, 5, 4, 3, 2, 1];
  const spanClasses = ["is-hero", "is-tall", "is-square", "is-wide", "is-medium"];
  const annotationsList = [
    "From Concept to Cravings ↴",
    "Designing Brands that tell Stories ↗",
    "Sweet Moments, Stronger Brands ♡",
    "More Than Dessert, A Story in Every Bite ♡",
  ];

  useEffect(() => {
    const handleKey = (e) => {
      if (lightboxIdx === null) return;
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") {
        setLightboxIdx((prev) =>
          prev !== null && prev < showcaseMedia.length - 1 ? prev + 1 : 0
        );
      }
      if (e.key === "ArrowLeft") {
        setLightboxIdx((prev) =>
          prev !== null && prev > 0 ? prev - 1 : showcaseMedia.length - 1
        );
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIdx, showcaseMedia.length]);

  const vis = data.sectionVisibility || {};
  const shareUrl =
    typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
  const shareTitle = encodeURIComponent(
    `Check out ${data.companyName || "Case Study"} by Betroverse Creative Agency`
  );

  return (
    <div className="cs-page-wrapper">
      <link rel="stylesheet" href="/css/case-study.css?v=3.5" />

      {/* HEADER */}
      <header className="site-header scrolled">
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
              <li>
                <Link
                  href="/#contact"
                  className="nav-item"
                  onClick={() => trackContactClick("case_study_header_nav")}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
          <div className="header-actions">
            <a
              href="https://wa.me/916282528914"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn"
              onClick={() => trackWhatsAppClick("case_study_header_get_started")}
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

        {/* Mobile Drawer */}
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
            <li>
              <Link
                href="/#contact"
                className="mobile-nav-item"
                onClick={() => {
                  setMobileMenuOpen(false);
                  trackContactClick("case_study_mobile_nav");
                }}
              >
                Contact
              </Link>
            </li>
          </ul>
          <div className="mobile-drawer-actions">
            <a
              href="https://wa.me/916282528914"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-cta-btn"
              onClick={() => trackWhatsAppClick("case_study_mobile_get_started")}
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

      {/* SECTION 1: HERO SECTION */}
      {vis.hero !== false && (
        <section
          className="cs-hero"
          style={{
            backgroundImage: `url('${resolveUrl(data.heroImage)}')`,
          }}
        >
          <div className="cs-hero-overlay"></div>
          <div className="cs-container cs-hero-content">
            <div className="cs-breadcrumbs">
              <Link href="/">Home</Link>
              <span className="cs-sep"><i className="ri-arrow-right-s-line"></i></span>
              <Link href="/portfolio">Portfolio</Link>
              <span className="cs-sep"><i className="ri-arrow-right-s-line"></i></span>
              <span className="cs-active">{data.companyName}</span>
            </div>

            <Link href="/portfolio" className="cs-back-link">
              <i className="ri-arrow-left-line"></i> Back to Portfolio
            </Link>

            <div className="cs-hero-header-badge">
              <div className="cs-hero-logo-box">
                <img
                  id="cs-logo"
                  src={resolveUrl(data.companyLogo || "/images/logo.png")}
                  alt={`${data.companyName || "Company"} Logo`}
                />
              </div>
              <span id="cs-category" className="cs-category-pill">
                {data.category || "Brand Identity & Digital Strategy"}
              </span>
            </div>

            <h1 id="cs-title" className="cs-hero-title">
              {data.companyName || "Case Study Title"}
            </h1>
            <p id="cs-intro" className="cs-hero-intro">
              {data.shortIntro ||
                data.fullDescription ||
                "Short introduction paragraph outlining the project scope, brand vision, and creative partnership delivered by Betroverse."}
            </p>

            <div className="cs-meta-grid">
              <div className="cs-meta-item">
                <h5>Client</h5>
                <p id="cs-meta-client">{data.clientName || data.companyName}</p>
              </div>
              <div className="cs-meta-item">
                <h5>Industry</h5>
                <p id="cs-meta-industry">{data.industry || "Creative Branding"}</p>
              </div>
              <div className="cs-meta-item">
                <h5>Year</h5>
                <p id="cs-meta-year">{data.year || "2024 - 2025"}</p>
              </div>
            </div>

            <div className="cs-share-bar">
              <span className="cs-share-label">Share Project:</span>
              <button
                type="button"
                className="cs-share-btn"
                title="Copy Link"
                style={copied ? { background: "#4ab96c" } : undefined}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
              >
                <i className={copied ? "ri-check-line" : "ri-file-copy-line"}></i>
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-share-btn"
                title="Share on WhatsApp"
                onClick={() => trackWhatsAppClick("case_study_share_whatsapp")}
              >
                <i className="ri-whatsapp-line"></i>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-share-btn"
                title="Share on LinkedIn"
              >
                <i className="ri-linkedin-fill"></i>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-share-btn"
                title="Share on X"
              >
                <i className="ri-twitter-x-line"></i>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: ABOUT THE BRAND */}
      {vis.brand_story !== false && (
        <section className="cs-section cs-reveal active">
          <div className="cs-container">
            <div className="cs-section-header">
              <span className="cs-section-subtitle">BACKGROUND &amp; OBJECTIVES</span>
              <h2 className="cs-section-title">About The Brand</h2>
            </div>
            <div className="cs-about-grid">
              <div className="cs-card">
                <h3>Brand Story &amp; Background</h3>
                <p id="cs-brand-story">
                  {data.brandStory ||
                    data.fullDescription ||
                    "Detailed company description and brand background story."}
                </p>
              </div>
              <div className="cs-card">
                <h3>Business Goals &amp; Objectives</h3>
                <p id="cs-brand-goals" style={{ whiteSpace: "pre-line" }}>
                  {[data.brandGoals, data.projectObjective].filter(Boolean).join("\n\n") ||
                    "Business goals and strategic project objectives."}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: SERVICES PROVIDED */}
      {vis.services !== false && Array.isArray(data.services) && data.services.length > 0 && (
        <section className="cs-section cs-reveal active">
          <div className="cs-container">
            <div className="cs-section-header">
              <span className="cs-section-subtitle">CAPABILITIES</span>
              <h2 className="cs-section-title">Services Provided</h2>
            </div>
            <div id="cs-services-list" className="cs-services-flex">
              {data.services.map((svc, idx) => (
                <span key={idx} className="cs-service-tag">
                  {svc}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: PROJECT OVERVIEW */}
      {vis.project_overview !== false && data.overview && (
        <section className="cs-section cs-reveal active">
          <div className="cs-container">
            <div className="cs-section-header">
              <span className="cs-section-subtitle">APPROACH &amp; EXECUTION</span>
              <h2 className="cs-section-title">Project Overview</h2>
            </div>
            <div className="cs-overview-grid">
              <div className="cs-overview-card">
                <span className="cs-overview-num">01</span>
                <h4>Challenge</h4>
                <p>{data.overview.challenge || "Key challenges faced prior to execution."}</p>
              </div>
              <div className="cs-overview-card">
                <span className="cs-overview-num">02</span>
                <h4>Strategy</h4>
                <p>{data.overview.strategy || "Tailored strategy developed by Betroverse."}</p>
              </div>
              <div className="cs-overview-card">
                <span className="cs-overview-num">03</span>
                <h4>Solution</h4>
                <p>{data.overview.solution || "Creative solutions and digital execution."}</p>
              </div>
              <div className="cs-overview-card">
                <span className="cs-overview-num">04</span>
                <h4>Execution</h4>
                <p>{data.overview.execution || "Production execution and distribution."}</p>
              </div>
              <div className="cs-overview-card">
                <span className="cs-overview-num">05</span>
                <h4>Results</h4>
                <p>{data.overview.results || "Key outcomes and performance milestones."}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: CREATIVE SHOWCASE */}
      {vis.creative_showcase !== false && showcaseMedia.length > 0 && (
        <section className="cs-section cs-reveal active">
          <div className="cs-container">
            <div className="cs-section-header">
              <span className="cs-section-subtitle">VISUAL ASSETS</span>
              <h2 className="cs-section-title">Creative Showcase</h2>
            </div>
            <div className="cs-showcase-grid cs-editorial-collage-wrapper">
              <div className="cs-editorial-collage" data-count={showcaseMedia.length}>
                {showcaseMedia.map((item, idx) => {
                  const rot = rotations[idx % rotations.length];
                  const z = zIndexes[idx % zIndexes.length];
                  const spanClass =
                    showcaseMedia.length > 3 ? spanClasses[idx % spanClasses.length] : "";
                  const ann = annotationsList[idx];
                  const annPos =
                    idx === 0
                      ? "top-left"
                      : idx === 1
                      ? "top-right"
                      : idx === 2
                      ? "bottom-left"
                      : idx === 3
                      ? "bottom-right"
                      : "";

                  return (
                    <div
                      key={item.id}
                      className={`cs-collage-card cs-collage-item-${idx + 1} ${spanClass}`}
                      style={{ "--rot": `${rot}deg`, "--z": z, cursor: "pointer" }}
                      role="button"
                      tabIndex={0}
                      onClick={() => setLightboxIdx(idx)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setLightboxIdx(idx);
                        }
                      }}
                    >
                      {ann && annPos && (
                        <span className={`cs-collage-annotation ${annPos}`}>{ann}</span>
                      )}
                      <div className="cs-collage-frame">
                        <img
                          src={item.url}
                          alt={item.title}
                          loading={idx === 0 ? "eager" : "lazy"}
                          decoding="async"
                        />
                        <div className="cs-collage-overlay">
                          <i className="ri-fullscreen-line"></i>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6: VIDEO SHOWCASE */}
      {vis.video_showcase !== false && activeVideos.length > 0 && (
        <section className="cs-section cs-reveal active">
          <div className="cs-container">
            <div className="cs-section-header">
              <span className="cs-section-subtitle">MOTION &amp; FILM</span>
              <h2 className="cs-section-title">Video Showcase</h2>
            </div>
            <div className="cs-video-grid">
              {activeVideos.map((vid, idx) => {
                const isEmbed =
                  vid.url.includes("youtube.com") ||
                  vid.url.includes("vimeo.com") ||
                  vid.url.includes("embed");
                const spanCol =
                  activeVideos.length === 1
                    ? "span 12"
                    : activeVideos.length === 2
                    ? "span 6"
                    : "span 4";
                return (
                  <div
                    key={idx}
                    className="cs-video-card-item"
                    style={{
                      gridColumn: spanCol,
                      borderRadius: "20px",
                      overflow: "hidden",
                      background: "rgba(12, 15, 23, 0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      aspectRatio: "16/9",
                    }}
                  >
                    {isEmbed ? (
                      <iframe
                        src={vid.url}
                        title={vid.title}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          borderRadius: "20px",
                        }}
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={vid.url}
                        controls
                        preload="metadata"
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "20px",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 7: WEBSITE SHOWCASE */}
      {vis.website_mockups !== false && data.media?.mockups && (
        <section className="cs-section cs-reveal active">
          <div className="cs-container">
            <div className="cs-section-header">
              <span className="cs-section-subtitle">DIGITAL EXPERIENCE</span>
              <h2 className="cs-section-title">Website Showcase</h2>
            </div>
            <div className="cs-device-mockups">
              <div className="cs-mockup-item">
                <div className="cs-device-bar">
                  <span className="cs-dot"></span>
                  <span className="cs-dot"></span>
                  <span className="cs-dot"></span>
                </div>
                <div className="cs-mockup-screen" style={{ border: "none" }}>
                  <img
                    src={resolveUrl(data.media.mockups.desktop)}
                    alt="Desktop Mockup"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                <div className="cs-mockup-item">
                  <div
                    className="cs-mockup-screen"
                    style={{ minHeight: "220px", border: "none" }}
                  >
                    <img
                      src={resolveUrl(
                        data.media.mockups.tablet || data.media.mockups.desktop
                      )}
                      alt="Tablet Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                  </div>
                </div>
                <div className="cs-mockup-item">
                  <div
                    className="cs-mockup-screen"
                    style={{ minHeight: "220px", border: "none" }}
                  >
                    <img
                      src={resolveUrl(
                        data.media.mockups.mobile || data.media.mockups.desktop
                      )}
                      alt="Mobile Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 8: RESULTS */}
      {vis.results_impact !== false && data.results && (
        <section className="cs-section cs-reveal active">
          <div className="cs-container">
            <div className="cs-section-header">
              <span className="cs-section-subtitle">PERFORMANCE &amp; METRICS</span>
              <h2 className="cs-section-title">Results &amp; Impact</h2>
            </div>

            <div className="cs-stats-grid">
              <div className="cs-stat-card">
                <div className="cs-stat-number">{data.results.stat1Num || "+500K"}</div>
                <div className="cs-stat-label">
                  {data.results.stat1Label || "Total Impressions"}
                </div>
              </div>
              <div className="cs-stat-card">
                <div className="cs-stat-number">{data.results.stat2Num || "+45%"}</div>
                <div className="cs-stat-label">
                  {data.results.stat2Label || "Engagement Growth"}
                </div>
              </div>
              <div className="cs-stat-card">
                <div className="cs-stat-number">{data.results.stat3Num || "3.5x"}</div>
                <div className="cs-stat-label">
                  {data.results.stat3Label || "ROI Increase"}
                </div>
              </div>
              <div className="cs-stat-card">
                <div className="cs-stat-number">{data.results.stat4Num || "100%"}</div>
                <div className="cs-stat-label">
                  {data.results.stat4Label || "Client Satisfaction"}
                </div>
              </div>
            </div>

            <div className="cs-feedback-card">
              <div className="cs-quote-icon">
                <i className="ri-double-quotes-l"></i>
              </div>
              <p id="cs-feedback-text" className="cs-feedback-text">
                &ldquo;
                {data.results.feedbackQuote ||
                  "Working with Betroverse transformed our digital presence. Their creative video production and brand strategy delivered measurable business growth!"}
                &rdquo;
              </p>
              <div id="cs-feedback-author" className="cs-feedback-author">
                {data.results.feedbackAuthor || "Client Leadership Team"}
              </div>
              <div id="cs-feedback-role" className="cs-feedback-role">
                {data.results.feedbackRole || "Founders & Marketing Directors"}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RELATED PROJECTS */}
      {relatedProjects.length > 0 && (
        <section className="cs-section cs-related-section cs-reveal active">
          <div className="cs-container">
            <div className="cs-section-header" style={{ marginBottom: "2rem" }}>
              <span className="cs-section-subtitle">EXPLORE MORE WORK</span>
              <h2 className="cs-section-title">Related Projects</h2>
            </div>
            <div className="cs-related-grid">
              {relatedProjects.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/portfolio/${(rp.slug || rp.id).toLowerCase()}`}
                  className="cs-related-card"
                >
                  <div
                    className="cs-related-thumb"
                    style={{
                      backgroundImage: `url('${resolveUrl(rp.heroImage || "/images/p1.jpg")}')`,
                    }}
                  ></div>
                  <div className="cs-related-body">
                    <span className="cs-related-cat">
                      {rp.category || "Creative Branding"}
                    </span>
                    <h3 className="cs-related-title">{rp.companyName}</h3>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        lineHeight: 1.6,
                        marginTop: "auto",
                      }}
                    >
                      {rp.shortIntro || rp.industry || "Case study overview"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PREVIOUS / NEXT PROJECT NAV */}
      <section className="cs-section cs-project-nav-section cs-reveal active" style={{ borderBottom: "none" }}>
        <div className="cs-container">
          <div className="cs-project-nav">
            {prevStudy ? (
              <Link
                href={`/portfolio/${(prevStudy.slug || prevStudy.id).toLowerCase()}`}
                className="cs-nav-card cs-nav-prev"
              >
                <div className="cs-nav-dir">
                  <i className="ri-arrow-left-line"></i> Previous Project
                </div>
                <div className="cs-nav-title">{prevStudy.companyName}</div>
              </Link>
            ) : (
              <div
                className="cs-nav-card cs-nav-prev cs-nav-disabled"
                style={{ visibility: "hidden", pointerEvents: "none" }}
                aria-hidden="true"
              >
                <div className="cs-nav-dir">
                  <i className="ri-arrow-left-line"></i> Previous Project
                </div>
                <div className="cs-nav-title">No Previous Project</div>
              </div>
            )}

            {nextStudy ? (
              <Link
                href={`/portfolio/${(nextStudy.slug || nextStudy.id).toLowerCase()}`}
                className="cs-nav-card cs-nav-next"
                style={{ textAlign: "right" }}
              >
                <div className="cs-nav-dir">
                  Next Project <i className="ri-arrow-right-line"></i>
                </div>
                <div className="cs-nav-title">{nextStudy.companyName}</div>
              </Link>
            ) : (
              <Link
                href="/portfolio"
                className="cs-nav-card cs-nav-next"
                style={{ textAlign: "right" }}
              >
                <div className="cs-nav-dir">
                  View Portfolio <i className="ri-arrow-right-line"></i>
                </div>
                <div className="cs-nav-title">Explore All Projects</div>
              </Link>
            )}
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
              <li>
                <Link href="/#contact" onClick={() => trackContactClick("case_study_footer")}>
                  Contact
                </Link>
              </li>
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

      {/* LIGHTBOX MODAL */}
      {lightboxIdx !== null && showcaseMedia[lightboxIdx] && (
        <div
          id="cs-lightbox-modal"
          className="cs-lightbox-overlay active"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5, 8, 15, 0.94)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
          onClick={() => setLightboxIdx(null)}
        >
          <button
            type="button"
            aria-label="Close lightbox"
            onClick={() => setLightboxIdx(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "28px",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            <i className="ri-close-line"></i>
          </button>

          {showcaseMedia.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((prev) =>
                  prev > 0 ? prev - 1 : showcaseMedia.length - 1
                );
              }}
              style={{
                position: "absolute",
                left: "20px",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              <i className="ri-arrow-left-s-line"></i>
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "85vh", textAlign: "center" }}
          >
            <img
              src={showcaseMedia[lightboxIdx].url}
              alt={showcaseMedia[lightboxIdx].title}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: "12px",
                objectFit: "contain",
              }}
            />
            <p style={{ color: "#e2e8f0", marginTop: "12px", fontSize: "0.95rem" }}>
              {showcaseMedia[lightboxIdx].title}
            </p>
          </div>

          {showcaseMedia.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((prev) =>
                  prev < showcaseMedia.length - 1 ? prev + 1 : 0
                );
              }}
              style={{
                position: "absolute",
                right: "20px",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              <i className="ri-arrow-right-s-line"></i>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
