-- =====================================================
-- User Answers & Module Responses for AI Personalization
-- Ermöglicht granuliertes Tracking von User-Antworten
-- für hochpersonalisierte AI-Prompts
-- =====================================================

-- =====================================================
-- 1. USER_ANSWERS - Erweitere existierende Tabelle
-- =====================================================

-- Die Tabelle existiert bereits, erweitere sie mit fehlenden Spalten
DO $$ 
BEGIN
  -- module_id hinzufügen falls nicht vorhanden
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_answers' AND column_name = 'module_id') THEN
    ALTER TABLE user_answers ADD COLUMN module_id UUID REFERENCES modules(id) ON DELETE SET NULL;
  END IF;
  
  -- question_id hinzufügen falls nicht vorhanden
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_answers' AND column_name = 'question_id') THEN
    ALTER TABLE user_answers ADD COLUMN question_id UUID;
  END IF;
  
  -- question_type hinzufügen falls nicht vorhanden
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_answers' AND column_name = 'question_type') THEN
    ALTER TABLE user_answers ADD COLUMN question_type TEXT;
  END IF;
  
  -- answer_text hinzufügen falls nicht vorhanden
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_answers' AND column_name = 'answer_text') THEN
    ALTER TABLE user_answers ADD COLUMN answer_text TEXT;
  END IF;
  
  -- emotion_tags hinzufügen falls nicht vorhanden
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_answers' AND column_name = 'emotion_tags') THEN
    ALTER TABLE user_answers ADD COLUMN emotion_tags TEXT[];
  END IF;
  
  -- confidence_level hinzufügen falls nicht vorhanden
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_answers' AND column_name = 'confidence_level') THEN
    ALTER TABLE user_answers ADD COLUMN confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5);
  END IF;
  
  -- ai_analysis hinzufügen falls nicht vorhanden
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_answers' AND column_name = 'ai_analysis') THEN
    ALTER TABLE user_answers ADD COLUMN ai_analysis JSONB;
  END IF;
  
  -- related_insights hinzufügen falls nicht vorhanden
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_answers' AND column_name = 'related_insights') THEN
    ALTER TABLE user_answers ADD COLUMN related_insights UUID[];
  END IF;
  
  -- answered_at hinzufügen falls nicht vorhanden
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_answers' AND column_name = 'answered_at') THEN
    ALTER TABLE user_answers ADD COLUMN answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- updated_at hinzufügen falls nicht vorhanden
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_answers' AND column_name = 'updated_at') THEN
    ALTER TABLE user_answers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;
-- =====================================================
-- 2. EXERCISE_RESULTS - Detaillierte Übungsergebnisse
-- =====================================================

CREATE TABLE IF NOT EXISTS exercise_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  exercise_step_id UUID, -- Referenz ohne FK (excercise_steps hat keinen PK)
  
  -- Übungsdaten
  exercise_type TEXT NOT NULL, -- 'metamodel_level1', 'genius_gate', 'incongruence_mapping'
  user_input JSONB NOT NULL, -- Die Benutzer-Eingaben
  completion_status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'skipped'
  
  -- Performance Metriken
  time_spent_seconds INTEGER,
  attempts_count INTEGER DEFAULT 1,
  score NUMERIC(5,2), -- Optional: Bewertung (0-100)
  
  -- AI-Feedback
  ai_feedback JSONB, -- AI-generierte Rückmeldungen
  suggested_improvements TEXT[],
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =====================================================
-- 3. USER_PATTERNS - Erkannte Verhaltensmuster
-- =====================================================

-- Erweitere existierende user_patterns Tabelle
DO $$ 
BEGIN
  -- Füge neue Spalten hinzu falls sie nicht existieren
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_patterns' AND column_name = 'source_answers'
  ) THEN
    ALTER TABLE user_patterns ADD COLUMN source_answers UUID[];
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_patterns' AND column_name = 'confidence_score'
  ) THEN
    ALTER TABLE user_patterns ADD COLUMN confidence_score NUMERIC(3,2);
  END IF;
