-- =====================================================
-- 011 - Privacy-First User Preferences
-- Enhanced user control over AI and data sharing
-- =====================================================

-- =======================================
-- USER PRIVACY PREFERENCES
-- =======================================

-- Enhanced user preferences for privacy and AI control
CREATE TABLE IF NOT EXISTS user_privacy_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- AI Integration Preferences
  ai_enabled BOOLEAN DEFAULT false,
  ai_personalization_level TEXT DEFAULT 'none' CHECK (ai_personalization_level IN ('none', 'basic', 'advanced')),
  
  -- Data Sharing Preferences  
  data_sharing_level TEXT DEFAULT 'local_only' CHECK (data_sharing_level IN ('local_only', 'cloud_safe', 'ai_enabled')),
  sensitive_data_local_only BOOLEAN DEFAULT true,
  intimate_data_local_only BOOLEAN DEFAULT true,
  
  -- Content Preferences
  prefers_static_questions BOOLEAN DEFAULT true,
  allows_ai_questions BOOLEAN DEFAULT false,
  
  -- Language & Localization
  preferred_language TEXT DEFAULT 'de' CHECK (preferred_language IN ('de', 'en')),
  auto_translate BOOLEAN DEFAULT false,
  
  -- Consent Management
  gdpr_consent_given BOOLEAN DEFAULT false,
  ai_consent_given BOOLEAN DEFAULT false,
  data_processing_consent BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  
  -- Consent History (for audit)
  consent_history JSONB DEFAULT '[]',
  last_consent_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- =======================================
-- CONTENT SENSITIVITY CLASSIFICATION
-- =======================================

-- Classify all content by sensitivity level
CREATE TABLE IF NOT EXISTS content_sensitivity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL, -- 'journal_question', 'module_content', 'exercise_step'
  content_id UUID NOT NULL,
  sensitivity_level TEXT NOT NULL CHECK (sensitivity_level IN ('public', 'sensitive', 'intimate')),
  
  -- Storage recommendations
  recommended_storage TEXT NOT NULL CHECK (recommended_storage IN ('local_only', 'cloud_safe', 'ai_enabled')),
  
  -- Reasoning for classification
  classification_reason TEXT,
  tags JSONB DEFAULT '[]', -- ['financial', 'relationships', 'trauma', etc.]
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(content_type, content_id)
);

-- =======================================
-- PRIVACY-AWARE JOURNAL RESPONSES  
-- =======================================

-- Store journal responses with privacy controls
CREATE TABLE IF NOT EXISTS journal_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES journal_templates(id),
  question_text TEXT NOT NULL,
  
  -- Response data
  response_text TEXT NOT NULL,
  response_metadata JSONB DEFAULT '{}', -- mood, context, etc.
  
  -- Privacy controls
  sensitivity_level TEXT NOT NULL CHECK (sensitivity_level IN ('public', 'sensitive', 'intimate')),
  storage_location TEXT NOT NULL CHECK (storage_location IN ('local_only', 'cloud_safe', 'ai_enabled')),
  
  -- AI usage permissions
  allow_ai_analysis BOOLEAN DEFAULT false,
  allow_ai_suggestions BOOLEAN DEFAULT false,
  anonymize_for_ai BOOLEAN DEFAULT true,
  
  -- Sync status (for local-first storage)
  is_synced BOOLEAN DEFAULT false,
  local_only BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================================
-- AI INTERACTION AUDIT LOG
-- =======================================

-- Track all AI interactions for transparency
CREATE TABLE IF NOT EXISTS ai_interaction_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  interaction_type TEXT NOT NULL, -- 'question_generation', 'content_analysis', 'suggestion'
  input_data_hash TEXT, -- Hash of input for audit without storing sensitive data
  
  -- Privacy compliance
  user_consent_status BOOLEAN NOT NULL,
  data_anonymized BOOLEAN NOT NULL,
  sensitive_data_excluded BOOLEAN NOT NULL,
  
  -- AI service details
  ai_service_used TEXT, -- 'openai', 'anthropic', etc.
  prompt_template_id UUID REFERENCES ai_prompt_templates(id),
  
  -- Results
  ai_response_summary TEXT,
  user_feedback_rating INTEGER CHECK (user_feedback_rating >= 1 AND user_feedback_rating <= 5),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================================
