-- ============================================================================
-- BETROVERSE FULL DATABASE INITIALIZER & DATA MIGRATION
-- Run this file in Supabase SQL Editor to initialize all tables, storage, and 16 case studies
-- ============================================================================

-- ============================================================================
-- BETROVERSE PRODUCTION SUPABASE DATABASE SCHEMA & STORAGE SETUP
-- ============================================================================

-- 1. Enable UUID Extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Portfolio Projects Table
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    title TEXT,
    category TEXT,
    industry TEXT,
    client_name TEXT,
    year TEXT DEFAULT '2024 - 2025',
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    company_logo TEXT,
    card_image TEXT,
    hero_image TEXT,
    short_intro TEXT,
    full_description TEXT,
    brand_story TEXT,
    brand_goals TEXT,
    project_objective TEXT,
    services JSONB DEFAULT '[]'::jsonb,
    overview JSONB DEFAULT '{}'::jsonb,
    media JSONB DEFAULT '{"gallery":[],"videos":[],"mockups":{}}'::jsonb,
    results JSONB DEFAULT '{}'::jsonb,
    seo JSONB DEFAULT '{}'::jsonb,
    gallery_sections JSONB DEFAULT '[]'::jsonb,
    blocks JSONB DEFAULT '[]'::jsonb,
    section_visibility JSONB DEFAULT '{}'::jsonb,
    section_order JSONB DEFAULT '[]'::jsonb,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Media Assets Table (Linked strictly to Case Studies by case_study_id)
CREATE TABLE IF NOT EXISTS public.media_assets (
    id TEXT PRIMARY KEY,
    case_study_id TEXT REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
    case_study_slug TEXT,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'pdf', 'document')),
    target_section TEXT DEFAULT 'creative_showcase',
    url TEXT NOT NULL,
    storage_path TEXT,
    name TEXT,
    size TEXT,
    display_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'deleted', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Brand Logos Table
