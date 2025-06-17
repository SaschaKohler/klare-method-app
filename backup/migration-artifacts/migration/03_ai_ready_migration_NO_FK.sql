-- 03_ai_ready_migration_NO_FK.sql
-- CLEAN VERSION: NO Foreign Key Constraints during table creation
-- All FK constraints will be added in separate script

-- Extensions & Setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- EXTEND EXISTING TABLES (ADD AI-Ready columns)
-- ============================================================================

-- Extend users table with AI features
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'de' CHECK (preferred_language IN ('de', 'en'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_mode_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS personalization_level TEXT DEFAULT 'basic' CHECK (personalization_level IN ('basic', 'enhanced', 'ai', 'predictive'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Extend life_wheel_areas with enhanced features
ALTER TABLE life_wheel_areas ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5);
ALTER TABLE life_wheel_areas ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE life_wheel_areas ADD COLUMN IF NOT EXISTS improvement_actions TEXT[];

-- Extend completed_modules with detailed tracking
ALTER TABLE completed_modules ADD COLUMN IF NOT EXISTS responses JSONB DEFAULT '{}';
ALTER TABLE completed_modules ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER;
ALTER TABLE completed_modules ADD COLUMN IF NOT EXISTS satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5);
ALTER TABLE completed_modules ADD COLUMN IF NOT EXISTS difficulty_experienced INTEGER CHECK (difficulty_experienced BETWEEN 1 AND 5);
ALTER TABLE completed_modules ADD COLUMN IF NOT EXISTS key_insights TEXT[];
ALTER TABLE completed_modules ADD COLUMN IF NOT EXISTS action_items TEXT[];
ALTER TABLE completed_modules ADD COLUMN IF NOT EXISTS challenges_faced TEXT[];

-- Extend journal_template_categories with UI enhancements
ALTER TABLE journal_template_categories ADD COLUMN IF NOT EXISTS color_hex TEXT;

-- Extend journal_templates with personalization
ALTER TABLE journal_templates ADD COLUMN IF NOT EXISTS suitable_for_profiles JSONB;
ALTER TABLE journal_templates ADD COLUMN IF NOT EXISTS klare_steps TEXT[];
ALTER TABLE journal_templates ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5);

-- ============================================================================
-- CREATE MISSING EXISTING TABLES (if they don't exist)
-- ============================================================================

-- Ensure personal_values exists (from your exports)
CREATE TABLE IF NOT EXISTS personal_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,  -- NO FK constraint yet
  value_name TEXT NOT NULL,
  description TEXT,
  rank INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure vision_board_items exists (from your exports)
CREATE TABLE IF NOT EXISTS vision_board_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,  -- NO FK constraint yet
  vision_board_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  life_area TEXT NOT NULL,
  image_url TEXT,
  position_x FLOAT,
  position_y FLOAT,
  width FLOAT,
  height FLOAT,
  rotation FLOAT,
  scale FLOAT,
  color TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CREATE NEW AI TABLES (truly new functionality)
-- ============================================================================

-- User Profiles (NEW)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,  -- NO FK constraint yet
  age INTEGER,
  location TEXT,
  occupation TEXT,
  relationship_status TEXT,
  preferences JSONB DEFAULT '{}',
  communication_style TEXT,
  learning_style TEXT,
  personality_profile JSONB,
  life_priorities TEXT[],
  current_challenges TEXT[],
  goals JSONB,
  profile_completeness DECIMAL(3,2) DEFAULT 0.00,
  last_assessment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Life Wheel Snapshots (NEW)
CREATE TABLE IF NOT EXISTS life_wheel_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,  -- NO FK constraint yet
  snapshot_data JSONB NOT NULL,
  context TEXT,
  insights TEXT[],
  improvements JSONB,
  priority_areas TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Prompt Templates (NEW)
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_reference TEXT, -- References existing module_id (no FK constraint)
  prompt_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  personalization_factors TEXT[],
  target_user_profiles JSONB,
  difficulty_range INTEGER[] DEFAULT '{1,5}',
  model_settings JSONB DEFAULT '{}',
  safety_filters TEXT[],
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated Content (NEW)
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,  -- NO FK constraint yet
  template_id UUID NOT NULL,  -- NO FK constraint yet
  content_type TEXT NOT NULL,
  generated_title TEXT,
  generated_content JSONB NOT NULL,
  personalization_context JSONB,
  prompt_used TEXT,
  ai_model TEXT NOT NULL,
  generation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  was_helpful BOOLEAN,
  user_feedback TEXT,
  cache_expires_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced User Answers (NEW)
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,  -- NO FK constraint yet
  content_reference TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('module_content', 'exercise_step', 'quiz_question', 'generated', 'journal')),
  question_text TEXT NOT NULL,
  answer_data JSONB NOT NULL,
  response_time_seconds INTEGER,
  klare_step TEXT CHECK (klare_step IN ('K', 'L', 'A', 'R', 'E')),
  answer_category TEXT,
  sentiment_score DECIMAL(3,2),
  key_themes TEXT[],
  emotional_tone TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personal Insights (NEW)
CREATE TABLE IF NOT EXISTS personal_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,  -- NO FK constraint yet
  insight_type TEXT NOT NULL CHECK (insight_type IN ('strength', 'challenge', 'pattern', 'recommendation', 'goal')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  related_areas TEXT[],
  related_modules TEXT[],
  supporting_evidence TEXT[],
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0.00 AND 1.00),
  source TEXT NOT NULL CHECK (source IN ('ai_analysis', 'user_input', 'assessment', 'pattern_detection')),
  ai_model TEXT,
  user_acknowledged BOOLEAN DEFAULT false,
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Normalized Translations (NEW)
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  language_code TEXT NOT NULL CHECK (language_code IN ('de', 'en')),
  translated_text TEXT NOT NULL,
  translation_quality TEXT DEFAULT 'auto' CHECK (translation_quality IN ('auto', 'human', 'ai', 'verified')),
  translator_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_type, entity_id, field_name, language_code)
);

