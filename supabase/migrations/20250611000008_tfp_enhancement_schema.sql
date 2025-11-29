-- =====================================================
-- 008 - TFP Enhancement Schema
-- AI-Ready Database Reconstruction - Part 8
-- =====================================================

-- =======================================
-- TFP-SPECIFIC ENHANCEMENT TABLES
-- =======================================

-- TFP technique mastery tracking for users
CREATE TABLE IF NOT EXISTS tfp_technique_mastery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  technique_name TEXT NOT NULL, -- 'meta_model', 'anchoring', 'timeline', 'parts_integration'
  mastery_level INTEGER DEFAULT 1 CHECK (mastery_level >= 1 AND mastery_level <= 10),
  practice_sessions INTEGER DEFAULT 0,
  breakthrough_moments JSONB DEFAULT '[]',
  ai_recommended_next_steps JSONB DEFAULT '{}',
  last_practiced TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, technique_name)
);
-- Meta-Model challenges and user responses
CREATE TABLE IF NOT EXISTS meta_model_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- 'distortion', 'generalization', 'deletion'
  original_statement TEXT NOT NULL,
  identified_patterns JSONB DEFAULT '[]',
  user_questions JSONB DEFAULT '[]', -- Questions user generated
  ai_suggested_questions JSONB DEFAULT '[]',
  breakthrough_insights TEXT,
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  session_duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Anchoring sessions for state management
CREATE TABLE IF NOT EXISTS anchoring_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_state TEXT NOT NULL, -- 'confidence', 'clarity', 'calm', etc.
  anchor_type TEXT NOT NULL, -- 'kinesthetic', 'visual', 'auditory'
  anchor_description TEXT NOT NULL,
  vakog_details JSONB DEFAULT '{}', -- Detailed sensory information
  installation_quality INTEGER CHECK (installation_quality >= 1 AND installation_quality <= 10),
  test_results JSONB DEFAULT '{}',
  usage_frequency INTEGER DEFAULT 0,
  effectiveness_rating DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Timeline work sessions
CREATE TABLE IF NOT EXISTS timeline_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- 'past_resource', 'future_pacing', 'change_history'
  timeline_orientation TEXT, -- 'in_time', 'through_time'
  target_event TEXT,
  target_date DATE,
  resources_installed JSONB DEFAULT '[]',
  emotional_shifts JSONB DEFAULT '{}',
  integration_quality INTEGER CHECK (integration_quality >= 1 AND integration_quality <= 10),
  follow_up_needed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Parts integration work (Peace Maker, Visual Squash)
CREATE TABLE IF NOT EXISTS parts_integration_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- 'peace_maker', 'visual_squash', 'six_step_reframing'
  conflict_description TEXT NOT NULL,
  parts_identified JSONB DEFAULT '[]', -- Different parts/aspects of self
  integration_outcome TEXT,
  resolution_quality INTEGER CHECK (resolution_quality >= 1 AND resolution_quality <= 10),
  follow_up_actions JSONB DEFAULT '[]',
  ecological_check_passed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =======================================
-- TFP CONTENT TEMPLATES
-- =======================================

-- Enhanced AI prompt templates specifically for TFP techniques
CREATE TABLE IF NOT EXISTS tfp_prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  technique_category TEXT NOT NULL, -- 'meta_model', 'anchoring', 'timeline', 'parts_integration'
  specific_technique TEXT NOT NULL, -- 'cause_effect_challenge', 'kinesthetic_anchor', etc.
  klare_integration TEXT CHECK (klare_integration IN ('K', 'L', 'A', 'R', 'E')),
  prompt_template TEXT NOT NULL,
  personalization_variables JSONB DEFAULT '{}',
  difficulty_adaptations JSONB DEFAULT '{}',
  success_criteria JSONB DEFAULT '{}',
  usage_analytics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- TFP exercise progressions (beginner to advanced)
CREATE TABLE IF NOT EXISTS tfp_exercise_progressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  technique_name TEXT NOT NULL,
  progression_level INTEGER NOT NULL CHECK (progression_level >= 1 AND progression_level <= 10),
  exercise_description TEXT NOT NULL,
  prerequisites JSONB DEFAULT '[]',
  learning_objectives JSONB DEFAULT '[]',
  success_indicators JSONB DEFAULT '[]',
  estimated_duration INTEGER, -- minutes
  ai_coaching_prompts JSONB DEFAULT '{}',
  common_challenges JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =======================================
