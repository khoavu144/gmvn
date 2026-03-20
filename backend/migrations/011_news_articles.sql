-- Migration 011: News Articles (Tin Tức Thể Hình)
-- Auto-scraped & AI-rewritten fitness news with SEO image support
-- Run: psql $DATABASE_URL -f 011_news_articles.sql

CREATE TABLE IF NOT EXISTS news_articles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Content
    title           VARCHAR(512) NOT NULL,
    slug            VARCHAR(512) NOT NULL UNIQUE,
    excerpt         TEXT,          -- ~160 chars SEO excerpt / meta desc
    content         TEXT NOT NULL,  -- Full HTML body (images replaced with CDN URLs)
    thumbnail_url   VARCHAR(1024),  -- CDN URL of hero image

    -- Categorization
    category        VARCHAR(128) DEFAULT 'general',
    tags            TEXT[] DEFAULT '{}',

    -- SEO metadata (AI-generated)
    seo_title       VARCHAR(512),
    seo_description VARCHAR(512),
    og_image_url    VARCHAR(1024),
    og_image_alt    VARCHAR(512),

    -- Source tracking (prevent re-crawling same article)
    source_url      VARCHAR(1024) UNIQUE,
    source_domain   VARCHAR(256),      -- e.g. 'bodybuilding.com'
    source_language VARCHAR(8) DEFAULT 'en',

    -- Publishing workflow
    status          VARCHAR(32) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at    TIMESTAMPTZ,
    ai_processed    BOOLEAN DEFAULT FALSE,

    -- Reading stats
    view_count      INTEGER DEFAULT 0,
    read_time_min   SMALLINT,          -- Estimated reading time in minutes

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_news_articles_status       ON news_articles(status);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_news_articles_category     ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_slug         ON news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_news_articles_source_url   ON news_articles(source_url);
CREATE INDEX IF NOT EXISTS idx_news_articles_tags         ON news_articles USING gin(tags);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_news_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_news_updated_at ON news_articles;
CREATE TRIGGER trg_news_updated_at
    BEFORE UPDATE ON news_articles
    FOR EACH ROW EXECUTE FUNCTION set_news_updated_at();
