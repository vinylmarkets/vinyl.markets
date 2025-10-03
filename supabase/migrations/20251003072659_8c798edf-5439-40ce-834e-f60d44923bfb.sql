-- Blog categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update blog_posts table (add missing columns if needed)
DO $$ 
BEGIN
  -- Add category_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN category_id UUID REFERENCES blog_categories(id);
  END IF;

  -- Add featured_image if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'featured_image'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN featured_image TEXT;
  END IF;

  -- Add meta_description if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'meta_description'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN meta_description TEXT;
  END IF;

  -- Add meta_keywords if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'meta_keywords'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN meta_keywords TEXT;
  END IF;

  -- Add read_time_minutes if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'read_time_minutes'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN read_time_minutes INTEGER;
  END IF;

  -- Add view_count if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;

  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'status'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN status TEXT CHECK (status IN ('draft', 'review', 'published')) DEFAULT 'draft';
  END IF;
END $$;

-- Content pages (for homepage, about, pricing, etc.)
CREATE TABLE IF NOT EXISTS content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  status TEXT CHECK (status IN ('draft', 'review', 'published')) DEFAULT 'draft',
  author_id UUID,
  reviewer_id UUID,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media library
CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  alt_text TEXT,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_categories
DROP POLICY IF EXISTS "Admins can manage categories" ON blog_categories;
CREATE POLICY "Admins can manage categories" ON blog_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Public can view categories" ON blog_categories;
CREATE POLICY "Public can view categories" ON blog_categories
  FOR SELECT USING (true);

-- RLS Policies for content_pages
DROP POLICY IF EXISTS "Admins can manage pages" ON content_pages;
CREATE POLICY "Admins can manage pages" ON content_pages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Public can view published pages" ON content_pages;
CREATE POLICY "Public can view published pages" ON content_pages
  FOR SELECT USING (status = 'published');

-- RLS Policies for media_library
DROP POLICY IF EXISTS "Admins can manage media" ON media_library;
CREATE POLICY "Admins can manage media" ON media_library
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_pages_status ON content_pages(status);

-- Insert default categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Market Analysis', 'market-analysis', 'Analysis of market trends and movements'),
  ('Trading Strategies', 'trading-strategies', 'Educational content on trading approaches'),
  ('Platform Updates', 'platform-updates', 'News and updates about Vinyl'),
  ('Educational', 'educational', 'Learning resources for traders')
ON CONFLICT (slug) DO NOTHING;