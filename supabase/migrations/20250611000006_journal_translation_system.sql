-- =====================================================
-- 006 - Journal and Translation System
-- AI-Ready Database Reconstruction - Part 6
-- =====================================================

-- =======================================
-- JOURNAL SYSTEM
-- =======================================

-- Journal template categories for organization
CREATE TABLE IF NOT EXISTS journal_template_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER,
  translations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Journal templates with TFP enhancement
CREATE TABLE IF NOT EXISTS journal_templates (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES journal_template_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]', -- Array of question objects
  klare_step TEXT CHECK (klare_step IN ('K', 'L', 'A', 'R', 'E')),
  tfp_technique TEXT, -- Associated TFP technique
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  estimated_duration INTEGER, -- minutes
  translations JSONB DEFAULT '{}',
  usage_analytics JSONB DEFAULT '{}',
  ai_enhancement_prompts JSONB DEFAULT '{}', -- AI prompts for deeper questions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- User journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id TEXT REFERENCES journal_templates(id) ON DELETE SET NULL,
  title TEXT,
  content JSONB NOT NULL, -- Responses to template questions
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
  insights JSONB DEFAULT '[]', -- User insights from journaling
  ai_analysis JSONB DEFAULT '{}', -- AI analysis of the entry
  private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =======================================
-- TRANSLATION SYSTEM
-- =======================================

-- Centralized translations for all content
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL, -- 'module', 'exercise', 'template', 'question'
  entity_id TEXT NOT NULL,
  language_code TEXT NOT NULL, -- 'en', 'de', etc.
  field_name TEXT NOT NULL, -- 'title', 'content', 'instructions'
  translated_text TEXT NOT NULL,
  quality_score DECIMAL(3,2), -- Translation quality (AI or human reviewed)
  translator_type TEXT DEFAULT 'ai', -- 'human', 'ai', 'hybrid'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, language_code, field_name)
);
-- =======================================
-- INDEXES FOR JOURNAL AND TRANSLATION
-- =======================================

CREATE INDEX IF NOT EXISTS idx_journal_template_categories_order ON journal_template_categories(order_index);
CREATE INDEX IF NOT EXISTS idx_journal_templates_category ON journal_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_journal_templates_klare_step ON journal_templates(klare_step);
CREATE INDEX IF NOT EXISTS idx_journal_templates_tfp ON journal_templates(tfp_technique);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_template ON journal_entries(template_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created ON journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood_tracking ON journal_entries(mood_before, mood_after);
CREATE INDEX IF NOT EXISTS idx_translations_entity ON translations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_translations_language ON translations(language_code);
CREATE INDEX IF NOT EXISTS idx_translations_lookup ON translations(entity_type, entity_id, language_code);
-- =======================================
-- TRIGGERS
-- =======================================

DROP TRIGGER IF EXISTS update_journal_template_categories_updated_at ON journal_template_categories;
CREATE TRIGGER update_journal_template_categories_updated_at 
  BEFORE UPDATE ON journal_template_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_journal_templates_updated_at ON journal_templates;
CREATE TRIGGER update_journal_templates_updated_at 
  BEFORE UPDATE ON journal_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
CREATE TRIGGER update_journal_entries_updated_at 
  BEFORE UPDATE ON journal_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_translations_updated_at ON translations;
CREATE TRIGGER update_translations_updated_at 
  BEFORE UPDATE ON translations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- =======================================
-- TRANSLATION HELPER FUNCTIONS
-- =======================================

-- Function to get translated text with fallback
CREATE OR REPLACE FUNCTION get_translated_text(
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_field_name TEXT,
  p_language_code TEXT DEFAULT 'en',
  p_fallback_language TEXT DEFAULT 'de'
)
RETURNS TEXT AS $$
DECLARE
  translated_text TEXT;
BEGIN
  -- Try to get translation in requested language
  SELECT translated_text INTO translated_text
  FROM translations
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND field_name = p_field_name
    AND language_code = p_language_code;
  
  -- If not found, try fallback language
  IF translated_text IS NULL THEN
    SELECT translated_text INTO translated_text
    FROM translations
    WHERE entity_type = p_entity_type
      AND entity_id = p_entity_id
      AND field_name = p_field_name
      AND language_code = p_fallback_language;
  END IF;
  
  RETURN COALESCE(translated_text, '[Translation missing]');
END;
$$ LANGUAGE plpgsql;
-- Function to bulk insert translations
CREATE OR REPLACE FUNCTION upsert_translation(
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_language_code TEXT,
  p_translations JSONB
)
RETURNS INTEGER AS $$
DECLARE
  field_name TEXT;
  field_value TEXT;
  insert_count INTEGER := 0;
BEGIN
  -- Loop through all fields in the translations JSONB
  FOR field_name, field_value IN SELECT * FROM jsonb_each_text(p_translations)
  LOOP
    INSERT INTO translations (
      entity_type, entity_id, language_code, field_name, translated_text
    )
    VALUES (
      p_entity_type, p_entity_id, p_language_code, field_name, field_value
    )
    ON CONFLICT (entity_type, entity_id, language_code, field_name)
    DO UPDATE SET 
      translated_text = EXCLUDED.translated_text,
      updated_at = NOW();
    
    insert_count := insert_count + 1;
  END LOOP;
  
  RETURN insert_count;
END;
$$ LANGUAGE plpgsql;