-- ENHANCED JOURNAL TEMPLATES WITH PRIVACY
-- =======================================

-- Add privacy fields to existing journal templates
ALTER TABLE journal_templates 
ADD COLUMN IF NOT EXISTS default_sensitivity_level TEXT DEFAULT 'sensitive' CHECK (default_sensitivity_level IN ('public', 'sensitive', 'intimate'));

ALTER TABLE journal_templates
ADD COLUMN IF NOT EXISTS requires_local_storage BOOLEAN DEFAULT false;

ALTER TABLE journal_templates  
ADD COLUMN IF NOT EXISTS ai_analysis_safe BOOLEAN DEFAULT false;

-- =======================================
-- PRIVACY-AWARE INDEXES
-- =======================================

CREATE INDEX IF NOT EXISTS idx_user_privacy_preferences_user ON user_privacy_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_privacy_preferences_ai_enabled ON user_privacy_preferences(ai_enabled);

CREATE INDEX IF NOT EXISTS idx_content_sensitivity_type_id ON content_sensitivity(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_sensitivity_level ON content_sensitivity(sensitivity_level);

CREATE INDEX IF NOT EXISTS idx_journal_responses_user ON journal_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_responses_sensitivity ON journal_responses(sensitivity_level);
CREATE INDEX IF NOT EXISTS idx_journal_responses_local_only ON journal_responses(local_only);
CREATE INDEX IF NOT EXISTS idx_journal_responses_ai_allowed ON journal_responses(allow_ai_analysis);

CREATE INDEX IF NOT EXISTS idx_ai_interaction_log_user ON ai_interaction_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interaction_log_type ON ai_interaction_log(interaction_type);
CREATE INDEX IF NOT EXISTS idx_ai_interaction_log_created ON ai_interaction_log(created_at);

-- =======================================
-- RLS POLICIES FOR PRIVACY
-- =======================================

ALTER TABLE user_privacy_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sensitivity ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interaction_log ENABLE ROW LEVEL SECURITY;

-- User privacy preferences policies
DROP POLICY IF EXISTS "Users can manage their own privacy preferences" ON user_privacy_preferences;
CREATE POLICY "Users can manage their own privacy preferences" 
ON user_privacy_preferences FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Content sensitivity is readable by all authenticated users (for proper classification)
DROP POLICY IF EXISTS "Authenticated users can read content sensitivity" ON content_sensitivity;
CREATE POLICY "Authenticated users can read content sensitivity" 
ON content_sensitivity FOR SELECT 
TO authenticated 
USING (true);

-- Journal responses are strictly user-private
DROP POLICY IF EXISTS "Users can manage their own journal responses" ON journal_responses;
CREATE POLICY "Users can manage their own journal responses" 
ON journal_responses FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- AI interaction log is user-private for transparency
DROP POLICY IF EXISTS "Users can view their own AI interactions" ON ai_interaction_log;
CREATE POLICY "Users can view their own AI interactions" 
ON ai_interaction_log FOR SELECT 
USING (auth.uid() = user_id);

-- =======================================
-- PRIVACY HELPER FUNCTIONS
-- =======================================

-- Function to check if user allows AI for specific content
CREATE OR REPLACE FUNCTION user_allows_ai_for_content(
  p_user_id UUID,
  p_sensitivity_level TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_prefs RECORD;
BEGIN
  SELECT * INTO user_prefs 
  FROM user_privacy_preferences 
  WHERE user_id = p_user_id;
  
  -- If no preferences set, default to most restrictive
  IF user_prefs IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check AI enabled and consent given
  IF NOT user_prefs.ai_enabled OR NOT user_prefs.ai_consent_given THEN
    RETURN false;
  END IF;
  
  -- Check sensitivity level permissions
  CASE p_sensitivity_level
    WHEN 'intimate' THEN
      RETURN NOT user_prefs.intimate_data_local_only;
    WHEN 'sensitive' THEN  
      RETURN NOT user_prefs.sensitive_data_local_only;
    WHEN 'public' THEN
      RETURN user_prefs.data_sharing_level IN ('cloud_safe', 'ai_enabled');
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get appropriate storage location for content
CREATE OR REPLACE FUNCTION get_storage_location_for_user(
  p_user_id UUID,
  p_sensitivity_level TEXT
)
RETURNS TEXT AS $$
DECLARE
  user_prefs RECORD;
BEGIN
  SELECT * INTO user_prefs 
  FROM user_privacy_preferences 
  WHERE user_id = p_user_id;
  
  -- Default to most restrictive
  IF user_prefs IS NULL THEN
    RETURN 'local_only';
  END IF;
  
  -- Return based on user preferences and content sensitivity
  CASE p_sensitivity_level
    WHEN 'intimate' THEN
      RETURN CASE WHEN user_prefs.intimate_data_local_only THEN 'local_only' ELSE user_prefs.data_sharing_level END;
    WHEN 'sensitive' THEN
      RETURN CASE WHEN user_prefs.sensitive_data_local_only THEN 'local_only' ELSE user_prefs.data_sharing_level END;
    WHEN 'public' THEN
      RETURN user_prefs.data_sharing_level;
    ELSE
      RETURN 'local_only';
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================================
-- INITIAL PRIVACY CLASSIFICATION
-- =======================================

-- Classify existing journal template questions by sensitivity
INSERT INTO content_sensitivity (content_type, content_id, sensitivity_level, recommended_storage, classification_reason, tags) VALUES
-- Public/Safe questions
('journal_template', (SELECT id FROM journal_templates WHERE title LIKE '%Energie%'), 'public', 'cloud_safe', 'General energy and vitality questions', '["energy", "general"]'),
('journal_template', (SELECT id FROM journal_templates WHERE title LIKE '%Standort%'), 'sensitive', 'cloud_safe', 'Life assessment but not intimate', '["assessment", "reflection"]'),

-- Sensitive questions (default for most personal development)
-- Will be added based on actual template analysis

-- Intimate questions (relationships, trauma, deep personal issues)
-- Will be classified when templates contain intimate content

-- TFP-related templates (can be sensitive based on content)
('journal_template', (SELECT id FROM journal_templates WHERE title LIKE '%Meta-Modell%'), 'sensitive', 'ai_enabled', 'TFP technique practice, suitable for AI enhancement', '["tfp", "communication", "practice"]')

ON CONFLICT (content_type, content_id) DO NOTHING;

-- =======================================
-- TRIGGERS FOR PRIVACY SYSTEM
-- =======================================

DROP TRIGGER IF EXISTS update_user_privacy_preferences_updated_at ON user_privacy_preferences;
CREATE TRIGGER update_user_privacy_preferences_updated_at 
  BEFORE UPDATE ON user_privacy_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_content_sensitivity_updated_at ON content_sensitivity;
CREATE TRIGGER update_content_sensitivity_updated_at 
  BEFORE UPDATE ON content_sensitivity 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_journal_responses_updated_at ON journal_responses;
CREATE TRIGGER update_journal_responses_updated_at 
  BEFORE UPDATE ON journal_responses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

RAISE NOTICE '🛡️ Privacy-First architecture implemented!';
RAISE NOTICE '📱 Local-first storage for sensitive data enabled.';
RAISE NOTICE '🤖 AI integration is now opt-in with granular controls.';
RAISE NOTICE '🌍 Multi-language support with privacy-aware translations.';