-- INDEXES FOR TFP SYSTEM
-- =======================================

CREATE INDEX IF NOT EXISTS idx_tfp_technique_mastery_user ON tfp_technique_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_tfp_technique_mastery_technique ON tfp_technique_mastery(technique_name);
CREATE INDEX IF NOT EXISTS idx_tfp_technique_mastery_level ON tfp_technique_mastery(mastery_level);
CREATE INDEX IF NOT EXISTS idx_meta_model_sessions_user ON meta_model_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_meta_model_sessions_type ON meta_model_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_meta_model_sessions_created ON meta_model_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_anchoring_sessions_user ON anchoring_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_anchoring_sessions_state ON anchoring_sessions(target_state);
CREATE INDEX IF NOT EXISTS idx_anchoring_sessions_type ON anchoring_sessions(anchor_type);
CREATE INDEX IF NOT EXISTS idx_timeline_sessions_user ON timeline_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_sessions_type ON timeline_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_timeline_sessions_date ON timeline_sessions(target_date);
CREATE INDEX IF NOT EXISTS idx_parts_integration_user ON parts_integration_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_parts_integration_type ON parts_integration_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_tfp_prompts_category ON tfp_prompt_templates(technique_category);
CREATE INDEX IF NOT EXISTS idx_tfp_prompts_klare ON tfp_prompt_templates(klare_integration);
CREATE INDEX IF NOT EXISTS idx_tfp_progressions_technique ON tfp_exercise_progressions(technique_name);
CREATE INDEX IF NOT EXISTS idx_tfp_progressions_level ON tfp_exercise_progressions(progression_level);
-- =======================================
-- RLS POLICIES FOR TFP SYSTEM
-- =======================================

ALTER TABLE tfp_technique_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_model_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE anchoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_integration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tfp_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tfp_exercise_progressions ENABLE ROW LEVEL SECURITY;
-- User-specific TFP data policies
DROP POLICY IF EXISTS "Users can manage their own tfp_technique_mastery" ON tfp_technique_mastery;
CREATE POLICY "Users can manage their own tfp_technique_mastery" 
ON tfp_technique_mastery FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage their own meta_model_sessions" ON meta_model_sessions;
CREATE POLICY "Users can manage their own meta_model_sessions" 
ON meta_model_sessions FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage their own anchoring_sessions" ON anchoring_sessions;
CREATE POLICY "Users can manage their own anchoring_sessions" 
ON anchoring_sessions FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage their own timeline_sessions" ON timeline_sessions;
CREATE POLICY "Users can manage their own timeline_sessions" 
ON timeline_sessions FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage their own parts_integration_sessions" ON parts_integration_sessions;
CREATE POLICY "Users can manage their own parts_integration_sessions" 
ON parts_integration_sessions FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
-- TFP content policies (read for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can read tfp_prompt_templates" ON tfp_prompt_templates;
CREATE POLICY "Authenticated users can read tfp_prompt_templates" 
ON tfp_prompt_templates FOR SELECT 
TO authenticated 
USING (true);
DROP POLICY IF EXISTS "Authenticated users can read tfp_exercise_progressions" ON tfp_exercise_progressions;
CREATE POLICY "Authenticated users can read tfp_exercise_progressions" 
ON tfp_exercise_progressions FOR SELECT 
TO authenticated 
USING (true);
-- =======================================
-- TRIGGERS FOR TFP SYSTEM
-- =======================================

DROP TRIGGER IF EXISTS update_tfp_technique_mastery_updated_at ON tfp_technique_mastery;
CREATE TRIGGER update_tfp_technique_mastery_updated_at 
  BEFORE UPDATE ON tfp_technique_mastery 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_anchoring_sessions_updated_at ON anchoring_sessions;
CREATE TRIGGER update_anchoring_sessions_updated_at 
  BEFORE UPDATE ON anchoring_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_tfp_prompt_templates_updated_at ON tfp_prompt_templates;
CREATE TRIGGER update_tfp_prompt_templates_updated_at 
  BEFORE UPDATE ON tfp_prompt_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