CREATE TABLE IF NOT EXISTS public.brand_logos (
    id TEXT PRIMARY KEY,
    src TEXT NOT NULL,
    name TEXT,
    style TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_slug ON public.portfolio_projects(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_status ON public.portfolio_projects(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_display_order ON public.portfolio_projects(display_order);
CREATE INDEX IF NOT EXISTS idx_media_case_study_id ON public.media_assets(case_study_id);
CREATE INDEX IF NOT EXISTS idx_media_target_section ON public.media_assets(target_section);
CREATE INDEX IF NOT EXISTS idx_media_status ON public.media_assets(status);

-- 6. Trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_portfolio_projects_updated_at ON public.portfolio_projects;
CREATE TRIGGER trg_portfolio_projects_updated_at
BEFORE UPDATE ON public.portfolio_projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_media_assets_updated_at ON public.media_assets;
CREATE TRIGGER trg_media_assets_updated_at
BEFORE UPDATE ON public.media_assets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 7. Row Level Security (RLS) Configuration
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_logos ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "Public can view published portfolio projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Allow anon all on portfolio projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Public can view published media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Allow anon all on media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Public can view brands" ON public.brand_logos;
DROP POLICY IF EXISTS "Allow anon all on brands" ON public.brand_logos;

-- Public READ access
CREATE POLICY "Public can view published portfolio projects"
ON public.portfolio_projects FOR SELECT
USING (status = 'published');

CREATE POLICY "Public can view published media assets"
ON public.media_assets FOR SELECT
USING (status = 'published');

CREATE POLICY "Public can view brands"
ON public.brand_logos FOR SELECT
USING (true);

-- Admin CRUD access (using anon/authenticated API key)
CREATE POLICY "Allow anon all on portfolio projects"
ON public.portfolio_projects FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon all on media assets"
ON public.media_assets FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon all on brands"
ON public.brand_logos FOR ALL
USING (true)
WITH CHECK (true);

-- 8. Supabase Storage Bucket Setup (betodata & portfolio-media)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('betodata', 'betodata', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf']),
    ('portfolio-media', 'portfolio-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf'];

-- Clean storage policies
DROP POLICY IF EXISTS "Public View Portfolio Media" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Upload Portfolio Media" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Update Portfolio Media" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Delete Portfolio Media" ON storage.objects;

-- Storage Policies for public read and client upload
CREATE POLICY "Public View Portfolio Media"
ON storage.objects FOR SELECT
USING (bucket_id IN ('betodata', 'portfolio-media'));

CREATE POLICY "Allow Public Upload Portfolio Media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('betodata', 'portfolio-media'));

CREATE POLICY "Allow Public Update Portfolio Media"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('betodata', 'portfolio-media'));

CREATE POLICY "Allow Public Delete Portfolio Media"
ON storage.objects FOR DELETE
USING (bucket_id IN ('betodata', 'portfolio-media'));


-- ============================================================================
-- BETROVERSE PRODUCTION SEED DATA: ALL 16 PORTFOLIO CASE STUDIES
-- Idempotent Upsert Script: Safe to execute on existing database
-- ============================================================================

INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-mylaban', 'mylaban', 'MyLaban', 'MyLaban', 'Creative Branding & Social Campaign', 'Food & Beverage Dessert Lounge', 'MyLaban Dessert Shop', '2024 - 2025', 'published',
    'images/Picsart_25-09-24_21-31-47-226.png', 'images/p1.jpg', 'images/p1.jpg', 'Specialty dessert shop branding and high-converting social media marketing campaign in Kochi.', 'MyLaban is a popular dessert shop in Kochi specializing in authentic Egyptian desserts and premium sweet treats. The brand is known for its rich flavors, high-quality ingredients, and beautifully crafted desserts that offer a unique experience for every customer.', 'Started with a passion for authentic Middle Eastern sweet delicacies, MyLaban brought traditional Egyptian dessert recipes to Kochi with a modern culinary twist. The brand needed visual storytelling that reflected its premium ingredients and signature presentation.',
    'Expand brand reach across Kerala, drive store footfall to the Kochi dessert lounge, and establish a viral short-form video presence across Instagram Reels and TikTok.', 'Craft a comprehensive brand identity, mouth-watering food photography, viral AI video reels, and aesthetic social media campaigns to maximize engagement.', '["Creative Design","Social Media Management","Video Production","AI Video Creation","Video Content Creation","Brand Identity","Photography"]'::jsonb, '{"challenge":"Differentiating MyLaban in a competitive food scene by highlighting unique Egyptian dessert flavors.","strategy":"Developing viral short-form video reels, AI-enhanced food visuals, and aesthetic Instagram layouts.","solution":"Creating mouth-watering video content showcasing signature desserts and authentic preparation techniques.","execution":"Multichannel distribution across Instagram, YouTube Shorts, and local influencer campaigns.","results":"Over 500k video views and a significant surge in store footfall and brand engagement."}'::jsonb, '{"gallery":["images/p1.jpg","images/p5.jpg","images/s1.jpg","images/p7.jpg","images/s8.jpg"],"videos":[],"mockups":{"desktop":"images/p1.jpg","tablet":"images/p5.jpg","mobile":"images/s1.jpg"}}'::jsonb, '{"stat1Num":"+500K","stat1Label":"Social Reel Views","stat2Num":"+60%","stat2Label":"Footfall Growth","stat3Num":"4.2x","stat3Label":"ROI Increase","stat4Num":"100%","stat4Label":"Brand Satisfaction","feedbackQuote":"Betroverse completely transformed our video marketing. Their reels and short-form content brought us viral traction and customer engagement!","feedbackAuthor":"MyLaban Founder","feedbackRole":"Kochi Dessert Lounge"}'::jsonb, '{"title":"MyLaban Case Study | Creative Branding & Video Production by Betroverse","description":"Explore how Betroverse built viral video campaigns, brand strategy, and social media growth for MyLaban Dessert Shop.","keywords":"MyLaban, dessert branding, video production, Kochi marketing, Betroverse","ogImage":"images/p1.jpg","canonicalUrl":"https://betroverse.in/portfolio/mylaban"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 0
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-mylaban-gal-0', 'cs-mylaban', 'mylaban', 'image', 'creative_showcase', 'images/p1.jpg', 'p1.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-mylaban-gal-1', 'cs-mylaban', 'mylaban', 'image', 'creative_showcase', 'images/p5.jpg', 'p5.jpg', 1, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-mylaban-gal-2', 'cs-mylaban', 'mylaban', 'image', 'creative_showcase', 'images/s1.jpg', 's1.jpg', 2, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-mylaban-gal-3', 'cs-mylaban', 'mylaban', 'image', 'creative_showcase', 'images/p7.jpg', 'p7.jpg', 3, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-mylaban-gal-4', 'cs-mylaban', 'mylaban', 'image', 'creative_showcase', 'images/s8.jpg', 's8.jpg', 4, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-sa-adiya', 'sa-adiya', 'Sa-Adiya Golden Jubilee', 'Sa-Adiya Golden Jubilee', 'Event Branding & Celebration Collateral', 'Event Branding & Academic Institutions', 'Sa-Adiya Foundation', '2024 - 2025', 'published',
    'images/golden.png', 'images/p2.jpg', 'images/p2.jpg', 'Flyers, registration guidelines, and social media announcements for Sa-Adiya''s grand Golden Jubilee celebrations.', 'We designed promotional flyers, registration guidelines, and social media announcements for Sa-Adiya''s grand Golden Jubilee celebrations.', 'Celebrating 50 years of educational and community service with a landmark Jubilee convention.',
    'Unify event communication, guide registrations, and create memorable celebratory visuals.', 'Deliver golden-themed stage graphics, registration notices, and commemorative flyers.', '["Creative Design","Social Media Management","Event Branding","Print Collateral"]'::jsonb, '{"challenge":"Designing elegant, cohesive event branding suitable for a major 50-year celebration.","strategy":"Using golden thematic elements, clear typography, and structured announcement layouts.","solution":"Creating registration notices, event schedules, and ceremonial posters.","execution":"Multichannel distribution via social media platforms and print media flyers.","results":"Widespread community reach and successful event attendance across all sessions."}'::jsonb, '{"gallery":["images/p2.jpg","images/p7.jpg","images/s2.jpg","images/s7.jpg"],"videos":[],"mockups":{"desktop":"images/p2.jpg","tablet":"images/p2.jpg","mobile":"images/p2.jpg"}}'::jsonb, '{"stat1Num":"+100K","stat1Label":"Event Reach","stat2Num":"50 Yrs","stat2Label":"Celebrated Legacy","stat3Num":"100%","stat3Label":"Participation","stat4Num":"100%","stat4Label":"Satisfaction","feedbackQuote":"The Golden Jubilee event banners and flyers designed by Betroverse added immense prestige to our 50-year celebrations.","feedbackAuthor":"Sa-Adiya Jubilee Committee","feedbackRole":"Educational Foundation"}'::jsonb, '{"title":"Sa-Adiya Golden Jubilee Case Study | Event Branding by Betroverse","description":"Explore Sa-Adiya''s Golden Jubilee event branding, ceremonial flyers, and social media campaigns created by Betroverse.","keywords":"Sa-Adiya, Golden Jubilee, event branding, Betroverse","ogImage":"images/p2.jpg","canonicalUrl":"https://betroverse.in/portfolio/sa-adiya"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 1
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-sa-adiya-gal-0', 'cs-sa-adiya', 'sa-adiya', 'image', 'creative_showcase', 'images/p2.jpg', 'p2.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-sa-adiya-gal-1', 'cs-sa-adiya', 'sa-adiya', 'image', 'creative_showcase', 'images/p7.jpg', 'p7.jpg', 1, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-sa-adiya-gal-2', 'cs-sa-adiya', 'sa-adiya', 'image', 'creative_showcase', 'images/s2.jpg', 's2.jpg', 2, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-sa-adiya-gal-3', 'cs-sa-adiya', 'sa-adiya', 'image', 'creative_showcase', 'images/s7.jpg', 's7.jpg', 3, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-toi-cafe', 'toi-cafe', 'Toi Cafe', 'Toi Cafe', 'Specialty Cafe & Visual Branding', 'Specialty Coffee & Desserts', 'Toi Cafe & Dessert Lounge', '2024 - 2025', 'published',
    'images/toi.png', 'images/p3.jpg', 'images/p3.jpg', 'Aesthetic social media campaign, specialty beverage photography, and custom menu layout design.', 'Toi Cafe is a specialty coffee shop and dessert lounge. We designed a series of aesthetic social media posts, promotional campaigns, and menus to highlight their unique sweet and savory offerings.', 'Toi Cafe was founded to create a warm, aesthetic haven for specialty coffee enthusiasts. The brand needed creative collateral matching its serene ambiance.',
    'Increase weekend cafe traffic, promote signature cold brews, and establish a cohesive warm-toned visual theme online.', 'Deliver high-end beverage photography, custom menu cards, and targeted social ad campaigns.', '["Creative Design","Social Media Management","Photography","Menu Layout Design","Branding"]'::jsonb, '{"challenge":"Positioning Toi Cafe as the top aesthetic coffee & dessert spot for youth and coffee lovers.","strategy":"High-end beverage photography, warm coffee tone palettes, and clean grid layouts.","solution":"Designing elegant menus and weekly social media highlights featuring signature brews.","execution":"Professional photo shoots and targeted digital ad campaigns.","results":"Substantial increase in cafe weekend visits and online social engagement."}'::jsonb, '{"gallery":["images/p3.jpg","images/p6.jpg","images/s4.jpg","images/s3.jpg","images/p8.jpg"],"videos":[],"mockups":{"desktop":"images/p3.jpg","tablet":"images/p6.jpg","mobile":"images/s4.jpg"}}'::jsonb, '{"stat1Num":"+350K","stat1Label":"Social Reach","stat2Num":"+50%","stat2Label":"Weekend Customer Increase","stat3Num":"3.0x","stat3Label":"ROI Impact","stat4Num":"100%","stat4Label":"Client Approval","feedbackQuote":"The aesthetic social media posts and menu layouts designed by Betroverse captured our cafe''s vibe perfectly!","feedbackAuthor":"Toi Cafe Team","feedbackRole":"Specialty Cafe & Lounge"}'::jsonb, '{"title":"Toi Cafe Case Study | Specialty Coffee Branding by Betroverse","description":"Discover Toi Cafe''s menu design, beverage photography, and aesthetic social media campaigns created by Betroverse.","keywords":"Toi Cafe, coffee branding, menu design, Betroverse","ogImage":"images/p3.jpg","canonicalUrl":"https://betroverse.in/portfolio/toi-cafe"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 2
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-toi-cafe-gal-0', 'cs-toi-cafe', 'toi-cafe', 'image', 'creative_showcase', 'images/p3.jpg', 'p3.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-toi-cafe-gal-1', 'cs-toi-cafe', 'toi-cafe', 'image', 'creative_showcase', 'images/p6.jpg', 'p6.jpg', 1, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-toi-cafe-gal-2', 'cs-toi-cafe', 'toi-cafe', 'image', 'creative_showcase', 'images/s4.jpg', 's4.jpg', 2, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-toi-cafe-gal-3', 'cs-toi-cafe', 'toi-cafe', 'image', 'creative_showcase', 'images/s3.jpg', 's3.jpg', 3, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-toi-cafe-gal-4', 'cs-toi-cafe', 'toi-cafe', 'image', 'creative_showcase', 'images/p8.jpg', 'p8.jpg', 4, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-ph-mobiles', 'ph-mobiles', 'PH Mobiles', 'PH Mobiles', 'Retail Marketing & Visual Advertising', 'Smartphone & Electronics Retail', 'PH Mobiles Retail', '2024 - 2025', 'published',
    'images/NiceMobiles.png', 'images/p4.jpg', 'images/p4.jpg', 'Product layouts, festival offer graphics, and visual flyers for smartphone retail campaigns.', 'PH Mobiles is a trusted retail center for smartphones and home appliances. We developed their visual flyers, festival offer announcements, and product layouts.', 'Providing top-tier mobile phones and appliances with local trust and warranty support across retail stores.',
    'Boost holiday store walk-ins, promote trade-in deals, and launch high-impact retail banners.', 'Create eye-catching retail offer graphics and digital marketing flyers for fast conversion.', '["Creative Design","Social Media Management","Promo Campaigns","Print Layouts"]'::jsonb, '{"challenge":"Standing out in competitive smartphone retail markets during seasonal sales.","strategy":"Creating vibrant product graphics with clear pricing badges and instant call-to-actions.","solution":"Designing digital trade-in flyers and high-resolution festival offer banners.","execution":"Multichannel broadcast on social media and print distribution across retail outlets.","results":"Increased retail inquiries and store sales conversion during promo periods."}'::jsonb, '{"gallery":["images/p4.jpg","images/s5.jpg","images/s6.jpg","images/p8.jpg"],"videos":[],"mockups":{"desktop":"images/p4.jpg","tablet":"images/s5.jpg","mobile":"images/p4.jpg"}}'::jsonb, '{"stat1Num":"+200K","stat1Label":"Ad Impressions","stat2Num":"+40%","stat2Label":"Store Inquiries","stat3Num":"2.8x","stat3Label":"Sales Boost","stat4Num":"100%","stat4Label":"Satisfaction","feedbackQuote":"Betroverse designed outstanding promotional graphics for our festival sales, significantly boosting store traffic!","feedbackAuthor":"PH Mobiles Leadership","feedbackRole":"Smartphone Retail Store"}'::jsonb, '{"title":"PH Mobiles Case Study | Retail Marketing by Betroverse","description":"See how Betroverse created smartphone promotion flyers and retail campaigns for PH Mobiles.","keywords":"PH Mobiles, retail marketing, smartphone flyers, Betroverse","ogImage":"images/p4.jpg","canonicalUrl":"https://betroverse.in/portfolio/ph-mobiles"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 3
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-ph-mobiles-gal-0', 'cs-ph-mobiles', 'ph-mobiles', 'image', 'creative_showcase', 'images/p4.jpg', 'p4.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-ph-mobiles-gal-1', 'cs-ph-mobiles', 'ph-mobiles', 'image', 'creative_showcase', 'images/s5.jpg', 's5.jpg', 1, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-ph-mobiles-gal-2', 'cs-ph-mobiles', 'ph-mobiles', 'image', 'creative_showcase', 'images/s6.jpg', 's6.jpg', 2, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-ph-mobiles-gal-3', 'cs-ph-mobiles', 'ph-mobiles', 'image', 'creative_showcase', 'images/p8.jpg', 'p8.jpg', 3, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-mylaban-dessert', 'mylaban-dessert-shop', 'MyLaban Dessert Shop', 'MyLaban Dessert Shop', 'Content Creation & Video Production', 'Dessert & Food Lounge', 'MyLaban Desserts', '2024 - 2025', 'published',
    'images/Picsart_25-09-24_21-31-47-226.png', 'images/p5.jpg', 'images/p5.jpg', 'Creative dessert video production and digital showcase.', 'MyLaban is a popular dessert shop in Kochi specializing in authentic Egyptian desserts.', 'Showcasing signature Middle Eastern delicacies with engaging video content.',
    'Boost social engagement and drive dessert lovers to the store.', '', '["Creative Design","Social Media Management","Video Production"]'::jsonb, '{"challenge":"Capturing dessert textures in video.","strategy":"High-frame-rate food shoots.","solution":"Cinematic reel edits.","execution":"Instagram Reels launch.","results":"High customer interaction."}'::jsonb, '{"gallery":["images/p5.jpg"],"videos":[],"mockups":{"desktop":"images/p5.jpg","tablet":"images/p5.jpg","mobile":"images/p5.jpg"}}'::jsonb, '{"stat1Num":"+300K","stat1Label":"Views","stat2Num":"+45%","stat2Label":"Orders","stat3Num":"3.5x","stat3Label":"ROI","stat4Num":"100%","stat4Label":"Satisfaction"}'::jsonb, '{"title":"MyLaban Dessert Shop Case Study","description":"Video content and creative branding for MyLaban Dessert Shop.","keywords":"MyLaban, video production","ogImage":"images/p5.jpg","canonicalUrl":"https://betroverse.in/portfolio/mylaban-dessert-shop"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 4
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-mylaban-dessert-gal-0', 'cs-mylaban-dessert', 'mylaban-dessert-shop', 'image', 'creative_showcase', 'images/p5.jpg', 'p5.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-toi-cafe-photo', 'toi-cafe-photography', 'Toi Cafe Photography', 'Toi Cafe Photography', 'Photography & Social Ads', 'Cafe & Beverage', 'Toi Cafe', '2024 - 2025', 'published',
    'images/toi.png', 'images/p6.jpg', 'images/p6.jpg', 'Premium photography assets and specialty coffee marketing.', 'High-end product photography and social media ad visuals for Toi Cafe.', 'Highlighting handcrafted cold brews and pastries with aesthetic photography.',
    'Establish a luxury cafe aesthetic across digital channels.', '', '["Photography","Social Media Management","Creative Design"]'::jsonb, '{"challenge":"Creating consistent aesthetic imagery.","strategy":"Dedicated food photography sessions.","solution":"Curated Instagram grid.","execution":"Digital advertising.","results":"Increased brand reputation."}'::jsonb, '{"gallery":["images/p6.jpg"],"videos":[],"mockups":{"desktop":"images/p6.jpg","tablet":"images/p6.jpg","mobile":"images/p6.jpg"}}'::jsonb, '{"stat1Num":"+250K","stat1Label":"Reach","stat2Num":"+40%","stat2Label":"Walk-ins","stat3Num":"2.9x","stat3Label":"ROI","stat4Num":"100%","stat4Label":"Satisfaction"}'::jsonb, '{"title":"Toi Cafe Photography Case Study","description":"Food & beverage photography for Toi Cafe.","keywords":"Toi Cafe, photography","ogImage":"images/p6.jpg","canonicalUrl":"https://betroverse.in/portfolio/toi-cafe-photography"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 5
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-toi-cafe-photo-gal-0', 'cs-toi-cafe-photo', 'toi-cafe-photography', 'image', 'creative_showcase', 'images/p6.jpg', 'p6.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-gurumitra', 'gurumitra-foundation', 'Gurumitra Foundation', 'Gurumitra Foundation', 'Educational Design & Print', 'Education & Non-Profit', 'Gurumitra Foundation', '2024 - 2025', 'published',
    'images/Gurumitra.png', 'images/p7.jpg', 'images/p7.jpg', 'Clean print brochures and notice layouts for academic outreach.', 'Informative promotional collateral for academic support programs.', 'Empowering students through accessible academic guidance.',
    'Inform parents and students about academic enrollment programs.', '', '["Creative Design","Print Layout","Branding"]'::jsonb, '{"challenge":"Presenting detailed educational data cleanly.","strategy":"Modular grid layouts.","solution":"Clear brochures.","execution":"Print & PDF distribution.","results":"High enrollment intake."}'::jsonb, '{"gallery":["images/p7.jpg"],"videos":[],"mockups":{"desktop":"images/p7.jpg","tablet":"images/p7.jpg","mobile":"images/p7.jpg"}}'::jsonb, '{"stat1Num":"+50K","stat1Label":"Brochures Delivered","stat2Num":"+80%","stat2Label":"Enrollment Intake","stat3Num":"4.0x","stat3Label":"Outreach","stat4Num":"100%","stat4Label":"Satisfaction"}'::jsonb, '{"title":"Gurumitra Foundation Case Study","description":"Educational print collateral for Gurumitra Foundation.","keywords":"Gurumitra, education","ogImage":"images/p7.jpg","canonicalUrl":"https://betroverse.in/portfolio/gurumitra-foundation"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 6
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-gurumitra-gal-0', 'cs-gurumitra', 'gurumitra-foundation', 'image', 'creative_showcase', 'images/p7.jpg', 'p7.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-nice-mobiles', 'nice-mobiles', 'Nice Mobiles', 'Nice Mobiles', 'Promo Campaigns & Retail Banners', 'Electronics Retail', 'Nice Mobiles Retail', '2024 - 2025', 'published',
    'images/NiceMobiles.png', 'images/p8.jpg', 'images/p8.jpg', 'Holiday promotional graphics and discount visual flyers.', 'Promotional graphics for holiday retail sales and mobile trade-in offers.', 'Top mobile retail store offering festive smartphone discounts.',
    'Drive foot traffic and increase retail trade-ins.', '', '["Creative Design","Social Media Management","Promo Campaigns"]'::jsonb, '{"challenge":"Capturing holiday shopper attention.","strategy":"Vibrant discount badges.","solution":"Digital offer banners.","execution":"Social ads.","results":"Record store sales."}'::jsonb, '{"gallery":["images/p8.jpg"],"videos":[],"mockups":{"desktop":"images/p8.jpg","tablet":"images/p8.jpg","mobile":"images/p8.jpg"}}'::jsonb, '{"stat1Num":"+400K","stat1Label":"Ad Views","stat2Num":"+65%","stat2Label":"Sales Growth","stat3Num":"3.8x","stat3Label":"ROI","stat4Num":"100%","stat4Label":"Satisfaction"}'::jsonb, '{"title":"Nice Mobiles Case Study","description":"Retail promo campaigns for Nice Mobiles.","keywords":"Nice Mobiles, retail promo","ogImage":"images/p8.jpg","canonicalUrl":"https://betroverse.in/portfolio/nice-mobiles"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 7
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-nice-mobiles-gal-0', 'cs-nice-mobiles', 'nice-mobiles', 'image', 'creative_showcase', 'images/p8.jpg', 'p8.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-mylaban-identity', 'mylaban-brand-identity', 'MyLaban Brand Identity', 'MyLaban Brand Identity', 'AI Video Production', 'Food & Beverage', 'MyLaban', '2024 - 2025', 'published',
    'images/Picsart_25-09-24_21-31-47-226.png', 'images/s1.jpg', 'images/s1.jpg', 'AI video creation for signature dessert visual promotions.', 'AI video generation and dynamic visual effects for dessert advertising.', 'Integrating cutting-edge AI technology into visual food branding.',
    'Create viral short-form video commercials.', '', '["AI Video Creation","Video Production","Creative Design"]'::jsonb, '{"challenge":"Standing out on Instagram Reels.","strategy":"AI-enhanced motion graphics.","solution":"Viral reel series.","execution":"Social rollout.","results":"Massive organic reach."}'::jsonb, '{"gallery":["images/s1.jpg"],"videos":[],"mockups":{"desktop":"images/s1.jpg","tablet":"images/s1.jpg","mobile":"images/s1.jpg"}}'::jsonb, '{"stat1Num":"+600K","stat1Label":"Reel Impressions","stat2Num":"+75%","stat2Label":"Engagement","stat3Num":"4.5x","stat3Label":"ROI","stat4Num":"100%","stat4Label":"Satisfaction"}'::jsonb, '{"title":"MyLaban Brand Identity Case Study","description":"AI video creation for MyLaban.","keywords":"AI video, MyLaban","ogImage":"images/s1.jpg","canonicalUrl":"https://betroverse.in/portfolio/mylaban-brand-identity"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 8
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-mylaban-identity-gal-0', 'cs-mylaban-identity', 'mylaban-brand-identity', 'image', 'creative_showcase', 'images/s1.jpg', 's1.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-nahdi-mandi', 'nahdi-mandi', 'Nahdi Mandi', 'Nahdi Mandi', 'Social Media Ads & Branding', 'Traditional Dining & Mandi', 'Nahdi Mandi Restaurant', '2024 - 2025', 'published',
    'images/Nahdimandi-white.png', 'images/s2.jpg', 'images/s2.jpg', 'Arabic dining flyers and promotional visual banners.', 'Authentic Arabic restaurant branding and promotional campaign graphics.', 'Bringing genuine Mandi flavors to food enthusiasts with cultural aesthetic graphics.',
    'Boost dinner dining reservations and weekend orders.', '', '["Creative Design","Social Media Management","Branding"]'::jsonb, '{"challenge":"Promoting authentic Arabic dining experiences.","strategy":"Rich culinary photography.","solution":"Promotional dining banners.","execution":"Local targeted ads.","results":"Increased dining bookings."}'::jsonb, '{"gallery":["images/s2.jpg"],"videos":[],"mockups":{"desktop":"images/s2.jpg","tablet":"images/s2.jpg","mobile":"images/s2.jpg"}}'::jsonb, '{"stat1Num":"+300K","stat1Label":"Ad Reach","stat2Num":"+55%","stat2Label":"Table Reservations","stat3Num":"3.2x","stat3Label":"ROI","stat4Num":"100%","stat4Label":"Satisfaction"}'::jsonb, '{"title":"Nahdi Mandi Case Study","description":"Social media marketing and branding for Nahdi Mandi.","keywords":"Nahdi Mandi, dining ads","ogImage":"images/s2.jpg","canonicalUrl":"https://betroverse.in/portfolio/nahdi-mandi"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 9
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-nahdi-mandi-gal-0', 'cs-nahdi-mandi', 'nahdi-mandi', 'image', 'creative_showcase', 'images/s2.jpg', 's2.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-celes', 'celes-lifestyle', 'Celes Lifestyle', 'Celes Lifestyle', 'Luxury Campaign & Aesthetics', 'Luxury Fashion & Lifestyle', 'Celes Lifestyle', '2024 - 2025', 'published',
    'images/celes.png', 'images/s3.jpg', 'images/s3.jpg', 'Minimalist marketing assets and aesthetic Instagram layout grids.', 'High-end luxury campaign collateral and Instagram grid layout branding.', 'Exclusive lifestyle brand showcasing minimalist elegance.',
    'Establish high-end brand perception among luxury consumers.', '', '["Creative Design","Social Media Management","Luxury Branding"]'::jsonb, '{"challenge":"Conveying exclusivity and refined aesthetics.","strategy":"Minimalist typography & monochrome palettes.","solution":"Curated grid layouts.","execution":"Instagram showcase.","results":"High brand prestige."}'::jsonb, '{"gallery":["images/s3.jpg"],"videos":[],"mockups":{"desktop":"images/s3.jpg","tablet":"images/s3.jpg","mobile":"images/s3.jpg"}}'::jsonb, '{"stat1Num":"+180K","stat1Label":"Impressions","stat2Num":"+50%","stat2Label":"Brand Inquiries","stat3Num":"3.1x","stat3Label":"ROI","stat4Num":"100%","stat4Label":"Satisfaction"}'::jsonb, '{"title":"Celes Lifestyle Case Study","description":"Luxury branding and aesthetic design for Celes Lifestyle.","keywords":"Celes, luxury branding","ogImage":"images/s3.jpg","canonicalUrl":"https://betroverse.in/portfolio/celes-lifestyle"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 10
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-celes-gal-0', 'cs-celes', 'celes-lifestyle', 'image', 'creative_showcase', 'images/s3.jpg', 's3.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-toi-cafe-aesthetics', 'toi-cafe-aesthetics', 'Toi Cafe Aesthetics', 'Toi Cafe Aesthetics', 'Branding Design & Menu Layout', 'Cafe & Desserts', 'Toi Cafe', '2024 - 2025', 'published',
    'images/toi.png', 'images/s4.jpg', 'images/s4.jpg', 'Menu and beverage promotions with premium visual layout.', 'Custom menu cards and beverage promotional layouts for Toi Cafe.', 'Crafting beautiful menu layouts for specialty beverage lovers.',
    'Enhance customer ordering experience at the cafe.', '', '["Menu Layout Design","Creative Design","Branding"]'::jsonb, '{"challenge":"Creating a clear, elegant menu.","strategy":"Clean typography & beverage icons.","solution":"Laminated print menus & digital version.","execution":"In-store deployment.","results":"Positive customer feedback."}'::jsonb, '{"gallery":["images/s4.jpg"],"videos":[],"mockups":{"desktop":"images/s4.jpg","tablet":"images/s4.jpg","mobile":"images/s4.jpg"}}'::jsonb, '{"stat1Num":"+150K","stat1Label":"Views","stat2Num":"+35%","stat2Label":"Beverage Sales","stat3Num":"2.7x","stat3Label":"ROI","stat4Num":"100%","stat4Label":"Satisfaction"}'::jsonb, '{"title":"Toi Cafe Aesthetics Case Study","description":"Menu design and aesthetic branding for Toi Cafe.","keywords":"Toi Cafe, menu design","ogImage":"images/s4.jpg","canonicalUrl":"https://betroverse.in/portfolio/toi-cafe-aesthetics"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 11
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-toi-cafe-aesthetics-gal-0', 'cs-toi-cafe-aesthetics', 'toi-cafe-aesthetics', 'image', 'creative_showcase', 'images/s4.jpg', 's4.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-nice-mobiles-retail', 'nice-mobiles-retail', 'Nice Mobiles Retail', 'Nice Mobiles Retail', 'Sales Advertising & Promo', 'Retail Smartphone Sales', 'Nice Mobiles', '2024 - 2025', 'published',
    'images/NiceMobiles.png', 'images/s5.jpg', 'images/s5.jpg', 'Engaging flyers for mobile trade-in campaigns.', 'Retail flyers and advertising visuals for trade-in discount campaigns.', 'Empowering customers to upgrade smartphones effortlessly.',
    'Maximize mobile exchange program participation.', '', '["Creative Design","Promo Campaigns","Print Layout"]'::jsonb, '{"challenge":"Communicating exchange values clearly.","strategy":"Comparison flyers with value badges.","solution":"Visual promo flyers.","execution":"In-store and digital blast.","results":"High exchange volume."}'::jsonb, '{"gallery":["images/s5.jpg"],"videos":[],"mockups":{"desktop":"images/s5.jpg","tablet":"images/s5.jpg","mobile":"images/s5.jpg"}}'::jsonb, '{"stat1Num":"+220K","stat1Label":"Ad Reach","stat2Num":"+48%","stat2Label":"Trade-ins","stat3Num":"3.0x","stat3Label":"ROI","stat4Num":"100%","stat4Label":"Satisfaction"}'::jsonb, '{"title":"Nice Mobiles Retail Case Study","description":"Trade-in sales advertising for Nice Mobiles.","keywords":"Nice Mobiles, trade-in ads","ogImage":"images/s5.jpg","canonicalUrl":"https://betroverse.in/portfolio/nice-mobiles-retail"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 12
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-nice-mobiles-retail-gal-0', 'cs-nice-mobiles-retail', 'nice-mobiles-retail', 'image', 'creative_showcase', 'images/s5.jpg', 's5.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-nahdi-mandi-rest', 'nahdi-mandi-restaurant', 'Nahdi Mandi Restaurant', 'Nahdi Mandi Restaurant', 'Visual Marketing & Menu', 'Restaurant & Catering', 'Nahdi Mandi', '2024 - 2025', 'published',
    'images/Nahdimandi-white.png', 'images/s6.jpg', 'images/s6.jpg', 'Menu announcement graphics and specialty dish posts.', 'Promotional culinary banners for new authentic Mandi dish launches.', 'Celebrating traditional Arabic family dining with vibrant food posters.',
    'Promote new dish additions to weekend family diners.', '', '["Creative Design","Social Media Management"]'::jsonb, '{"challenge":"Highlighting new menu items.","strategy":"Rich photography & call-to-action badges.","solution":"Dish announcement graphics.","execution":"Social ads.","results":"Increased dish sales."}'::jsonb, '{"gallery":["images/s6.jpg"],"videos":[],"mockups":{"desktop":"images/s6.jpg","tablet":"images/s6.jpg","mobile":"images/s6.jpg"}}'::jsonb, '{"stat1Num":"+280K","stat1Label":"Reach","stat2Num":"+52%","stat2Label":"Dish Sales","stat3Num":"3.3x","stat3Label":"ROI","stat4Num":"100%","stat4Label":"Satisfaction"}'::jsonb, '{"title":"Nahdi Mandi Restaurant Case Study","description":"Menu launch marketing for Nahdi Mandi.","keywords":"Nahdi Mandi, food marketing","ogImage":"images/s6.jpg","canonicalUrl":"https://betroverse.in/portfolio/nahdi-mandi-restaurant"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 13
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-nahdi-mandi-rest-gal-0', 'cs-nahdi-mandi-rest', 'nahdi-mandi-restaurant', 'image', 'creative_showcase', 'images/s6.jpg', 's6.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-celes-brand', 'celes-lifestyle-brand', 'Celes Lifestyle Brand', 'Celes Lifestyle Brand', 'Social Management & Branding', 'Lifestyle & Apparel', 'Celes', '2024 - 2025', 'published',
    'images/celes.png', 'images/s7.jpg', 'images/s7.jpg', 'Aesthetic branding layout for events and campaigns.', 'Social media strategy and aesthetic event branding collateral for Celes.', 'A stylish lifestyle brand inspiring contemporary elegance.',
    'Grow social community and drive event attendance.', '', '["Social Media Management","Creative Design","Branding"]'::jsonb, '{"challenge":"Building strong brand loyalty.","strategy":"Consistent visual aesthetics.","solution":"Campaign layouts.","execution":"Monthly social content.","results":"Steady follower growth."}'::jsonb, '{"gallery":["images/s7.jpg"],"videos":[],"mockups":{"desktop":"images/s7.jpg","tablet":"images/s7.jpg","mobile":"images/s7.jpg"}}'::jsonb, '{"stat1Num":"+190K","stat1Label":"Impressions","stat2Num":"+42%","stat2Label":"Follower Growth","stat3Num":"2.8x","stat3Label":"ROI","stat4Num":"100%","stat4Label":"Satisfaction"}'::jsonb, '{"title":"Celes Lifestyle Brand Case Study","description":"Social media management for Celes Lifestyle Brand.","keywords":"Celes, social management","ogImage":"images/s7.jpg","canonicalUrl":"https://betroverse.in/portfolio/celes-lifestyle-brand"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 14
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-celes-brand-gal-0', 'cs-celes-brand', 'celes-lifestyle-brand', 'image', 'creative_showcase', 'images/s7.jpg', 's7.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;
INSERT INTO public.portfolio_projects (
    id, slug, company_name, title, category, industry, client_name, year, status,
    company_logo, card_image, hero_image, short_intro, full_description, brand_story,
    brand_goals, project_objective, services, overview, media, results, seo,
    gallery_sections, blocks, section_visibility, section_order, display_order
) VALUES (
    'cs-independent', 'independent', 'Independent Designs', 'Independent Designs', 'Graphic Showcase & Posters', 'Creative Design & Typography', 'Betroverse Studio', '2024 - 2025', 'published',
    'images/logo.png', 'images/s8.jpg', 'images/s8.jpg', 'A collection of typographic layout poster assets.', 'A showcase of custom typographic layouts, flyer designs, and visual branding assets.', 'Exploring creative boundaries with experimental typography and visual art.',
    'Demonstrate Betroverse''s versatile graphic design capabilities.', '', '["Creative Design","Branding","Typography"]'::jsonb, '{"challenge":"Showcasing creative graphic design skills.","strategy":"Diverse typographic styles.","solution":"Portfolio poster gallery.","execution":"Digital showcase.","results":"Inbound design leads."}'::jsonb, '{"gallery":["images/s8.jpg"],"videos":[],"mockups":{"desktop":"images/s8.jpg","tablet":"images/s8.jpg","mobile":"images/s8.jpg"}}'::jsonb, '{"stat1Num":"+120K","stat1Label":"Views","stat2Num":"+38%","stat2Label":"Design Leads","stat3Num":"3.0x","stat3Label":"ROI","stat4Num":"100%","stat4Label":"Satisfaction"}'::jsonb, '{"title":"Independent Designs Case Study","description":"Typographic posters and graphic design showcase by Betroverse.","keywords":"graphic design, typography, Betroverse","ogImage":"images/s8.jpg","canonicalUrl":"https://betroverse.in/portfolio/independent"}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 15
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    industry = EXCLUDED.industry,
    client_name = EXCLUDED.client_name,
    year = EXCLUDED.year,
    status = EXCLUDED.status,
    company_logo = EXCLUDED.company_logo,
    card_image = EXCLUDED.card_image,
    hero_image = EXCLUDED.hero_image,
    short_intro = EXCLUDED.short_intro,
    full_description = EXCLUDED.full_description,
    brand_story = EXCLUDED.brand_story,
    brand_goals = EXCLUDED.brand_goals,
    project_objective = EXCLUDED.project_objective,
    services = EXCLUDED.services,
    overview = EXCLUDED.overview,
    media = EXCLUDED.media,
    results = EXCLUDED.results,
    seo = EXCLUDED.seo,
    display_order = EXCLUDED.display_order;

INSERT INTO public.media_assets (id, case_study_id, case_study_slug, type, target_section, url, name, display_order, status)
VALUES ('media-cs-independent-gal-0', 'cs-independent', 'independent', 'image', 'creative_showcase', 'images/s8.jpg', 's8.jpg', 0, 'published')
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;

-- Seed Brand Logos
INSERT INTO public.brand_logos (id, src, name, style, display_order)
VALUES ('brand-1', 'images/golden.png', 'Sa-Adiya Golden Jubilee', '', 0)
ON CONFLICT (id) DO UPDATE SET src = EXCLUDED.src, name = EXCLUDED.name, display_order = EXCLUDED.display_order;
INSERT INTO public.brand_logos (id, src, name, style, display_order)
VALUES ('brand-2', 'images/celes.png', 'Celes Lifestyle', '', 1)
ON CONFLICT (id) DO UPDATE SET src = EXCLUDED.src, name = EXCLUDED.name, display_order = EXCLUDED.display_order;
INSERT INTO public.brand_logos (id, src, name, style, display_order)
VALUES ('brand-3', 'images/toi.png', 'Toi Cafe', 'width: 40%;', 2)
ON CONFLICT (id) DO UPDATE SET src = EXCLUDED.src, name = EXCLUDED.name, display_order = EXCLUDED.display_order;
INSERT INTO public.brand_logos (id, src, name, style, display_order)
VALUES ('brand-4', 'images/AlainArchitecture.png', 'Alain Architecture', '', 3)
ON CONFLICT (id) DO UPDATE SET src = EXCLUDED.src, name = EXCLUDED.name, display_order = EXCLUDED.display_order;
INSERT INTO public.brand_logos (id, src, name, style, display_order)
VALUES ('brand-5', 'images/Gurumitra.png', 'Gurumitra Foundation', '', 4)
ON CONFLICT (id) DO UPDATE SET src = EXCLUDED.src, name = EXCLUDED.name, display_order = EXCLUDED.display_order;
INSERT INTO public.brand_logos (id, src, name, style, display_order)
VALUES ('brand-6', 'images/Nahdimandi-white.png', 'Nahdi Mandi', '', 5)
ON CONFLICT (id) DO UPDATE SET src = EXCLUDED.src, name = EXCLUDED.name, display_order = EXCLUDED.display_order;
INSERT INTO public.brand_logos (id, src, name, style, display_order)
VALUES ('brand-7', 'images/NiceMobiles.png', 'Nice Mobiles', '', 6)
ON CONFLICT (id) DO UPDATE SET src = EXCLUDED.src, name = EXCLUDED.name, display_order = EXCLUDED.display_order;
INSERT INTO public.brand_logos (id, src, name, style, display_order)
VALUES ('brand-8', 'images/Soofimandi-white.png', 'Soofi Mandi', '', 7)
ON CONFLICT (id) DO UPDATE SET src = EXCLUDED.src, name = EXCLUDED.name, display_order = EXCLUDED.display_order;
INSERT INTO public.brand_logos (id, src, name, style, display_order)
VALUES ('brand-9', 'images/KeyFactory.png', 'Key Factory', '', 8)
ON CONFLICT (id) DO UPDATE SET src = EXCLUDED.src, name = EXCLUDED.name, display_order = EXCLUDED.display_order;
INSERT INTO public.brand_logos (id, src, name, style, display_order)
VALUES ('brand-10', 'images/ENGO FINAL LOGO-01.png', 'Engo', '', 9)
ON CONFLICT (id) DO UPDATE SET src = EXCLUDED.src, name = EXCLUDED.name, display_order = EXCLUDED.display_order;
INSERT INTO public.brand_logos (id, src, name, style, display_order)
VALUES ('brand-11', 'images/Artboard 5.png', 'Educart', '', 10)
ON CONFLICT (id) DO UPDATE SET src = EXCLUDED.src, name = EXCLUDED.name, display_order = EXCLUDED.display_order;
INSERT INTO public.brand_logos (id, src, name, style, display_order)
VALUES ('brand-12', 'images/Picsart_25-09-24_21-31-47-226.png', 'MyLaban', '', 11)
ON CONFLICT (id) DO UPDATE SET src = EXCLUDED.src, name = EXCLUDED.name, display_order = EXCLUDED.display_order;