END $$;
-- =====================================================
-- 4. INDEXES für Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_module_id ON user_answers(module_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_type ON user_answers(question_type);
CREATE INDEX IF NOT EXISTS idx_user_answers_answered_at ON user_answers(answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_answers_key_themes ON user_answers USING GIN(key_themes);
CREATE INDEX IF NOT EXISTS idx_user_answers_emotion_tags ON user_answers USING GIN(emotion_tags);
CREATE INDEX IF NOT EXISTS idx_exercise_results_user_id ON exercise_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_results_module_id ON exercise_results(module_id);
CREATE INDEX IF NOT EXISTS idx_exercise_results_exercise_type ON exercise_results(exercise_type);
CREATE INDEX IF NOT EXISTS idx_exercise_results_completed ON exercise_results(completed_at);
-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_results ENABLE ROW LEVEL SECURITY;
-- User Answers Policies
DROP POLICY IF EXISTS "Users can manage their own user_answers" ON user_answers;
CREATE POLICY "Users can manage their own user_answers" 
ON user_answers FOR ALL 
USING (auth.uid()::uuid = user_id::uuid) 
WITH CHECK (auth.uid()::uuid = user_id::uuid);
-- Exercise Results Policies
DROP POLICY IF EXISTS "Users can manage their own exercise_results" ON exercise_results;
CREATE POLICY "Users can manage their own exercise_results" 
ON exercise_results FOR ALL 
USING (auth.uid()::uuid = user_id::uuid) 
WITH CHECK (auth.uid()::uuid = user_id::uuid);
-- =====================================================
-- 6. TRIGGERS für updated_at
-- =====================================================

DROP TRIGGER IF EXISTS update_user_answers_updated_at ON user_answers;
CREATE TRIGGER update_user_answers_updated_at 
  BEFORE UPDATE ON user_answers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_exercise_results_updated_at ON exercise_results;
CREATE TRIGGER update_exercise_results_updated_at 
  BEFORE UPDATE ON exercise_results 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- =====================================================
-- 7. HELPER FUNCTIONS für AI-Context Building
-- =====================================================

-- Funktion: Hole alle Antworten eines Users zu einem bestimmten Thema
CREATE OR REPLACE FUNCTION get_user_answers_by_theme(
  p_user_id UUID,
  p_theme TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  question_text TEXT,
  answer_text TEXT,
  answer_data JSONB,
  emotion_tags TEXT[],
  answered_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.question_text,
    ua.answer_text,
    ua.answer_data,
    ua.emotion_tags,
    ua.answered_at
  FROM user_answers ua
  WHERE ua.user_id = p_user_id
    AND p_theme = ANY(ua.key_themes)
  ORDER BY ua.answered_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Funktion: Hole User-Kontext für AI (umfassend)
CREATE OR REPLACE FUNCTION get_comprehensive_user_context(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_context JSONB;
BEGIN
  SELECT jsonb_build_object(
    'profile', (
      SELECT jsonb_build_object(
        'goals', primary_goals,
        'challenges', current_challenges,
        'experience_level', experience_level,
        'time_commitment', time_commitment
      )
      FROM user_profiles WHERE user_id = p_user_id
    ),
    'recent_answers', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'question', question_text,
          'answer', answer_text,
          'themes', key_themes,
          'emotions', emotion_tags,
          'date', answered_at
        ) ORDER BY answered_at DESC
      )
      FROM (
        SELECT * FROM user_answers 
        WHERE user_id = p_user_id 
        ORDER BY answered_at DESC 
        LIMIT 20
      ) recent
    ),
    'life_wheel', (
      SELECT snapshot_data
      FROM life_wheel_snapshots
      WHERE user_id = p_user_id
      ORDER BY created_at DESC
      LIMIT 1
    ),
    'patterns', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'type', pattern_type,
          'data', pattern_data,
          'confidence', confidence_score
        )
      )
      FROM user_patterns
      WHERE user_id = p_user_id
        AND is_active = true
    ),
    'completed_modules', (
      SELECT jsonb_agg(module_id)
      FROM completed_modules
      WHERE user_id = p_user_id
    )
  ) INTO v_context;
  
  RETURN COALESCE(v_context, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =====================================================
-- 8. VIEWS für einfachen Zugriff
-- =====================================================

-- View: User Answers mit Module Info
CREATE OR REPLACE VIEW user_answers_enriched AS
SELECT 
  ua.*,
  m.title as module_title,
  m.klare_step as module_klare_step,
  m.tags as module_tags
FROM user_answers ua
LEFT JOIN modules m ON m.id = ua.module_id;
-- View: Exercise Results mit Module Info
CREATE OR REPLACE VIEW exercise_results_enriched AS
SELECT 
  er.*,
  m.title as module_title,
  m.klare_step as module_klare_step,
  es.title as exercise_step_title,
  es.instructions as exercise_instructions
FROM exercise_results er
LEFT JOIN modules m ON m.id = er.module_id
LEFT JOIN excercise_steps es ON es.id = er.exercise_step_id;
-- Grant permissions
GRANT SELECT ON user_answers_enriched TO authenticated;
GRANT SELECT ON exercise_results_enriched TO authenticated;
-- =====================================================
-- 9. DOCUMENTATION
-- =====================================================

COMMENT ON TABLE user_answers IS 'Zentrale Tabelle für alle User-Antworten - ermöglicht granulierte AI-Personalisierung';
COMMENT ON TABLE exercise_results IS 'Detaillierte Ergebnisse von Übungen und Exercises';
COMMENT ON FUNCTION get_comprehensive_user_context IS 'Liefert umfassenden User-Kontext für AI-Prompt-Generierung';
COMMENT ON VIEW user_answers_enriched IS 'User Answers angereichert mit Modul-Informationen';
