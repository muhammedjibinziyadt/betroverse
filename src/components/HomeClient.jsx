"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {
  trackContactClick,
  trackEmailClick,
  trackEnquirySubmit,
  trackWhatsAppClick,
} from "@/lib/gtag";

export default function HomeClient({ initialBrands = [] }) {
  const router = useRouter();
  const [brands, setBrands] = useState(
    initialBrands.filter((b) => b.visible !== false)
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [preloaderHidden, setPreloaderHidden] = useState(true);
  const [activeNav, setActiveNav] = useState("#home");

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Subscribe Form State
  const [subscribeEmail, setSubscribeEmail] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setPreloaderHidden(true), 80);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Refresh brands from MongoDB API to ensure latest order/visibility
    fetch("/api/brands")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.brands) && data.brands.length > 0) {
          setBrands(data.brands.filter((b) => b.visible !== false));
        }
      })
      .catch(() => { });

    // ScrollSpy observer
    const sections = document.querySelectorAll("section[id], header[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id && id !== "subscribe") {
              setActiveNav(`#${id}`);
            }
          }
        });
      },
      { root: null, rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));

    // BroadcastChannel sync
    let channel = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel("betro_portfolio_sync");
        channel.onmessage = (msg) => {
          if (
            msg?.data?.type === "brands_updated" ||
            msg?.data?.type === "brand_logos"
          ) {
            fetch("/api/brands")
              .then((r) => (r.ok ? r.json() : null))
              .then((data) => {
                if (data?.brands) {
                  setBrands(data.brands.filter((b) => b.visible !== false));
                }
              });
          }
        };
      } catch { }
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      if (channel) channel.close();
    };
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  const initScrollReveal = () => {
    if (typeof window !== "undefined" && typeof window.ScrollReveal !== "undefined") {
      const opt = {
        distance: "24px",
        origin: "bottom",
        duration: 700,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        viewFactor: 0.05,
        mobile: true,
      };
      const sr = window.ScrollReveal();
      sr.reveal("header.section__container h1", { ...opt, delay: 200, origin: "bottom" });
      sr.reveal(".header__container h2", { ...opt, delay: 100, origin: "top" });
      sr.reveal(".header__container p", { ...opt, delay: 250, origin: "bottom" });
      sr.reveal(".header__btns", { ...opt, delay: 300 });
      sr.reveal(".about_left", { ...opt, delay: 150 });
      sr.reveal(".about_right ul li", { ...opt, interval: 80 });
      sr.reveal(".room__card", { ...opt, interval: 80, delay: 100 });
      sr.reveal(".process__card", { ...opt, interval: 80, delay: 100 });
      sr.reveal(".subscribe__content", { ...opt, delay: 150 });
      sr.reveal(".container .content3", { ...opt, delay: 150 });
    }
  };

  const handleHomeContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    const nameParts = contactName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ");

    try {
      // Save to MongoDB via Next.js API
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: contactEmail.trim(),
          phone: "",
          service: "General Inquiry",
          message: contactMessage.trim(),
        }),
      });
      if (res.ok) {
        trackEnquirySubmit("home_contact_form", "General Inquiry");
      }

      // Also forward to Google Apps Script (matching legacy behavior)
      const params = new URLSearchParams();
      params.append("First name", firstName);
      params.append("Last name", lastName || "");
      params.append("email", contactEmail.trim());
      params.append("phone", "");
      params.append("service", "General Inquiry");
      fetch(
        "https://script.google.com/macros/s/AKfycbz-YUhYE2JkkqDzCeNjkPikgvSRhwuxOz3PR_FHk-d1Zab_ki5Jnd6C2pIjRfwLOGSN/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        }
      ).catch(() => { });

      alert("Thank you! Your message has been sent successfully.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      alert("Failed to send message: " + (err.message || err));
    } finally {
      setSending(false);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    trackContactClick("subscribe_banner_cta");
    router.push(`/contact?email=${encodeURIComponent(subscribeEmail)}`);
  };

  return (
    <>
      <Script
        src="https://unpkg.com/scrollreveal"
        strategy="afterInteractive"
        onLoad={initScrollReveal}
      />

      {/* PRELOADER */}
      <div id="preloader" className={preloaderHidden ? "hide" : ""}>
        <div className="loader"></div>
      </div>

      {/* HEADER */}
      <header className={`site-header${scrolled ? " scrolled" : ""}`}>
        <div className="header-container">
          <div className="logo-container">
            <a href="#home" className="logo-link">
              <img
                src="/images/logo.png"
                alt="Betroverse Logo"
                className="logo-img"
                width="160"
                height="40"
                fetchPriority="high"
              />
            </a>
          </div>

          <nav className="desktop-nav" aria-label="Main Navigation">
            <ul className="nav-menu">
              <li>
                <a href="#home" className={`nav-item${activeNav === "#home" ? " active" : ""}`}>
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className={`nav-item${activeNav === "#about" ? " active" : ""}`}>
                  About
                </a>
              </li>
              <li>
                <a href="#services" className={`nav-item${activeNav === "#services" ? " active" : ""}`}>
                  Services
                </a>
              </li>
              <li>
                <Link href="/portfolio" className="nav-item">
                  Portfolio
                </Link>
              </li>
              <li>
                <a href="#process" className={`nav-item${activeNav === "#process" ? " active" : ""}`}>
                  Process
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className={`nav-item${activeNav === "#contact" ? " active" : ""}`}
                  onClick={() => trackContactClick("home_header_nav")}
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            <a
              href="https://wa.me/916282528914"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn"
              onClick={() => trackWhatsAppClick("home_header_get_started")}
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
            <li>
              <a
                href="#home"
                className={`mobile-nav-item${activeNav === "#home" ? " active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={`mobile-nav-item${activeNav === "#about" ? " active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#services"
                className={`mobile-nav-item${activeNav === "#services" ? " active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </a>
            </li>
            <li>
              <Link
                href="/portfolio"
                className="mobile-nav-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                Portfolio
              </Link>
            </li>
            <li>
              <a
                href="#process"
                className={`mobile-nav-item${activeNav === "#process" ? " active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Process
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className={`mobile-nav-item${activeNav === "#contact" ? " active" : ""}`}
                onClick={() => {
                  setMobileMenuOpen(false);
                  trackContactClick("home_mobile_nav");
                }}
              >
                Contact
              </a>
            </li>
          </ul>

          <div className="mobile-drawer-actions">
            <a
              href="https://wa.me/916282528914"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-cta-btn"
              onClick={() => trackWhatsAppClick("home_mobile_get_started")}
            >
              Get Started
              <i className="ri-arrow-right-line"></i>
            </a>
          </div>
        </div>

        <div
          className={`drawer-overlay${mobileMenuOpen ? " open" : ""}`}
          id="drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      </header>

      {/* HERO / HOME */}
      <header className="section__container header__container" id="home">
        <h2>
          <img className="bg0" src="/images/bag.png" alt="Bag" />
          Growing Brands Beyond Boundaries
        </h2>

        <h1 className="fancyPants">
          <span>Digital</span> Excellence
          <br />
          for <span>Every Business</span>
        </h1>

        <p>
          Our team blends creativity and technology to build impactful digital
          campaigns that take your brand beyond the competition.
        </p>

        <div className="header__btns">
          <a
            href="https://wa.me/916282528914"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta-btn"
            onClick={() => trackWhatsAppClick("home_hero_lets_talk")}
          >
            <span>Let&apos;s Talk</span>
            <i className="ri-arrow-right-line"></i>
          </a>
        </div>
      </header>

      {/* ABOUT */}
      <section id="about">
        <div className="about_container">
          <div className="about_items">
            <div className="about_left">
              <h4>Something About Us</h4>
              <h3>
                We made a Promise
                <span>Increasing</span>
                your Business&apos;s Ability to
                <span>Succeed</span>
              </h3>
              <p className="about_intro_desc">
                Started with a vision to make marketing simple and effective, today
                we serve businesses across industries with customized solutions that
                deliver measurable results.
              </p>
            </div>

            <div className="about_right">
              <ul>
                <li>
                  <div className="left">
                    <img src="/images/pen-tool.png" alt="Our Story" className="icon" />
                  </div>
                  <div className="right">
                    <h5>Our Story</h5>
                    <p>
                      Started with a vision to make marketing simple and effective,
                      today we serve businesses across industries with customized
                      solutions.
                    </p>
                  </div>
                </li>

                <li>
                  <div className="left">
                    <img src="/images/inspiration.png" alt="Mission" className="icon" />
                  </div>
                  <div className="right">
                    <h5>Mission</h5>
                    <p>
                      To empower brands with high-quality digital strategies that
                      deliver measurable results.
                    </p>
                  </div>
                </li>

                <li>
                  <div className="left">
                    <img src="/images/plan.png" alt="Vision" className="icon" />
                  </div>
                  <div className="right">
                    <h5>Vision</h5>
                    <p>
                      To be a global leader in digital marketing solutions,
                      transforming businesses into digital success stories.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <section className="section__container3 room__container">
          <h3>Comprehensive solutions designed to tackle any business hurdle</h3>

          <div className="room__grid">
            <div className="room__card">
              <div className="room__card__image">
                <img src="/images/personal-branding.png" alt="Personal Branding" />
                <div className="room__card__icons"></div>
              </div>
              <div className="room__card__details">
                <h4>Personal Branding</h4>
                <p>
                  Build a powerful personal identity through strategic branding,
                  professional content creation and digital storytelling that helps
                  individuals establish credibility and connect with their audience.
                </p>
              </div>
            </div>

            <div className="room__card">
              <div className="room__card__image">
                <img src="/images/socialm.png" alt="Social Media" />
                <div className="room__card__icons"></div>
              </div>
              <div className="room__card__details">
                <h4>Social Media</h4>
                <p>
                  Complete social media management, creative content development and
                  strategic campaigns designed to increase engagement, grow your
                  audience and strengthen your online presence.
                </p>
              </div>
            </div>

            <div className="room__card">
              <div className="room__card__image">
                <img src="/images/marketting.png" alt="Performance Marketing" />
                <div className="room__card__icons"></div>
              </div>
              <div className="room__card__details">
                <h4>Performance Marketing</h4>
                <p>
                  Data-driven advertising campaigns and targeted marketing
                  strategies designed to generate quality leads, increase
                  conversions and maximise business growth.
                </p>
              </div>
            </div>

            <div className="room__card">
              <div className="room__card__image">
                <img src="/images/graphic.png" alt="Logo Branding" />
                <div className="room__card__icons"></div>
              </div>
              <div className="room__card__details">
                <h4>Logo Branding</h4>
                <p>
                  Professional logo design and complete visual identity solutions
                  that communicate your brand&apos;s personality and create a
                  memorable impression.
                </p>
              </div>
            </div>

            <div className="room__card">
              <div className="room__card__image">
                <img src="/images/web-app-dev.png" alt="Web & App Development" />
                <div className="room__card__icons"></div>
              </div>
              <div className="room__card__details">
                <h4>Web &amp; App Development</h4>
                <p>
                  Modern, responsive website and application development solutions
                  designed to improve user experience, strengthen your digital
                  presence and support business growth.
                </p>
              </div>
            </div>

            <div className="room__card">
              <div className="room__card__image">
                <img src="/images/ai-reels.png" alt="AI Reels" />
                <div className="room__card__icons"></div>
              </div>
              <div className="room__card__details">
                <h4>AI Reels</h4>
                <p>
                  Creative AI-powered reels, engaging short-form videos and
                  innovative visual storytelling designed to capture attention and
                  promote your brand across digital platforms.
                </p>
              </div>
            </div>

            <div className="room__card">
              <div className="room__card__image">
                <img src="/images/influencer-marketing.png" alt="Influencer Marketing" />
                <div className="room__card__icons"></div>
              </div>
              <div className="room__card__details">
                <h4>Influencer Marketing</h4>
                <p>
                  Strategic influencer collaborations and creator-led campaigns that
                  expand brand awareness, build audience trust and increase customer
                  engagement.
                </p>
              </div>
            </div>

            <div className="room__card">
              <div className="room__card__image">
                <img src="/images/brandv.png" alt="Brand Promotional Videos" />
                <div className="room__card__icons"></div>
              </div>
              <div className="room__card__details">
                <h4>Brand Promotional Videos</h4>
                <p>
                  Engaging promotional videos that highlight your brand, products,
                  or campaigns — designed to grab attention and drive conversions.
                </p>
              </div>
            </div>

            <div className="room__card">
              <div className="room__card__image">
                <img src="/images/prodect.png" alt="Product Shoot Videos" />
                <div className="room__card__icons"></div>
              </div>
              <div className="room__card__details">
                <h4>Product Shoot Videos</h4>
                <p>
                  High-quality product videos that focus on details, features, and
                  benefits, helping customers understand and connect with your
                  products.
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>

      {/* BRANDS WHO BELIEVE IN US */}
      <section id="brands-section" className="portfolio-brands-section">
        <div className="portfolio-brands-container">
          <div className="top_clint">
            <h5>
              Brands Who <span>Believe</span> in Us
            </h5>
          </div>
          <div className="brands-marquee-container">
            <div className="brands-marquee-track" id="brands-marquee-track">
              {brands.map((b) => {
                const imgSrc =
                  b.src && !b.src.startsWith("/") && !b.src.startsWith("http")
                    ? `/${b.src}`
                    : b.src;
                const companySlug = b.companyId || b.company_id || "independent";
                return (
                  <div
                    key={b.id}
                    className="brand-marquee-item"
                    data-brand-id={b.id}
                    onClick={() => router.push(`/portfolio/${companySlug}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={imgSrc}
                      alt={b.name || b.companyName || "Brand Logo"}
                      className="brand-logo-img"
                      style={
                        b.style && b.style.includes("40%")
                          ? { width: "40%" }
                          : undefined
                      }
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process">
        <h6
          className="section__header"
          style={{
            fontSize: "1rem",
            color: "var(--primary-color)",
            textTransform: "uppercase",
            letterSpacing: "2px",
            marginBottom: "0.5rem",
          }}
        >
          Our Process
        </h6>

        <h3 className="section__header">
          How We Deliver <span>Digital Excellence</span>
        </h3>

        <div className="process__grid">
          <div className="process__card">
            <div className="process__num">01</div>
            <div className="process__icon">
              <i className="ri-search-eye-line"></i>
            </div>
            <h4>Discovery &amp; Strategy</h4>
            <p>
              We dive deep into your brand, analyze competitors, and outline a
              customized digital growth roadmap.
            </p>
          </div>

          <div className="process__card">
            <div className="process__num">02</div>
            <div className="process__icon">
              <i className="ri-video-line"></i>
            </div>
            <h4>Creative Production</h4>
            <p>
              Our expert team scripts, films, and edits content that translates your
              message into visual stories.
            </p>
          </div>

          <div className="process__card">
            <div className="process__num">03</div>
            <div className="process__icon">
              <i className="ri-rocket-line"></i>
            </div>
            <h4>Launch &amp; Distribute</h4>
            <p>
              We launch optimized campaigns across targeted channels to drive maximum
              reach and engagement.
            </p>
          </div>

          <div className="process__card">
            <div className="process__num">04</div>
            <div className="process__icon">
              <i className="ri-bar-chart-box-line"></i>
            </div>
            <h4>Analyze &amp; Scale</h4>
            <p>
              We review daily metrics, refine details, and scale successful tactics
              to double down on your ROI.
            </p>
          </div>
        </div>
      </section>

      {/* SUBSCRIBE */}
      <section className="section__container6 subscribe__container" id="subscribe">
        <div className="subscribe__content">
          <h2 className="section__header">Register Now to Access Our Services</h2>

          <form onSubmit={handleSubscribe}>
            <input
              type="email"
              name="email"
              placeholder="Enter your email here..."
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              required
            />

            <button className="btn" type="submit">
              Continue
              <span>
                <i className="ri-arrow-right-long-line"></i>
              </span>
            </button>
          </form>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <div className="container">
          <div className="content3">
            <div className="left-side">
              <div className="address details">
                <i className="fas fa-map-marker-alt"></i>
                <div className="topic">Address</div>
                <div className="text-one">Calicut</div>
              </div>

              <div className="phone details">
                <i className="fas fa-phone-alt"></i>
                <div className="topic">Phone</div>
                <div className="text-one">+918590417077</div>
              </div>

              <a
                href="mailto:Betroverse@gmail.com"
                className="email details"
                onClick={() => trackEmailClick("home_contact_section")}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <i className="fas fa-envelope"></i>
                <div className="topic">Email</div>
                <div className="text-one">Betroverse@gmail.com</div>
              </a>
            </div>

            <div className="right-side">
              <div className="topic-text">Send us a message</div>

              <form id="home-contact-form" onSubmit={handleHomeContactSubmit}>
                <div className="input-box">
                  <input
                    type="text"
                    id="home-contact-name"
                    name="name"
                    placeholder="Enter your name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-box">
                  <input
                    type="email"
                    id="home-contact-email"
                    name="email"
                    placeholder="Enter your email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-box message-box">
                  <textarea
                    id="home-contact-message"
                    name="message"
                    placeholder="Enter your message"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn"
                  disabled={sending}
                  style={{
                    width: "100%",
                    borderRadius: "5px",
                    padding: "1rem 2rem",
                    cursor: "pointer",
                  }}
                >
                  {sending ? "Sending..." : "Send Now"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="section__container7 footer__container">
          <div className="footer__col">
            <div className="footer__logo">
              <a href="#home">Betroverse</a>
            </div>

            <ul className="footer__socials">
              <li>
                <a href="#" aria-label="Facebook">
                  <i className="ri-facebook-fill"></i>
                </a>
              </li>
              <li>
                <a href="#" aria-label="Twitter">
                  <i className="ri-twitter-fill"></i>
                </a>
              </li>
              <li>
                <a href="#" aria-label="Instagram">
                  <i className="ri-instagram-line"></i>
                </a>
              </li>
              <li>
                <a href="#" aria-label="Behance">
                  <i className="ri-behance-fill"></i>
                </a>
              </li>
              <li>
                <a href="#" aria-label="Dribbble">
                  <i className="ri-dribbble-fill"></i>
                </a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>Quick Links</h4>
            <ul className="footer__links">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#services">Services</a></li>
              <li><Link href="/portfolio">Portfolio</Link></li>
              <li><a href="#process">Process</a></li>
              <li>
                <a href="#contact" onClick={() => trackContactClick("home_footer_contact")}>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>Support</h4>
            <ul className="footer__links">
              <li>
                <a href="#contact" onClick={() => trackContactClick("home_footer_help_center")}>
                  Help Center
                </a>
              </li>
              <li><a href="#">Privacy Policy</a></li>
              <li>
                <a href="#contact" onClick={() => trackContactClick("home_footer_report_issue")}>
                  Report an Issue
                </a>
              </li>
              <li>
                <a href="#contact" onClick={() => trackContactClick("home_footer_get_quote")}>
                  Get a Quote
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bar">
          Copyright © 2027 Betroverse. All rights reserved.
        </div>
      </footer>
    </>
  );
}
