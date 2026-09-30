/* ==========================================================================
   Betroverse - Dynamic Case Study Renderer Engine
   ========================================================================== */

(function () {
  // Default CMS Seed Data for Case Studies (All 16 Portfolio Projects)
  const defaultCaseStudies = [
    {
      id: "cs-mylaban",
      slug: "mylaban",
      status: "published",
      companyName: "MyLaban",
      companyLogo: "images/Picsart_25-09-24_21-31-47-226.png",
      heroImage: "images/p1.jpg",
      cardImage: "images/p1.jpg",
      category: "Creative Branding & Social Campaign",
      industry: "Food & Beverage Dessert Lounge",
      clientName: "MyLaban Dessert Shop",
      year: "2024 - 2025",
      shortIntro: "Specialty dessert shop branding and high-converting social media marketing campaign in Kochi.",
      fullDescription: "MyLaban is a popular dessert shop in Kochi specializing in authentic Egyptian desserts and premium sweet treats. The brand is known for its rich flavors, high-quality ingredients, and beautifully crafted desserts that offer a unique experience for every customer.",
      brandStory: "Started with a passion for authentic Middle Eastern sweet delicacies, MyLaban brought traditional Egyptian dessert recipes to Kochi with a modern culinary twist. The brand needed visual storytelling that reflected its premium ingredients and signature presentation.",
      brandGoals: "Expand brand reach across Kerala, drive store footfall to the Kochi dessert lounge, and establish a viral short-form video presence across Instagram Reels and TikTok.",
      projectObjective: "Craft a comprehensive brand identity, mouth-watering food photography, viral AI video reels, and aesthetic social media campaigns to maximize engagement.",
      services: ["Creative Design", "Social Media Management", "Video Production", "AI Video Creation", "Video Content Creation", "Brand Identity", "Photography"],
      overview: {
        challenge: "Differentiating MyLaban in a competitive food scene by highlighting unique Egyptian dessert flavors.",
        strategy: "Developing viral short-form video reels, AI-enhanced food visuals, and aesthetic Instagram layouts.",
        solution: "Creating mouth-watering video content showcasing signature desserts and authentic preparation techniques.",
        execution: "Multichannel distribution across Instagram, YouTube Shorts, and local influencer campaigns.",
        results: "Over 500k video views and a significant surge in store footfall and brand engagement."
      },
      media: {
        gallery: ["images/p1.jpg", "images/p5.jpg", "images/s1.jpg", "images/p7.jpg", "images/s8.jpg"],
        videos: [],
        mockups: { desktop: "images/p1.jpg", tablet: "images/p5.jpg", mobile: "images/s1.jpg" }
      },
      results: {
        stat1Num: "+500K", stat1Label: "Social Reel Views",
        stat2Num: "+60%", stat2Label: "Footfall Growth",
        stat3Num: "4.2x", stat3Label: "ROI Increase",
        stat4Num: "100%", stat4Label: "Brand Satisfaction",
        feedbackQuote: "Betroverse completely transformed our video marketing. Their reels and short-form content brought us viral traction and customer engagement!",
        feedbackAuthor: "MyLaban Founder", feedbackRole: "Kochi Dessert Lounge"
      },
      seo: {
        title: "MyLaban Case Study | Creative Branding & Video Production by Betroverse",
        description: "Explore how Betroverse built viral video campaigns, brand strategy, and social media growth for MyLaban Dessert Shop.",
        keywords: "MyLaban, dessert branding, video production, Kochi marketing, Betroverse",
        ogImage: "images/p1.jpg", canonicalUrl: "https://betroverse.in/portfolio/mylaban"
      }
    },
    {
      id: "cs-sa-adiya",
      slug: "sa-adiya",
      status: "published",
      companyName: "Sa-Adiya Golden Jubilee",
      companyLogo: "images/golden.png",
      heroImage: "images/p2.jpg",
      cardImage: "images/p2.jpg",
      category: "Event Branding & Celebration Collateral",
      industry: "Event Branding & Academic Institutions",
      clientName: "Sa-Adiya Foundation",
      year: "2024 - 2025",
      shortIntro: "Flyers, registration guidelines, and social media announcements for Sa-Adiya's grand Golden Jubilee celebrations.",
      fullDescription: "We designed promotional flyers, registration guidelines, and social media announcements for Sa-Adiya's grand Golden Jubilee celebrations.",
      brandStory: "Celebrating 50 years of educational and community service with a landmark Jubilee convention.",
      brandGoals: "Unify event communication, guide registrations, and create memorable celebratory visuals.",
      projectObjective: "Deliver golden-themed stage graphics, registration notices, and commemorative flyers.",
      services: ["Creative Design", "Social Media Management", "Event Branding", "Print Collateral"],
      overview: {
        challenge: "Designing elegant, cohesive event branding suitable for a major 50-year celebration.",
        strategy: "Using golden thematic elements, clear typography, and structured announcement layouts.",
        solution: "Creating registration notices, event schedules, and ceremonial posters.",
        execution: "Multichannel distribution via social media platforms and print media flyers.",
        results: "Widespread community reach and successful event attendance across all sessions."
      },
      media: { gallery: ["images/p2.jpg", "images/p7.jpg", "images/s2.jpg", "images/s7.jpg"], videos: [], mockups: { desktop: "images/p2.jpg", tablet: "images/p2.jpg", mobile: "images/p2.jpg" } },
      results: {
        stat1Num: "+100K", stat1Label: "Event Reach",
        stat2Num: "50 Yrs", stat2Label: "Celebrated Legacy",
        stat3Num: "100%", stat3Label: "Participation",
        stat4Num: "100%", stat4Label: "Satisfaction",
        feedbackQuote: "The Golden Jubilee event banners and flyers designed by Betroverse added immense prestige to our 50-year celebrations.",
        feedbackAuthor: "Sa-Adiya Jubilee Committee", feedbackRole: "Educational Foundation"
      },
      seo: { title: "Sa-Adiya Golden Jubilee Case Study | Event Branding by Betroverse", description: "Explore Sa-Adiya's Golden Jubilee event branding, ceremonial flyers, and social media campaigns created by Betroverse.", keywords: "Sa-Adiya, Golden Jubilee, event branding, Betroverse", ogImage: "images/p2.jpg", canonicalUrl: "https://betroverse.in/portfolio/sa-adiya" }
    },
    {
      id: "cs-toi-cafe",
      slug: "toi-cafe",
      status: "published",
      companyName: "Toi Cafe",
      companyLogo: "images/toi.png",
      heroImage: "images/p3.jpg",
      cardImage: "images/p3.jpg",
      category: "Specialty Cafe & Visual Branding",
      industry: "Specialty Coffee & Desserts",
      clientName: "Toi Cafe & Dessert Lounge",
      year: "2024 - 2025",
      shortIntro: "Aesthetic social media campaign, specialty beverage photography, and custom menu layout design.",
      fullDescription: "Toi Cafe is a specialty coffee shop and dessert lounge. We designed a series of aesthetic social media posts, promotional campaigns, and menus to highlight their unique sweet and savory offerings.",
      brandStory: "Toi Cafe was founded to create a warm, aesthetic haven for specialty coffee enthusiasts. The brand needed creative collateral matching its serene ambiance.",
      brandGoals: "Increase weekend cafe traffic, promote signature cold brews, and establish a cohesive warm-toned visual theme online.",
      projectObjective: "Deliver high-end beverage photography, custom menu cards, and targeted social ad campaigns.",
      services: ["Creative Design", "Social Media Management", "Photography", "Menu Layout Design", "Branding"],
      overview: {
        challenge: "Positioning Toi Cafe as the top aesthetic coffee & dessert spot for youth and coffee lovers.",
        strategy: "High-end beverage photography, warm coffee tone palettes, and clean grid layouts.",
        solution: "Designing elegant menus and weekly social media highlights featuring signature brews.",
        execution: "Professional photo shoots and targeted digital ad campaigns.",
        results: "Substantial increase in cafe weekend visits and online social engagement."
      },
      media: { gallery: ["images/p3.jpg", "images/p6.jpg", "images/s4.jpg", "images/s3.jpg", "images/p8.jpg"], videos: [], mockups: { desktop: "images/p3.jpg", tablet: "images/p6.jpg", mobile: "images/s4.jpg" } },
      results: {
        stat1Num: "+350K", stat1Label: "Social Reach",
        stat2Num: "+50%", stat2Label: "Weekend Customer Increase",
        stat3Num: "3.0x", stat3Label: "ROI Impact",
        stat4Num: "100%", stat4Label: "Client Approval",
        feedbackQuote: "The aesthetic social media posts and menu layouts designed by Betroverse captured our cafe's vibe perfectly!",
        feedbackAuthor: "Toi Cafe Team", feedbackRole: "Specialty Cafe & Lounge"
      },
      seo: { title: "Toi Cafe Case Study | Specialty Coffee Branding by Betroverse", description: "Discover Toi Cafe's menu design, beverage photography, and aesthetic social media campaigns created by Betroverse.", keywords: "Toi Cafe, coffee branding, menu design, Betroverse", ogImage: "images/p3.jpg", canonicalUrl: "https://betroverse.in/portfolio/toi-cafe" }
    },
    {
      id: "cs-ph-mobiles",
      slug: "ph-mobiles",
      status: "published",
      companyName: "PH Mobiles",
      companyLogo: "images/NiceMobiles.png",
      heroImage: "images/p4.jpg",
      cardImage: "images/p4.jpg",
      category: "Retail Marketing & Visual Advertising",
      industry: "Smartphone & Electronics Retail",
      clientName: "PH Mobiles Retail",
      year: "2024 - 2025",
      shortIntro: "Product layouts, festival offer graphics, and visual flyers for smartphone retail campaigns.",
      fullDescription: "PH Mobiles is a trusted retail center for smartphones and home appliances. We developed their visual flyers, festival offer announcements, and product layouts.",
      brandStory: "Providing top-tier mobile phones and appliances with local trust and warranty support across retail stores.",
      brandGoals: "Boost holiday store walk-ins, promote trade-in deals, and launch high-impact retail banners.",
      projectObjective: "Create eye-catching retail offer graphics and digital marketing flyers for fast conversion.",
      services: ["Creative Design", "Social Media Management", "Promo Campaigns", "Print Layouts"],
      overview: {
        challenge: "Standing out in competitive smartphone retail markets during seasonal sales.",
        strategy: "Creating vibrant product graphics with clear pricing badges and instant call-to-actions.",
        solution: "Designing digital trade-in flyers and high-resolution festival offer banners.",
        execution: "Multichannel broadcast on social media and print distribution across retail outlets.",
        results: "Increased retail inquiries and store sales conversion during promo periods."
      },
      media: { gallery: ["images/p4.jpg", "images/s5.jpg", "images/s6.jpg", "images/p8.jpg"], videos: [], mockups: { desktop: "images/p4.jpg", tablet: "images/s5.jpg", mobile: "images/p4.jpg" } },
      results: {
        stat1Num: "+200K", stat1Label: "Ad Impressions",
        stat2Num: "+40%", stat2Label: "Store Inquiries",
        stat3Num: "2.8x", stat3Label: "Sales Boost",
        stat4Num: "100%", stat4Label: "Satisfaction",
        feedbackQuote: "Betroverse designed outstanding promotional graphics for our festival sales, significantly boosting store traffic!",
        feedbackAuthor: "PH Mobiles Leadership", feedbackRole: "Smartphone Retail Store"
      },
      seo: { title: "PH Mobiles Case Study | Retail Marketing by Betroverse", description: "See how Betroverse created smartphone promotion flyers and retail campaigns for PH Mobiles.", keywords: "PH Mobiles, retail marketing, smartphone flyers, Betroverse", ogImage: "images/p4.jpg", canonicalUrl: "https://betroverse.in/portfolio/ph-mobiles" }
    },
    {
      id: "cs-mylaban-dessert",
      slug: "mylaban-dessert-shop",
      status: "published",
      companyName: "MyLaban Dessert Shop",
      companyLogo: "images/Picsart_25-09-24_21-31-47-226.png",
      heroImage: "images/p5.jpg",
      cardImage: "images/p5.jpg",
      category: "Content Creation & Video Production",
      industry: "Dessert & Food Lounge",
      clientName: "MyLaban Desserts",
      year: "2024 - 2025",
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
      id: "cs-toi-cafe-photo",
      slug: "toi-cafe-photography",
      status: "published",
      companyName: "Toi Cafe Photography",
      companyLogo: "images/toi.png",
      heroImage: "images/p6.jpg",
      cardImage: "images/p6.jpg",
      category: "Photography & Social Ads",
      industry: "Cafe & Beverage",
      clientName: "Toi Cafe",
      year: "2024 - 2025",
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
      id: "cs-gurumitra",
      slug: "gurumitra-foundation",
      status: "published",
      companyName: "Gurumitra Foundation",
      companyLogo: "images/Gurumitra.png",
      heroImage: "images/p7.jpg",
      cardImage: "images/p7.jpg",
      category: "Educational Design & Print",
      industry: "Education & Non-Profit",
      clientName: "Gurumitra Foundation",
      year: "2024 - 2025",
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
      id: "cs-nice-mobiles",
      slug: "nice-mobiles",
      status: "published",
      companyName: "Nice Mobiles",
      companyLogo: "images/NiceMobiles.png",
      heroImage: "images/p8.jpg",
      cardImage: "images/p8.jpg",
      category: "Promo Campaigns & Retail Banners",
      industry: "Electronics Retail",
      clientName: "Nice Mobiles Retail",
      year: "2024 - 2025",
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
      id: "cs-mylaban-identity",
      slug: "mylaban-brand-identity",
      status: "published",
      companyName: "MyLaban Brand Identity",
      companyLogo: "images/Picsart_25-09-24_21-31-47-226.png",
      heroImage: "images/s1.jpg",
      cardImage: "images/s1.jpg",
      category: "AI Video Production",
      industry: "Food & Beverage",
      clientName: "MyLaban",
      year: "2024 - 2025",
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
      id: "cs-nahdi-mandi",
      slug: "nahdi-mandi",
      status: "published",
      companyName: "Nahdi Mandi",
      companyLogo: "images/Nahdimandi-white.png",
      heroImage: "images/s2.jpg",
      cardImage: "images/s2.jpg",
      category: "Social Media Ads & Branding",
      industry: "Traditional Dining & Mandi",
      clientName: "Nahdi Mandi Restaurant",
      year: "2024 - 2025",
      shortIntro: "Arabic dining flyers and promotional visual banners.",
      fullDescription: "Authentic Arabic restaurant branding and promotional campaign graphics.",
      brandStory: "Bringing genuine Mandi flavors to food enthusiasts with cultural aesthetic graphics.",
      brandGoals: "Boost dinner dining reservations and weekend orders.",
      services: ["Creative Design", "Social Media Management", "Branding"],
      overview: { challenge: "Promoting authentic Arabic dining experiences.", strategy: "Rich culinary photography.", solution: "Promotional dining banners.", execution: "Local targeted ads.", results: "Increased dining bookings." },
      media: { gallery: ["images/s2.jpg"], videos: [], mockups: { desktop: "images/s2.jpg", tablet: "images/s2.jpg", mobile: "images/s2.jpg" } },
      results: { stat1Num: "+300K", stat1Label: "Ad Reach", stat2Num: "+55%", stat2Label: "Table Reservations", stat3Num: "3.2x", stat3Label: "ROI", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "Nahdi Mandi Case Study", description: "Social media marketing and branding for Nahdi Mandi.", keywords: "Nahdi Mandi, dining ads", ogImage: "images/s2.jpg", canonicalUrl: "https://betroverse.in/portfolio/nahdi-mandi" }
    },
    {
      id: "cs-celes",
      slug: "celes-lifestyle",
      status: "published",
      companyName: "Celes Lifestyle",
      companyLogo: "images/celes.png",
      heroImage: "images/s3.jpg",
      cardImage: "images/s3.jpg",
      category: "Luxury Campaign & Aesthetics",
      industry: "Luxury Fashion & Lifestyle",
      clientName: "Celes Lifestyle",
      year: "2024 - 2025",
      shortIntro: "Minimalist marketing assets and aesthetic Instagram layout grids.",
      fullDescription: "High-end luxury campaign collateral and Instagram grid layout branding.",
      brandStory: "Exclusive lifestyle brand showcasing minimalist elegance.",
      brandGoals: "Establish high-end brand perception among luxury consumers.",
      services: ["Creative Design", "Social Media Management", "Luxury Branding"],
      overview: { challenge: "Conveying exclusivity and refined aesthetics.", strategy: "Minimalist typography & monochrome palettes.", solution: "Curated grid layouts.", execution: "Instagram showcase.", results: "High brand prestige." },
      media: { gallery: ["images/s3.jpg"], videos: [], mockups: { desktop: "images/s3.jpg", tablet: "images/s3.jpg", mobile: "images/s3.jpg" } },
      results: { stat1Num: "+180K", stat1Label: "Impressions", stat2Num: "+50%", stat2Label: "Brand Inquiries", stat3Num: "3.1x", stat3Label: "ROI", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "Celes Lifestyle Case Study", description: "Luxury branding and aesthetic design for Celes Lifestyle.", keywords: "Celes, luxury branding", ogImage: "images/s3.jpg", canonicalUrl: "https://betroverse.in/portfolio/celes-lifestyle" }
    },
    {
      id: "cs-toi-cafe-aesthetics",
      slug: "toi-cafe-aesthetics",
      status: "published",
      companyName: "Toi Cafe Aesthetics",
      companyLogo: "images/toi.png",
      heroImage: "images/s4.jpg",
      cardImage: "images/s4.jpg",
      category: "Branding Design & Menu Layout",
      industry: "Cafe & Desserts",
      clientName: "Toi Cafe",
      year: "2024 - 2025",
      shortIntro: "Menu and beverage promotions with premium visual layout.",
      fullDescription: "Custom menu cards and beverage promotional layouts for Toi Cafe.",
      brandStory: "Crafting beautiful menu layouts for specialty beverage lovers.",
      brandGoals: "Enhance customer ordering experience at the cafe.",
      services: ["Menu Layout Design", "Creative Design", "Branding"],
      overview: { challenge: "Creating a clear, elegant menu.", strategy: "Clean typography & beverage icons.", solution: "Laminated print menus & digital version.", execution: "In-store deployment.", results: "Positive customer feedback." },
      media: { gallery: ["images/s4.jpg"], videos: [], mockups: { desktop: "images/s4.jpg", tablet: "images/s4.jpg", mobile: "images/s4.jpg" } },
      results: { stat1Num: "+150K", stat1Label: "Views", stat2Num: "+35%", stat2Label: "Beverage Sales", stat3Num: "2.7x", stat3Label: "ROI", stat4Num: "100%", stat4Label: "Satisfaction" },
      seo: { title: "Toi Cafe Aesthetics Case Study", description: "Menu design and aesthetic branding for Toi Cafe.", keywords: "Toi Cafe, menu design", ogImage: "images/s4.jpg", canonicalUrl: "https://betroverse.in/portfolio/toi-cafe-aesthetics" }
    },
    {
      id: "cs-nice-mobiles-retail",
      slug: "nice-mobiles-retail",
      status: "published",
      companyName: "Nice Mobiles Retail",
      companyLogo: "images/NiceMobiles.png",
      heroImage: "images/s5.jpg",
      cardImage: "images/s5.jpg",
      category: "Sales Advertising & Promo",
      industry: "Retail Smartphone Sales",
      clientName: "Nice Mobiles",
      year: "2024 - 2025",
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
      id: "cs-nahdi-mandi-rest",
      slug: "nahdi-mandi-restaurant",
      status: "published",
      companyName: "Nahdi Mandi Restaurant",
      companyLogo: "images/Nahdimandi-white.png",
      heroImage: "images/s6.jpg",
      cardImage: "images/s6.jpg",
      category: "Visual Marketing & Menu",
      industry: "Restaurant & Catering",
      clientName: "Nahdi Mandi",
      year: "2024 - 2025",
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
      id: "cs-celes-brand",
      slug: "celes-lifestyle-brand",
      status: "published",
      companyName: "Celes Lifestyle Brand",
      companyLogo: "images/celes.png",
      heroImage: "images/s7.jpg",
      cardImage: "images/s7.jpg",
      category: "Social Management & Branding",
      industry: "Lifestyle & Apparel",
      clientName: "Celes",
      year: "2024 - 2025",
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
      id: "cs-independent",
      slug: "independent",
      status: "published",
      companyName: "Independent Designs",
      companyLogo: "images/logo.png",
      heroImage: "images/s8.jpg",
      cardImage: "images/s8.jpg",
      category: "Graphic Showcase & Posters",
      industry: "Creative Design & Typography",
      clientName: "Betroverse Studio",
      year: "2024 - 2025",
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

  // IndexedDB Storage Helper for Frontend Case Study Page
  const BetroStorage = {
    dbName: "BetroverseMediaDB",
    dbVersion: 1,
    db: null,
    cache: null,

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
          req.onsuccess = (e) => { this.db = e.target.result; resolve(this.db); };
          req.onerror = () => resolve(null);
        } catch (e) { resolve(null); }
      });
    },

    invalidateCache() {
      this.cache = null;
    },

    async getCaseStudies(forceRefresh = false) {
      if (!forceRefresh && this.cache && Array.isArray(this.cache) && this.cache.length > 0) return this.cache;
      const db = await this.init();
      if (db) {
        try {
          const val = await new Promise((res) => {
            const tx = db.transaction("app_store", "readonly");
            const req = tx.objectStore("app_store").get("betro_casestudies");
            req.onsuccess = () => res(req.result);
            req.onerror = () => res(null);
          });
          if (val && Array.isArray(val) && val.length > 0) {
            this.cache = val;
            return val;
          }
        } catch (e) {}
      }
      const raw = localStorage.getItem("betro_casestudies");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.cache = parsed;
            return parsed;
          }
        } catch (e) {}
      }
      return null;
    }
  };

  // Helper: Retrieve active case studies from IndexedDB, LocalStorage, or fallback
  window.getBetroCaseStudies = function () {
    if (BetroStorage.cache && Array.isArray(BetroStorage.cache) && BetroStorage.cache.length > 0) {
      return BetroStorage.cache;
    }
    const raw = localStorage.getItem("betro_casestudies");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return defaultCaseStudies;
  };

  // Pre-warm case studies from IndexedDB / BetroDB
  BetroStorage.getCaseStudies().then(csList => {
    if (csList && Array.isArray(csList) && csList.length > 0) {
      BetroStorage.cache = csList;
    }
  });

  // Main rendering logic when on a Case Study page
  const renderCaseStudyPage = async function (explicitData = null, explicitList = null) {
    // Determine current slug from URL path (e.g. /portfolio/mylaban.html) or query param (?id=mylaban)
    const urlParams = new URLSearchParams(window.location.search);
    let currentSlug = urlParams.get("id") || urlParams.get("project");

    if (!currentSlug) {
      const pathParts = window.location.pathname.split("/");
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.endsWith(".html")) {
        currentSlug = lastPart.replace(".html", "");
      } else if (lastPart && !lastPart.includes(".")) {
        currentSlug = lastPart;
      }
    }

    if (!currentSlug || currentSlug === "case-study") {
      currentSlug = "mylaban"; // Default fallback demo
    }

    let data = explicitData;
    let caseStudies = explicitList;

    // 1. Authoritative Cloud Database fetch from Supabase
    if (!data && window.BetroDB) {
      try {
        data = await BetroDB.getCaseStudyBySlug(currentSlug);
      } catch (e) {
        console.warn("[CaseStudy] Cloud fetch error:", e);
      }
    }

    if (!caseStudies && window.BetroDB) {
      try {
        caseStudies = await BetroDB.getCaseStudies({ includeDrafts: false });
      } catch (e) {}
    }

    if (!caseStudies || caseStudies.length === 0) {
      caseStudies = window.getBetroCaseStudies();
    }

    if (!data) {
      data = caseStudies.find(cs => cs.slug.toLowerCase() === currentSlug.toLowerCase()) || caseStudies[0];
    }
    if (!data) return;

    // Image Load Error Helper
    const attachImgErrorHandler = (imgElem) => {
      if (!imgElem) return;
      imgElem.onerror = function() {
        this.onerror = null;
        this.style.display = "none";
        const parent = this.parentElement;
        if (parent && !parent.querySelector(".img-error-fallback")) {
          const errBox = document.createElement("div");
          errBox.className = "img-error-fallback";
          errBox.style.cssText = "display:flex; flex-direction:column; align-items:center; justify-content:center; padding:12px; background:rgba(30,41,59,0.8); color:#ef4444; border-radius:10px; font-size:0.8rem; gap:4px; text-align:center; height:100%; width:100%; min-height:120px;";
          errBox.innerHTML = `<i class="ri-image-warning-line" style="font-size:1.4rem;"></i><span>Image failed to load</span>`;
          parent.appendChild(errBox);
        }
      };
    };

    // Asset URL helper to safely resolve Data URLs, Blob URLs, HTTP links, and relative paths
    const resolveAssetUrl = (url) => {
      if (!url) return "";
      if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") || url.startsWith("../")) {
        return url;
      }
      const isInSubdir = window.location.pathname.includes("/portfolio/");
      return isInSubdir ? "../" + url : url;
    };

    // Helper to resolve exact portfolio routing HTML links
    const getCaseStudyUrl = (cs) => {
      if (!cs || !cs.slug) return "case-study.html";
      const slug = cs.slug.toLowerCase();
      const staticFileMap = {
        "mylaban": "mylaban.html",
        "sa-adiya": "sa-adiya.html",
        "toi-cafe": "toi-cafe.html",
        "ph-mobiles": "ph-mobiles.html",
        "nice-mobiles": "nice-mobiles.html",
        "gurumitra": "gurumitra.html",
        "gurumitra-foundation": "gurumitra.html",
        "celes": "celes.html",
        "celes-lifestyle": "celes.html",
        "celes-lifestyle-brand": "celes.html",
        "nahdi-mandi": "nahdi-mandi.html",
        "nahdi-mandi-restaurant": "nahdi-mandi.html",
        "soofi-mandi": "soofi-mandi.html",
        "engo": "engo.html",
        "alain-architecture": "alain-architecture.html",
        "educart": "educart.html",
        "independent": "independent.html",
        "key-factory": "key-factory.html"
      };

      if (window.location.pathname.includes("case-study.html") || !window.location.pathname.endsWith(".html")) {
        return `case-study.html?id=${slug}`;
      }
      if (staticFileMap[slug]) {
        return staticFileMap[slug];
      }
      return `case-study.html?id=${slug}`;
    };

    // --- 1. HERO SECTION POPULATION ---
    const heroSection = document.querySelector(".cs-hero");
    if (heroSection && data.heroImage) {
      const relativePath = resolveAssetUrl(data.heroImage);
      heroSection.style.backgroundImage = `url('${relativePath}')`;
    }

    const logoImg = document.getElementById("cs-logo") || document.querySelector(".cs-hero-logo-box img");
    if (logoImg && data.companyLogo) {
      logoImg.src = resolveAssetUrl(data.companyLogo);
      logoImg.alt = (data.companyName || "Company") + " Logo";
      attachImgErrorHandler(logoImg);
    }

    const categoryElem = document.getElementById("cs-category") || document.querySelector(".cs-category-pill");
    if (categoryElem && data.category) categoryElem.textContent = data.category;

    const titleElem = document.getElementById("cs-title") || document.querySelector(".cs-hero-title");
    if (titleElem && data.companyName) titleElem.textContent = data.companyName;

    const introElem = document.getElementById("cs-intro") || document.querySelector(".cs-hero-intro");
    if (introElem && (data.shortIntro || data.fullDescription)) {
      introElem.textContent = data.shortIntro || data.fullDescription;
    }

    // Metadata
    const clientElem = document.getElementById("cs-meta-client");
    if (clientElem) clientElem.textContent = data.clientName || data.companyName;

    const industryElem = document.getElementById("cs-meta-industry");
    if (industryElem) industryElem.textContent = data.industry || "Creative Branding";

    const yearElem = document.getElementById("cs-meta-year");
    if (yearElem) yearElem.textContent = data.year || "2024 - 2025";

    // --- 2. ABOUT THE BRAND SECTION ---
    const storyElem = document.getElementById("cs-brand-story");
    if (storyElem && (data.brandStory || data.fullDescription)) {
      storyElem.textContent = data.brandStory || data.fullDescription;
    }

    const goalsElem = document.getElementById("cs-brand-goals");
    if (goalsElem && (data.brandGoals || data.projectObjective)) {
      goalsElem.textContent = (data.brandGoals || "") + "\n\n" + (data.projectObjective || "");
    }

    // --- 3. SERVICES PROVIDED SECTION ---
    const servicesContainer = document.getElementById("cs-services-list");
    if (servicesContainer && Array.isArray(data.services) && data.services.length > 0) {
      servicesContainer.innerHTML = "";
      data.services.forEach(service => {
        const tag = document.createElement("span");
        tag.className = "cs-service-tag";
        tag.textContent = service;
        servicesContainer.appendChild(tag);
      });
    }

    // --- 4. PROJECT OVERVIEW SECTION ---
    if (data.overview) {
      const challengeElem = document.getElementById("cs-overview-challenge");
      if (challengeElem && data.overview.challenge) challengeElem.textContent = data.overview.challenge;

      const strategyElem = document.getElementById("cs-overview-strategy");
      if (strategyElem && data.overview.strategy) strategyElem.textContent = data.overview.strategy;

      const solutionElem = document.getElementById("cs-overview-solution");
      if (solutionElem && data.overview.solution) solutionElem.textContent = data.overview.solution;

      const executionElem = document.getElementById("cs-overview-execution");
      if (executionElem && data.overview.execution) executionElem.textContent = data.overview.execution;

      const resultsElem = document.getElementById("cs-overview-results");
      if (resultsElem && data.overview.results) resultsElem.textContent = data.overview.results;
    }

    // --- 5. CREATIVE SHOWCASE POPULATION (Editorial Dynamic Collage Engine) ---
    const showcaseSection = document.querySelector(".cs-showcase-grid, .cs-showcase-masonry-gallery")?.closest("section, .cs-section") || document.querySelector('[data-section="creative_showcase"]');
    const showcaseGrid = document.querySelector(".cs-showcase-grid") || document.querySelector(".cs-showcase-masonry-gallery");
    
    // Strictly image assets for the Creative Showcase Collage
    const showcaseMedia = [];
    if (data.media && Array.isArray(data.media.gallery)) {
      data.media.gallery.forEach((item, i) => {
        if (!item) return;
        if (typeof item === "object") {
          if (item.status === "deleted") return;
          // Never include video items in Section 5
          if (item.type === "video" || item.target_section === "video_showcase") return;
          if (item.url && item.url.trim()) {
            showcaseMedia.push({
              id: item.id || `asset-${i}`,
              type: "image",
              url: resolveAssetUrl(item.url.trim()),
              title: item.name || `${data.companyName || 'Visual'} Asset ${i + 1}`,
              display_order: typeof item.display_order === "number" ? item.display_order : i
            });
          }
        } else if (typeof item === "string" && item.trim()) {
          const lower = item.toLowerCase();
          const isVideoExt = lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.includes("youtube.com") || lower.includes("vimeo.com");
          if (!isVideoExt) {
            showcaseMedia.push({
              id: `asset-${i}`,
              type: "image",
              url: resolveAssetUrl(item.trim()),
              title: `${data.companyName || 'Visual'} Asset ${i + 1}`,
              display_order: i
            });
          }
        }
      });
      // Sort strictly by display_order ascending
      showcaseMedia.sort((a, b) => a.display_order - b.display_order);
    }

    if (showcaseGrid) {
      if (showcaseMedia.length === 0) {
        // Zero images: Empty grid cleanly without injecting fallbacks or fake demo media
        showcaseGrid.innerHTML = "";
      } else {
        showcaseGrid.style.cssText = "";
        showcaseGrid.className = "cs-showcase-grid cs-editorial-collage-wrapper";
        
        const totalCount = showcaseMedia.length;
        
        // Rotations and z-indexes array
        const rotations = [-3.5, 2.5, -1.8, 3.8, -2.4, 4.2, -1.5, 3.0, -2.8, 2.0];
        const zIndexes = [10, 8, 6, 7, 9, 5, 4, 3, 2, 1];
        const spanClasses = ["is-hero", "is-tall", "is-square", "is-wide", "is-medium"];
        
        // Handwritten Annotations Inspired by Reference Image
        const annotationsList = [
          "From Concept to Cravings ↴",
          "Designing Brands that tell Stories ↗",
          "Sweet Moments, Stronger Brands ♡",
          "More Than Dessert, A Story in Every Bite ♡",
          "Layers of Happiness ↴",
          "Crafting Iconic Visuals ↗"
        ];
        
        const collageContainer = document.createElement("div");
        collageContainer.className = "cs-editorial-collage";
        collageContainer.setAttribute("data-count", totalCount);
        
        showcaseMedia.forEach((item, idx) => {
          const rot = rotations[idx % rotations.length];
          const z = zIndexes[idx % zIndexes.length];
          const spanClass = totalCount > 3 ? spanClasses[idx % spanClasses.length] : "";
          
          const card = document.createElement("div");
          card.className = `cs-collage-card cs-collage-item-${idx + 1} ${spanClass}`;
          card.style.setProperty("--rot", `${rot}deg`);
          card.style.setProperty("--z", `${z}`);
          card.setAttribute("data-index", idx);
          
          // Optionally attach an artistic handwritten annotation on specific cards
          let annotationHtml = "";
          if (idx === 0 && annotationsList[0]) {
            annotationHtml = `<span class="cs-collage-annotation top-left">${annotationsList[0]}</span>`;
          } else if (idx === 1 && annotationsList[1]) {
            annotationHtml = `<span class="cs-collage-annotation top-right">${annotationsList[1]}</span>`;
          } else if (idx === 2 && annotationsList[2]) {
            annotationHtml = `<span class="cs-collage-annotation bottom-left">${annotationsList[2]}</span>`;
          } else if (idx === 3 && annotationsList[3]) {
            annotationHtml = `<span class="cs-collage-annotation bottom-right">${annotationsList[3]}</span>`;
          }
          
          card.innerHTML = `
            ${annotationHtml}
            <div class="cs-collage-frame">
              <img src="${item.url}" alt="${item.title}" loading="lazy">
              <div class="cs-collage-overlay"><i class="ri-fullscreen-line"></i></div>
            </div>
          `;
          const imgElem = card.querySelector("img");
          if (imgElem) attachImgErrorHandler(imgElem);
          
          collageContainer.appendChild(card);
        });
        
        showcaseGrid.innerHTML = "";
        showcaseGrid.appendChild(collageContainer);
      }
    }

    // --- 6. VIDEO SHOWCASE POPULATION ---
    const videoSection = document.querySelector(".cs-video-grid")?.closest("section, .cs-section") || document.querySelector('[data-section="video_showcase"]');
    const videoGrid = document.querySelector(".cs-video-grid");
    
    // Strictly extract active video assets
    const activeVideos = [];
    if (data.media && Array.isArray(data.media.videos)) {
      data.media.videos.forEach((item, idx) => {
        if (!item) return;
        if (typeof item === "object") {
          if (item.status === "deleted") return;
          if (item.url && item.url.trim()) {
            activeVideos.push({
              url: item.url.trim(),
              title: item.name || `${data.companyName || 'Motion'} Video ${idx + 1}`,
              display_order: typeof item.display_order === "number" ? item.display_order : idx
            });
          }
        } else if (typeof item === "string" && item.trim()) {
          activeVideos.push({
            url: item.trim(),
            title: `${data.companyName || 'Motion'} Video ${idx + 1}`,
            display_order: idx
          });
        }
      });
      activeVideos.sort((a, b) => a.display_order - b.display_order);
    }

    if (videoGrid) {
      if (activeVideos.length === 0) {
        // Zero videos in database: Empty grid and hide Section 6 completely
        videoGrid.innerHTML = "";
        if (videoSection) {
          videoSection.style.display = "none";
        }
      } else {
        // Videos exist: Ensure Section 6 is visible (unless explicitly hidden in config) and render all active videos
        if (videoSection && (!data.sectionVisibility || data.sectionVisibility.video_showcase !== false)) {
          videoSection.style.display = "";
        }
        videoGrid.innerHTML = "";
        
        const count = activeVideos.length;
        activeVideos.forEach((vid) => {
          const card = document.createElement("div");
          let gridColStyle = "grid-column: span 6;";
          if (count === 1) {
            gridColStyle = "grid-column: span 12;";
          } else if (count === 2) {
            gridColStyle = "grid-column: span 6;";
          } else if (count >= 3) {
            gridColStyle = "grid-column: span 4;";
          }

          card.className = "cs-video-card-item";
          card.style.cssText = `${gridColStyle} border-radius: 20px; overflow: hidden; background: rgba(12, 15, 23, 0.8); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 16px 36px rgba(0,0,0,0.5); aspect-ratio: 16/9; position: relative;`;
          
          const isEmbed = vid.url.includes("youtube.com") || vid.url.includes("vimeo.com") || vid.url.includes("embed");
          const finalUrl = resolveAssetUrl(vid.url);
          
          if (isEmbed) {
            card.innerHTML = `
              <iframe src="${finalUrl}" title="${vid.title}" style="width: 100%; height: 100%; border: none; border-radius: 20px; display: block;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            `;
          } else {
            card.innerHTML = `
              <video src="${finalUrl}" controls preload="metadata" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px; display: block;"></video>
            `;
          }
          videoGrid.appendChild(card);
        });
      }
    }

    // --- 7. WEBSITE SHOWCASE POPULATION ---
    const mockupsContainer = document.querySelector(".cs-device-mockups");
    if (mockupsContainer && data.media && data.media.mockups) {
      const mockupScreens = mockupsContainer.querySelectorAll(".cs-mockup-screen");
      if (mockupScreens[0] && data.media.mockups.desktop) {
        const deskImg = resolveAssetUrl(data.media.mockups.desktop);
        mockupScreens[0].innerHTML = `
          <img src="${deskImg}" alt="Desktop Mockup" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">
        `;
        mockupScreens[0].style.border = "none";
        attachImgErrorHandler(mockupScreens[0].querySelector("img"));
      }
      if (mockupScreens[2] && data.media.mockups.mobile) {
        const mobImg = resolveAssetUrl(data.media.mockups.mobile);
        mockupScreens[2].innerHTML = `
          <img src="${mobImg}" alt="Mobile Mockup" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">
        `;
        mockupScreens[2].style.border = "none";
        attachImgErrorHandler(mockupScreens[2].querySelector("img"));
      }
    }

    // --- 8. RESULTS & METRICS SECTION ---
    if (data.results) {
      const statsGrid = document.querySelector(".cs-stats-grid");
      if (statsGrid) {
        const numbers = statsGrid.querySelectorAll(".cs-stat-number");
        const labels = statsGrid.querySelectorAll(".cs-stat-label");

        if (numbers[0] && data.results.stat1Num) numbers[0].textContent = data.results.stat1Num;
        if (labels[0] && data.results.stat1Label) labels[0].textContent = data.results.stat1Label;

        if (numbers[1] && data.results.stat2Num) numbers[1].textContent = data.results.stat2Num;
        if (labels[1] && data.results.stat2Label) labels[1].textContent = data.results.stat2Label;

        if (numbers[2] && data.results.stat3Num) numbers[2].textContent = data.results.stat3Num;
        if (labels[2] && data.results.stat3Label) labels[2].textContent = data.results.stat3Label;

        if (numbers[3] && data.results.stat4Num) numbers[3].textContent = data.results.stat4Num;
        if (labels[3] && data.results.stat4Label) labels[3].textContent = data.results.stat4Label;
      }

      const quoteElem = document.getElementById("cs-feedback-text") || document.querySelector(".cs-feedback-text");
      if (quoteElem && data.results.feedbackQuote) quoteElem.textContent = `"${data.results.feedbackQuote}"`;

      const authorElem = document.getElementById("cs-feedback-author") || document.querySelector(".cs-feedback-author");
      if (authorElem && data.results.feedbackAuthor) authorElem.textContent = data.results.feedbackAuthor;

      const roleElem = document.getElementById("cs-feedback-role") || document.querySelector(".cs-feedback-role");
      if (roleElem && data.results.feedbackRole) roleElem.textContent = data.results.feedbackRole;
    }

    // (Next/Prev navigation handled in End Sections Engine below)

    // --- SEO HEAD POPULATION & JSON-LD SCHEMA ---
    if (data.seo) {
      if (data.seo.title) document.title = data.seo.title;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      if (data.seo.description) metaDesc.content = data.seo.description;

      let metaKw = document.querySelector('meta[name="keywords"]');
      if (!metaKw) {
        metaKw = document.createElement("meta");
        metaKw.name = "keywords";
        document.head.appendChild(metaKw);
      }
      if (data.seo.keywords) metaKw.content = data.seo.keywords;

      // JSON-LD Structured Data Schema
      let schemaScript = document.getElementById("cs-jsonld-schema");
      if (!schemaScript) {
        schemaScript = document.createElement("script");
        schemaScript.id = "cs-jsonld-schema";
        schemaScript.type = "application/ld+json";
        document.head.appendChild(schemaScript);
      }
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": data.companyName + " Case Study",
        "headline": data.shortIntro || data.companyName,
        "provider": {
          "@type": "Organization",
          "name": "Betroverse Creative Agency",
          "url": "https://betroverse.in"
        },
        "about": data.category || "Creative Branding"
      };
      schemaScript.textContent = JSON.stringify(schemaData);
    }

    // --- SECTION VISIBILITY & REORDERING ENGINE ---
    const vis = data.sectionVisibility || {};
    const order = Array.isArray(data.sectionOrder) && data.sectionOrder.length > 0
      ? data.sectionOrder
      : ["hero", "company_overview", "brand_story", "project_objectives", "services", "project_overview", "challenge", "strategy", "solution", "execution", "results_summary", "results_impact", "performance_metrics", "client_testimonial", "creative_showcase", "gallery", "video_showcase", "website_mockups", "mobile_mockups", "desktop_mockups", "brand_identity", "social_media_campaign", "marketing_campaign", "additional_info", "custom_sections"];

    // Helper: Map section keys to DOM elements
    const getDomSection = (key) => {
      const explicit = document.querySelector(`[data-section="${key}"]`);
      if (explicit) return explicit;

      // Heuristic fallback matching for existing static markup
      if (key === "hero") return document.querySelector(".cs-hero");
      if (key === "services") return document.querySelector(".cs-services-flex")?.closest("section, .cs-section");
      if (key === "project_overview") return document.querySelector(".cs-overview-grid")?.closest("section, .cs-section");
      if (key === "creative_showcase" || key === "gallery") return document.querySelector(".cs-showcase-grid, .cs-showcase-masonry-gallery")?.closest("section, .cs-section");
      if (key === "video_showcase") return document.querySelector(".cs-video-grid")?.closest("section, .cs-section");
      if (key === "website_mockups" || key === "desktop_mockups" || key === "mobile_mockups") return document.querySelector(".cs-device-mockups")?.closest("section, .cs-section");
      if (key === "results_impact" || key === "performance_metrics") return document.querySelector(".cs-stats-grid")?.closest("section, .cs-section");
      if (key === "client_testimonial") return document.querySelector(".cs-feedback-card")?.closest("section, .cs-section");
      if (key === "brand_story" || key === "company_overview" || key === "project_objectives") return document.querySelector(".cs-about-grid")?.closest("section, .cs-section");
      return null;
    };

    // Apply ON / OFF visibility rules (completely hide disabled sections)
    Object.keys(vis).forEach(secKey => {
      if (vis[secKey] === false) {
        const secElem = getDomSection(secKey);
        if (secElem) {
          secElem.style.display = "none";
          secElem.style.margin = "0";
          secElem.style.padding = "0";
          secElem.classList.add("cs-section-disabled");
        }
      }
    });

    // Apply custom section ordering if specified
    const pageWrapper = document.querySelector(".cs-page-wrapper") || document.body;
    if (pageWrapper && Array.isArray(data.sectionOrder) && data.sectionOrder.length > 0) {
      order.forEach(secKey => {
        if (vis[secKey] !== false) {
          const secElem = getDomSection(secKey);
          if (secElem && secElem.parentNode === pageWrapper) {
            pageWrapper.appendChild(secElem); // Append in configured sequence
          }
        }
      });
      const footer = document.querySelector("footer");
      if (footer && footer.parentNode === pageWrapper) {
        pageWrapper.appendChild(footer); // Ensure footer remains at bottom
      }
    }

    // --- SCROLL REVEAL OBSERVER ---
    const sections = document.querySelectorAll(".cs-section:not(.cs-section-disabled)");
    sections.forEach(sec => sec.classList.add("cs-reveal"));

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      }, { threshold: 0.15 });

      sections.forEach(sec => observer.observe(sec));
    } else {
      sections.forEach(sec => sec.classList.add("active"));
    }

    // --- INTERACTIVE LIGHTBOX SYSTEM ---
    let lightboxOverlay = document.getElementById("cs-lightbox-modal");
    if (!lightboxOverlay) {
      lightboxOverlay = document.createElement("div");
      lightboxOverlay.id = "cs-lightbox-modal";
      lightboxOverlay.className = "cs-lightbox-overlay";
      lightboxOverlay.setAttribute("aria-hidden", "true");
      lightboxOverlay.innerHTML = `
        <button class="cs-lightbox-close" id="cs-lightbox-close-btn" aria-label="Close Lightbox"><i class="ri-close-line"></i></button>
        <button class="cs-lightbox-btn cs-lightbox-prev" id="cs-lightbox-prev-btn" aria-label="Previous Media"><i class="ri-arrow-left-s-line"></i></button>
        <button class="cs-lightbox-btn cs-lightbox-next" id="cs-lightbox-next-btn" aria-label="Next Media"><i class="ri-arrow-right-s-line"></i></button>
        <div class="cs-lightbox-container" id="cs-lightbox-container">
          <img id="cs-lightbox-img" class="cs-lightbox-img" src="" alt="Showcase Preview">
        </div>
        <div id="cs-lightbox-caption" class="cs-lightbox-caption"></div>
      `;
      document.body.appendChild(lightboxOverlay);
    }

    const lightboxContainer = document.getElementById("cs-lightbox-container");
    const lightboxCaption = document.getElementById("cs-lightbox-caption");
    const closeBtn = document.getElementById("cs-lightbox-close-btn");
    const prevBtn = document.getElementById("cs-lightbox-prev-btn");
    const nextBtn = document.getElementById("cs-lightbox-next-btn");

    const collageCards = Array.from(document.querySelectorAll(".cs-collage-card, .cs-showcase-masonry-item"));
    let currentGalleryIndex = 0;

    const openLightbox = (index) => {
      if (index < 0 || index >= showcaseMedia.length) return;
      currentGalleryIndex = index;
      const targetMedia = showcaseMedia[index];

      lightboxContainer.innerHTML = "";

      if (targetMedia) {
        lightboxContainer.innerHTML = `<img id="cs-lightbox-img" class="cs-lightbox-img" src="${targetMedia.url}" alt="${targetMedia.title || 'Showcase Image'}">`;
        const imgElem = lightboxContainer.querySelector("img");
        if (imgElem) attachImgErrorHandler(imgElem);

        if (lightboxCaption) {
          lightboxCaption.textContent = `${data.companyName || 'Case Study'} Showcase — ${targetMedia.title || 'Visual Asset'} (${index + 1} of ${showcaseMedia.length})`;
        }
      }

      lightboxOverlay.classList.add("active");
      lightboxOverlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
      lightboxOverlay.classList.remove("active");
      lightboxOverlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lightboxContainer) lightboxContainer.innerHTML = "";
    };

    collageCards.forEach((item) => {
      item.style.cursor = "pointer";
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      const idx = parseInt(item.getAttribute("data-index"), 10);
      const targetIdx = isNaN(idx) ? 0 : idx;
      item.addEventListener("click", () => openLightbox(targetIdx));
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(targetIdx);
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    lightboxOverlay.addEventListener("click", (e) => {
      if (e.target === lightboxOverlay || e.target === lightboxContainer) closeLightbox();
    });

    const maxItems = Math.max(showcaseMedia.length, collageCards.length);
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (maxItems > 0) {
          currentGalleryIndex = (currentGalleryIndex - 1 + maxItems) % maxItems;
          openLightbox(currentGalleryIndex);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (maxItems > 0) {
          currentGalleryIndex = (currentGalleryIndex + 1) % maxItems;
          openLightbox(currentGalleryIndex);
        }
      });
    }

    // Keyboard Shortcuts (Left, Right, Escape)
    document.addEventListener("keydown", (e) => {
      if (!lightboxOverlay.classList.contains("active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft" && prevBtn) prevBtn.click();
      if (e.key === "ArrowRight" && nextBtn) nextBtn.click();
    });

    // Touch Swipe Gestures for Mobile
    let touchStartX = 0;
    let touchEndX = 0;
    lightboxOverlay.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    lightboxOverlay.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50 && nextBtn) nextBtn.click();
      if (touchEndX - touchStartX > 50 && prevBtn) prevBtn.click();
    });
    // --- BREADCRUMBS NAVIGATION ---
    const heroContent = document.querySelector(".cs-hero-content");
    if (heroContent && !document.querySelector(".cs-breadcrumbs")) {
      const breadcrumbs = document.createElement("div");
      breadcrumbs.className = "cs-breadcrumbs";
      breadcrumbs.innerHTML = `
        <a href="../index.html">Home</a>
        <span class="cs-sep"><i class="ri-arrow-right-s-line"></i></span>
        <a href="../portfolio.html">Portfolio</a>
        <span class="cs-sep"><i class="ri-arrow-right-s-line"></i></span>
        <span class="cs-active">${data.companyName}</span>
      `;
      heroContent.insertBefore(breadcrumbs, heroContent.firstChild);
    }

    // --- SOCIAL SHARE BAR ---
    if (heroContent && !document.querySelector(".cs-share-bar")) {
      const currentUrl = encodeURIComponent(window.location.href);
      const shareTitle = encodeURIComponent(`Check out ${data.companyName} Case Study by Betroverse Creative Agency`);
      
      const shareBar = document.createElement("div");
      shareBar.className = "cs-share-bar";
      shareBar.innerHTML = `
        <span class="cs-share-label">Share Project:</span>
        <button type="button" class="cs-share-btn" id="cs-copy-link-btn" title="Copy Link" aria-label="Copy Link"><i class="ri-file-copy-line"></i></button>
        <a href="https://api.whatsapp.com/send?text=${shareTitle}%20${currentUrl}" target="_blank" class="cs-share-btn" title="Share on WhatsApp" aria-label="Share on WhatsApp"><i class="ri-whatsapp-line"></i></a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}" target="_blank" class="cs-share-btn" title="Share on LinkedIn" aria-label="Share on LinkedIn"><i class="ri-linkedin-fill"></i></a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${currentUrl}" target="_blank" class="cs-share-btn" title="Share on Facebook" aria-label="Share on Facebook"><i class="ri-facebook-fill"></i></a>
        <a href="https://twitter.com/intent/tweet?url=${currentUrl}&text=${shareTitle}" target="_blank" class="cs-share-btn" title="Share on X" aria-label="Share on X"><i class="ri-twitter-x-line"></i></a>
      `;
      heroContent.appendChild(shareBar);

      const copyBtn = document.getElementById("cs-copy-link-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(window.location.href).then(() => {
            copyBtn.innerHTML = `<i class="ri-check-line"></i>`;
            copyBtn.style.background = "#4ab96c";
            setTimeout(() => {
              copyBtn.innerHTML = `<i class="ri-file-copy-line"></i>`;
              copyBtn.style.background = "";
            }, 2000);
          });
        });
      }
    }

    // --- 9. END SECTIONS ENGINE (Exact Sequence: 1. Related Projects -> 2. Previous/Next Nav -> 3. Brand CTA -> 4. Footer) ---
    const currentIndex = caseStudies.findIndex(cs => cs.slug.toLowerCase() === data.slug.toLowerCase() || cs.id === data.id);

    // 1. RELATED PROJECTS SECTION
    let relatedSection = document.querySelector(".cs-related-section");
    if (!relatedSection) {
      relatedSection = document.createElement("section");
      relatedSection.className = "cs-section cs-related-section";
      relatedSection.setAttribute("data-section", "related_projects");
    }

    // Filter out current case study so current project NEVER appears inside Related Projects!
    const otherProjects = caseStudies.filter(cs => cs.slug.toLowerCase() !== data.slug.toLowerCase() && cs.id !== data.id);
    const relatedProjects = otherProjects.slice(0, 3); // Pick top 3 other relevant projects

    if (relatedProjects.length > 0) {
      relatedSection.style.display = "";
      relatedSection.innerHTML = `
        <div class="cs-container">
          <div class="cs-section-header" style="margin-bottom: 2rem;">
            <span class="cs-section-subtitle">EXPLORE MORE WORK</span>
            <h2 class="cs-section-title">Related Projects</h2>
          </div>
          <div class="cs-related-grid">
            ${relatedProjects.map(rp => {
              const bgImg = rp.heroImage ? resolveAssetUrl(rp.heroImage) : resolveAssetUrl("images/p1.jpg");
              const targetUrl = getCaseStudyUrl(rp);
              return `
                <a href="${targetUrl}" class="cs-related-card">
                  <div class="cs-related-thumb" style="background-image: url('${bgImg}');"></div>
                  <div class="cs-related-body">
                    <span class="cs-related-cat">${rp.category || 'Creative Branding'}</span>
                    <h3 class="cs-related-title">${rp.companyName}</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; margin-top: auto;">${rp.shortIntro || rp.industry || 'Case study overview'}</p>
                  </div>
                </a>
              `;
            }).join("")}
          </div>
        </div>
      `;
    } else {
      relatedSection.style.display = "none";
    }

    // 2. PREVIOUS / NEXT PROJECT NAVIGATION SECTION
    let projectNavSection = document.querySelector(".cs-project-nav-section") || document.querySelector(".cs-project-nav")?.closest("section, .cs-section");
    if (!projectNavSection) {
      projectNavSection = document.createElement("section");
      projectNavSection.className = "cs-section cs-project-nav-section";
      projectNavSection.setAttribute("data-section", "project_nav");
    }
    projectNavSection.style.borderBottom = "none";

    const prevStudy = (currentIndex > 0 && currentIndex < caseStudies.length) ? caseStudies[currentIndex - 1] : null;
    const nextStudy = (currentIndex >= 0 && currentIndex < caseStudies.length - 1) ? caseStudies[currentIndex + 1] : null;

    let prevCardHtml = "";
    if (prevStudy) {
      prevCardHtml = `
        <a href="${getCaseStudyUrl(prevStudy)}" class="cs-nav-card cs-nav-prev">
          <div class="cs-nav-dir"><i class="ri-arrow-left-line"></i> Previous Project</div>
          <div class="cs-nav-title">${prevStudy.companyName}</div>
        </a>
      `;
    } else {
      // First project in dataset -> Previous Project disabled / hidden (no invalid routes, no wrapping around!)
      prevCardHtml = `
        <div class="cs-nav-card cs-nav-prev cs-nav-disabled" style="visibility: hidden; pointer-events: none;" aria-hidden="true">
          <div class="cs-nav-dir"><i class="ri-arrow-left-line"></i> Previous Project</div>
          <div class="cs-nav-title">No Previous Project</div>
        </div>
      `;
    }

    let nextCardHtml = "";
    if (nextStudy) {
      nextCardHtml = `
        <a href="${getCaseStudyUrl(nextStudy)}" class="cs-nav-card cs-nav-next" style="text-align: right;">
          <div class="cs-nav-dir">Next Project <i class="ri-arrow-right-line"></i></div>
          <div class="cs-nav-title">${nextStudy.companyName}</div>
        </a>
      `;
    } else {
      // Last project in dataset -> Next Project disabled / hidden
      nextCardHtml = `
        <div class="cs-nav-card cs-nav-next cs-nav-disabled" style="visibility: hidden; pointer-events: none; text-align: right;" aria-hidden="true">
          <div class="cs-nav-dir">Next Project <i class="ri-arrow-right-line"></i></div>
          <div class="cs-nav-title">No Next Project</div>
        </div>
      `;
    }

    projectNavSection.innerHTML = `
      <div class="cs-container">
        <div class="cs-project-nav">
          ${prevCardHtml}
          ${nextCardHtml}
        </div>
      </div>
    `;

    // 3. READY TO BUILD YOUR BRAND? CTA SECTION
    let ctaSection = document.querySelector(".cs-cta-wrapper-section") || document.querySelector(".cs-cta-section")?.closest("section, .cs-section");
    if (!ctaSection || !ctaSection.classList.contains("cs-cta-wrapper-section")) {
      ctaSection = document.createElement("section");
      ctaSection.className = "cs-section cs-cta-wrapper-section";
      ctaSection.setAttribute("data-section", "brand_cta");
    }
    ctaSection.style.borderBottom = "none";
    ctaSection.style.paddingTop = "0";

    ctaSection.innerHTML = `
      <div class="cs-container">
        <div class="cs-cta-section">
          <h2 class="cs-cta-title">Ready to build your brand?</h2>
          <p class="cs-cta-desc">Partner with Betroverse to elevate your digital identity, produce viral video content, and create high-converting agency marketing assets.</p>
          <div class="cs-cta-btns">
            <a href="https://wa.me/918590417077?text=Hello%20Betroverse!%20I%20saw%20your%20case%20study%20and%20want%20to%20start%20a%20project." target="_blank" class="cs-cta-btn primary">
              <span>Start Your Project</span> <i class="ri-arrow-right-line"></i>
            </a>
            <a href="https://wa.me/918590417077?text=Hello!%20I'd%20like%20to%20book%20a%20consultation%20with%20Betroverse." target="_blank" class="cs-cta-btn secondary">
              <span>Book a Consultation</span>
            </a>
            <a href="../index.html#contact" class="cs-cta-btn secondary">
              <span>Contact Betroverse</span>
            </a>
          </div>
        </div>
      </div>
    `;

    // 4. CLEAN UP DUPLICATE DOM NODES AND ENFORCE ABSOLUTE DOM SEQUENCING RIGHT BEFORE FOOTER
    const footerElem = document.querySelector("footer");

    // Clean up any extra static project-nav or CTA sections that might exist in static HTML markup
    document.querySelectorAll(".cs-project-nav, .cs-cta-section").forEach(el => {
      const parentSec = el.closest("section, .cs-section");
      if (parentSec && parentSec !== projectNavSection && parentSec !== ctaSection && parentSec !== relatedSection) {
        parentSec.remove();
      }
    });

    if (footerElem && footerElem.parentNode) {
      const parent = footerElem.parentNode;
      parent.insertBefore(relatedSection, footerElem);
      parent.insertBefore(projectNavSection, footerElem);
      parent.insertBefore(ctaSection, footerElem);
    } else {
      const pageWrapper = document.querySelector(".cs-page-wrapper") || document.body;
      pageWrapper.appendChild(relatedSection);
      pageWrapper.appendChild(projectNavSection);
      pageWrapper.appendChild(ctaSection);
      if (footerElem) pageWrapper.appendChild(footerElem);
    }
  };

  const refreshAndRender = async (force = false) => {
    if (force) {
      BetroStorage.invalidateCache();
    }
    const urlParams = new URLSearchParams(window.location.search);
    let currentSlug = urlParams.get("id") || urlParams.get("project");
    if (!currentSlug) {
      const pathParts = window.location.pathname.split("/");
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.endsWith(".html")) {
        currentSlug = lastPart.replace(".html", "");
      } else if (lastPart && !lastPart.includes(".")) {
        currentSlug = lastPart;
      }
    }
    if (!currentSlug || currentSlug === "case-study") currentSlug = "mylaban";

    let singleCS = null;
    let allCS = null;

    if (window.BetroDB) {
      try {
        singleCS = await BetroDB.getCaseStudyBySlug(currentSlug);
        allCS = await BetroDB.getCaseStudies({ forceRefresh: force, includeDrafts: false });
      } catch (e) {
        console.warn("[CaseStudy] Cloud load failed, using local:", e);
      }
    }

    if (!allCS || allCS.length === 0) {
      allCS = await BetroStorage.getCaseStudies(force);
    }
    if (allCS && Array.isArray(allCS)) BetroStorage.cache = allCS;

    await renderCaseStudyPage(singleCS, allCS);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => refreshAndRender(false));
  } else {
    refreshAndRender(false);
  }

  // Real-time synchronization listeners across windows/tabs
  if ("BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel("betro_portfolio_sync");
      channel.onmessage = (e) => {
        if (e.data && (e.data.type === "CASE_STUDY_UPDATED" || e.data.type === "MEDIA_SYNC" || e.data.type === "CASE_STUDY_DELETED")) {
          refreshAndRender(true);
        }
      };
    } catch (e) {}
  }
  window.addEventListener("storage", (e) => {
    if (e.key === "betro_casestudies" || e.key === "betro_casestudies_cache") {
      refreshAndRender(true);
    }
  });
  window.addEventListener("betro_storage_updated", () => {
    refreshAndRender(true);
  });
  window.addEventListener("betro_db_updated", () => {
    refreshAndRender(true);
  });
})();

