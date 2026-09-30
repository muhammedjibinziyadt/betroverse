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
