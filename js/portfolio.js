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

  // Default verified portfolio case studies (fallback for offline and instant cold-start)
  const defaultPortfolioCaseStudies = [
    {
      id: "cs-mylaban", slug: "mylaban", status: "published", sort_order: 0, sortOrder: 0, display_order: 0, displayOrder: 0,
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
      id: "cs-sa-adiya", slug: "sa-adiya", status: "published", sort_order: 1, sortOrder: 1, display_order: 1, displayOrder: 1,
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
      id: "cs-toi-cafe", slug: "toi-cafe", status: "published", sort_order: 2, sortOrder: 2, display_order: 2, displayOrder: 2,
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
      id: "cs-ph-mobiles", slug: "ph-mobiles", status: "published", sort_order: 3, sortOrder: 3, display_order: 3, displayOrder: 3,
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
      id: "cs-mylaban-dessert", slug: "mylaban-dessert-shop", status: "published", sort_order: 4, sortOrder: 4, display_order: 4, displayOrder: 4,
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
      id: "cs-toi-cafe-photo", slug: "toi-cafe-photography", status: "published", sort_order: 5, sortOrder: 5, display_order: 5, displayOrder: 5,
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
      id: "cs-gurumitra", slug: "gurumitra-foundation", status: "published", sort_order: 6, sortOrder: 6, display_order: 6, displayOrder: 6,
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
      id: "cs-nice-mobiles", slug: "nice-mobiles", status: "published", sort_order: 7, sortOrder: 7, display_order: 7, displayOrder: 7,
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
      id: "cs-mylaban-identity", slug: "mylaban-brand-identity", status: "published", sort_order: 8, sortOrder: 8, display_order: 8, displayOrder: 8,
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
      id: "cs-nahdi-mandi", slug: "nahdi-mandi", status: "published", sort_order: 9, sortOrder: 9, display_order: 9, displayOrder: 9,
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
      id: "cs-celes", slug: "celes-lifestyle", status: "published", sort_order: 10, sortOrder: 10, display_order: 10, displayOrder: 10,
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
      id: "cs-toi-cafe-aesthetics", slug: "toi-cafe-aesthetics", status: "published", sort_order: 11, sortOrder: 11, display_order: 11, displayOrder: 11,
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
      id: "cs-nice-mobiles-retail", slug: "nice-mobiles-retail", status: "published", sort_order: 12, sortOrder: 12, display_order: 12, displayOrder: 12,
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
      id: "cs-nahdi-mandi-rest", slug: "nahdi-mandi-restaurant", status: "published", sort_order: 13, sortOrder: 13, display_order: 13, displayOrder: 13,
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
      id: "cs-celes-brand", slug: "celes-lifestyle-brand", status: "published", sort_order: 14, sortOrder: 14, display_order: 14, displayOrder: 14,
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
      id: "cs-independent", slug: "independent", status: "published", sort_order: 15, sortOrder: 15, display_order: 15, displayOrder: 15,
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
      const raw = localStorage.getItem("betro_casestudies") || localStorage.getItem("betro_casestudies_cache");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) { }
      }
      return defaultPortfolioCaseStudies;
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
    if (!projects || projects.length === 0) {
      mapAndSetStudies(defaultPortfolioCaseStudies);
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