-- Journal Entries (NEW)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,  -- NO FK constraint yet
  template_id UUID,  -- NO FK constraint yet
  title TEXT,
  content TEXT NOT NULL,
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 10),
  tags TEXT[],
  is_private BOOLEAN DEFAULT true,
  ai_insights JSONB,
  growth_indicators TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Behavior Events (NEW)
CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,  -- NO FK constraint yet
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id UUID,
  page_or_module TEXT,
  device_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Patterns (NEW)
CREATE TABLE IF NOT EXISTS user_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,  -- NO FK constraint yet
  pattern_type TEXT NOT NULL,
  pattern_description TEXT NOT NULL,
  supporting_events INTEGER,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0.00 AND 1.00),
  first_detected TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_confirmed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Conversations (NEW)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,  -- NO FK constraint yet
  session_id UUID NOT NULL,
  conversation_type TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'ai', 'system')),
  message_content TEXT NOT NULL,
  ai_model TEXT,
  prompt_template_id UUID,  -- NO FK constraint yet
  generation_metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Service Logs (NEW)
CREATE TABLE IF NOT EXISTS ai_service_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,  -- NO FK constraint yet
  service_name TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  tokens_used INTEGER,
  cost_estimate DECIMAL(10,4),
  response_time_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Existing table indexes
CREATE INDEX IF NOT EXISTS idx_users_ai_mode ON users(ai_mode_enabled);
CREATE INDEX IF NOT EXISTS idx_users_personalization ON users(personalization_level);
CREATE INDEX IF NOT EXISTS idx_life_wheel_priority ON life_wheel_areas(priority_level);

-- New table indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_life_wheel_snapshots_user_id ON life_wheel_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_module ON ai_prompt_templates(module_reference);
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_klare_step ON user_answers(klare_step);
CREATE INDEX IF NOT EXISTS idx_personal_insights_user_id ON personal_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_translations_entity ON translations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_wheel_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policies for new tables (use auth.uid() directly)
CREATE POLICY "Users can manage their own profile" ON user_profiles
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own snapshots" ON life_wheel_snapshots
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read their generated content" ON generated_content
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own answers" ON user_answers
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own insights" ON personal_insights
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own journal entries" ON journal_entries
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read their own events" ON user_events
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read their own patterns" ON user_patterns
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own conversations" ON ai_conversations
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Content tables remain publicly readable for authenticated users
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read AI templates" ON ai_prompt_templates
  FOR SELECT TO authenticated USING (is_active = true);

ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read translations" ON translations
  FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get translated text function (works with new normalized table)
CREATE OR REPLACE FUNCTION get_translated_text(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_field_name TEXT,
  p_language_code TEXT DEFAULT 'de'
) RETURNS TEXT AS $$
DECLARE
  translated_text TEXT;
BEGIN
  SELECT translated_text INTO translated_text
  FROM translations
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND field_name = p_field_name
    AND language_code = p_language_code;
  
  RETURN translated_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update triggers function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
-- Drop existing triggers first, then recreate
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_personal_insights_updated_at ON personal_insights;
CREATE TRIGGER update_personal_insights_updated_at
  BEFORE UPDATE ON personal_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_translations_updated_at ON translations;
CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE (WITHOUT FK CONSTRAINTS)
-- ============================================================================

SELECT 'AI-READY MIGRATION COMPLETE (NO FK)' as status, NOW() as completed_at;
SELECT 'Run 05_fix_foreign_keys_corrected.sql next to add Foreign Key constraints' as next_step;
