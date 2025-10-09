-- =============================================
-- K-Modul: Vollständiger Transformationsablauf
-- Basierend auf TFP-Skript und KLARE-Methode
-- =============================================

-- 1) Neue K-Module in modules Tabelle einfügen
INSERT INTO modules (slug, klare_step, title, description, content_type, order_index, difficulty_level, estimated_duration, is_active, learning_objectives, tags, metadata)
VALUES
  -- Phase 1: Willkommen & Einstimmung
  ('k-welcome', 'K', 'Willkommen zur Klarheit', 'Persönliche Begrüßung und Einstimmung auf die Transformationsreise', 'intro', 1, 1, 5, true, 
   ARRAY['Verständnis der Bedeutung von Klarheit', 'Motivation für den Prozess aufbauen', 'Erste Selbstreflexion initiieren'],
   ARRAY['klarheit', 'einstieg', 'transformation'],
   '{"phase": "welcome", "ai_personalized": true, "interactive": true}'::jsonb),

  -- Phase 2: IST-Analyse mit Lebensrad
  ('k-lifewheel-analysis', 'K', 'Deine aktuelle Lebenssituation', 'Ehrliche Bestandsaufnahme mit dem Lebensrad', 'exercise', 2, 2, 15, true,
   ARRAY['Alle Lebensbereiche bewusst wahrnehmen', 'Aktuelle Zufriedenheit objektiv bewerten', 'Diskrepanzen zwischen IST und SOLL erkennen'],
   ARRAY['lebensrad', 'ist-analyse', 'selbstwahrnehmung'],
   '{"phase": "ist_analysis", "requires_lifewheel": true, "ai_insights": true}'::jsonb),

  -- Phase 3: Meta-Modell Einführung
  ('k-metamodel-intro', 'K', 'Das Meta-Modell der Sprache', 'Einführung in präzise Kommunikation und Selbstreflexion', 'theory', 3, 2, 10, true,
   ARRAY['Meta-Modell Grundlagen verstehen', 'Sprachmuster erkennen lernen', 'Bedeutung für Selbsterkenntnis erfassen'],
   ARRAY['meta-modell', 'kommunikation', 'nlp'],
   '{"phase": "metamodel_intro", "ai_examples": true, "video_content": false}'::jsonb),

  -- Phase 4: Meta-Modell Level 1 - Universalquantoren
  ('k-metamodel-level1', 'K', 'Level 1: Generalisierungen erkennen', 'Universalquantoren wie "immer", "nie", "alle" hinterfragen', 'exercise', 4, 2, 20, true,
   ARRAY['Universalquantoren identifizieren', 'Präzisierende Fragen stellen', 'Eigene Denkmuster erkennen'],
   ARRAY['meta-modell', 'level-1', 'generalisierungen'],
   '{"phase": "metamodel_practice", "level": 1, "challenge": "universalquantoren", "ai_analysis": true}'::jsonb),

  -- Phase 5: Meta-Modell Level 2 - Tilgungen
  ('k-metamodel-level2', 'K', 'Level 2: Fehlende Informationen', 'Tilgungen und unvollständige Aussagen vervollständigen', 'exercise', 5, 3, 20, true,
   ARRAY['Tilgungen in Sprache erkennen', 'Fehlende Referenzen identifizieren', 'Vollständigkeit herstellen'],
   ARRAY['meta-modell', 'level-2', 'tilgungen'],
   '{"phase": "metamodel_practice", "level": 2, "challenge": "tilgungen", "ai_analysis": true}'::jsonb),

  -- Phase 6: Meta-Modell Level 3 - Verzerrungen
  ('k-metamodel-level3', 'K', 'Level 3: Verzerrungen aufdecken', 'Ursache-Wirkung und Vorannahmen hinterfragen', 'exercise', 6, 3, 20, true,
   ARRAY['Verzerrungen erkennen', 'Ursache-Wirkung-Ketten prüfen', 'Vorannahmen bewusst machen'],
   ARRAY['meta-modell', 'level-3', 'verzerrungen'],
   '{"phase": "metamodel_practice", "level": 3, "challenge": "verzerrungen", "ai_analysis": true}'::jsonb),

  -- Phase 7: Genius Gate - Kommunikation mit dem Unbewussten
  ('k-genius-gate', 'K', 'Genius Gate – Dein innerer Zugang', 'Techniken für tiefe Selbsterkenntnis durch präzise Fragen', 'theory', 7, 3, 15, true,
   ARRAY['Genius Gate Konzept verstehen', 'Zugang zum Unbewussten schaffen', 'Präzise Selbstfragen formulieren'],
   ARRAY['genius-gate', 'unbewusstes', 'selbsterkenntnis'],
   '{"phase": "genius_gate", "ai_guided": true, "deep_reflection": true}'::jsonb),

  -- Phase 8: Genius Gate Praxis
  ('k-genius-gate-practice', 'K', 'Genius Gate in der Praxis', 'Anwendung der Fragetechniken auf eigene Themen', 'exercise', 8, 4, 25, true,
   ARRAY['Genius Gate Fragen anwenden', 'Eigene Blockaden erforschen', 'Unbewusste Muster aufdecken'],
   ARRAY['genius-gate', 'praxis', 'selbstcoaching'],
   '{"phase": "genius_gate_practice", "ai_coaching": true, "personalized": true}'::jsonb),

  -- Phase 9: Inkongruenz-Finder
  ('k-incongruence-mapping', 'K', 'Inkongruenzen kartieren', 'Innere Konflikte zwischen Denken, Fühlen und Handeln erkennen', 'exercise', 9, 4, 25, true,
   ARRAY['Inkongruenzen identifizieren', 'Konflikte zwischen Ebenen erkennen', 'Muster visualisieren'],
   ARRAY['inkongruenz', 'innere-konflikte', 'selbstanalyse'],
   '{"phase": "incongruence_analysis", "ai_pattern_recognition": true, "visual_mapping": true}'::jsonb),

  -- Phase 10: Klarheits-Reflexion
  ('k-clarity-reflection', 'K', 'Deine Klarheits-Erkenntnisse', 'Integration und Reflexion aller Erkenntnisse', 'exercise', 10, 3, 20, true,
   ARRAY['Erkenntnisse zusammenfassen', 'Aha-Momente festhalten', 'Nächste Schritte definieren'],
   ARRAY['reflexion', 'integration', 'erkenntnisse'],
   '{"phase": "reflection", "ai_summary": true, "journal_integration": true}'::jsonb),

  -- Phase 11: Klarheits-Tagebuch Setup
  ('k-clarity-journal-setup', 'K', 'Dein Klarheits-Tagebuch', 'Tägliche Praxis für dauerhafte Klarheit einrichten', 'exercise', 11, 2, 15, true,
   ARRAY['Journaling-Routine etablieren', 'Klarheits-Fragen verinnerlichen', 'Kontinuierliche Praxis aufbauen'],
   ARRAY['journal', 'routine', 'gewohnheit'],
   '{"phase": "journal_setup", "ai_prompts": true, "habit_building": true}'::jsonb),

  -- Phase 12: Abschluss & Ausblick
  ('k-completion', 'K', 'Dein Klarheits-Fundament', 'Zusammenfassung und Übergang zu Lebendigkeit (L)', 'theory', 12, 2, 10, true,
   ARRAY['Fortschritt würdigen', 'Erkenntnisse verankern', 'Ausblick auf nächsten Schritt'],
   ARRAY['abschluss', 'integration', 'ausblick'],
   '{"phase": "completion", "ai_celebration": true, "next_step_preview": true}'::jsonb)

ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content_type = EXCLUDED.content_type,
  order_index = EXCLUDED.order_index,
  difficulty_level = EXCLUDED.difficulty_level,
  estimated_duration = EXCLUDED.estimated_duration,
  learning_objectives = EXCLUDED.learning_objectives,
  tags = EXCLUDED.tags,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- 2) Module Contents für jedes Modul erstellen
-- Ensure id column has default value
ALTER TABLE module_contents 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

DO $$
DECLARE
  v_module_id uuid;
  v_content_id uuid;
BEGIN
  -- K-Welcome Content
  SELECT id INTO v_module_id FROM modules WHERE slug = 'k-welcome';
  INSERT INTO module_contents (module_id, title, content, order_index, translations)
  VALUES (
    v_module_id,
    'Willkommen zur Klarheit',
    'Herzlich willkommen auf deiner Transformationsreise! Der erste Schritt – Klarheit – ist das Fundament für alles, was folgt. Ohne Klarheit über deine aktuelle Situation, deine wahren Bedürfnisse und inneren Muster, bleiben Veränderungen oberflächlich. In diesem Modul lernst du, ehrlich hinzuschauen und präzise zu erkennen, wo du wirklich stehst.',
    1,
    '{"de": {"title": "Willkommen zur Klarheit", "content": "..."}, "en": {"title": "Welcome to Clarity", "content": "..."}}'::jsonb
  )
  ON CONFLICT DO NOTHING;

  -- K-Lifewheel Analysis Content
  SELECT id INTO v_module_id FROM modules WHERE slug = 'k-lifewheel-analysis';
  INSERT INTO module_contents (module_id, title, content, order_index, translations)
  VALUES (
    v_module_id,
    'Deine aktuelle Lebenssituation',
    'Das Lebensrad ist dein Kompass für die IST-Analyse. Bewerte ehrlich und ohne Beschönigung jeden Lebensbereich: Wie zufrieden bist du wirklich? Wo gibt es Diskrepanzen zwischen dem, was du nach außen zeigst, und dem, was du innerlich fühlst?',
    1,
    '{"de": {"title": "Deine aktuelle Lebenssituation"}, "en": {"title": "Your Current Life Situation"}}'::jsonb
  )
  ON CONFLICT DO NOTHING;

  -- K-Metamodel Intro Content
  SELECT id INTO v_module_id FROM modules WHERE slug = 'k-metamodel-intro';
  INSERT INTO module_contents (module_id, title, content, order_index, translations)
  VALUES (
    v_module_id,
    'Das Meta-Modell der Sprache',
    'Das Meta-Modell ist ein mächtiges Werkzeug aus dem NLP. Es hilft dir, unpräzise Sprache zu erkennen – sowohl bei anderen als auch bei dir selbst. Denn: Die Art, wie wir sprechen, spiegelt die Art, wie wir denken. Wenn du lernst, präziser zu kommunizieren, denkst du auch klarer.

**Die drei Hauptkategorien:**
1. **Generalisierungen** (immer, nie, alle, niemand)
2. **Tilgungen** (fehlende Informationen, unvollständige Aussagen)
3. **Verzerrungen** (Ursache-Wirkung, Vorannahmen, Gedankenlesen)

Jede Kategorie hat spezifische Fragen, die mehr Klarheit schaffen.',
    1,
    '{"de": {"title": "Das Meta-Modell der Sprache"}, "en": {"title": "The Meta-Model of Language"}}'::jsonb
  )
  ON CONFLICT DO NOTHING;

  -- Weitere Contents werden in separaten Inserts hinzugefügt
END $$;

-- 3) Exercise Steps für praktische Module
DO $$
DECLARE
  v_content_id uuid;
BEGIN
  -- K-Lifewheel Analysis Steps
  SELECT mc.id INTO v_content_id 
  FROM module_contents mc 
  JOIN modules m ON mc.module_id = m.id 
  WHERE m.slug = 'k-lifewheel-analysis' 
  LIMIT 1;

  IF v_content_id IS NOT NULL THEN
    INSERT INTO excercise_steps (module_content_id, title, instructions, step_type, order_index, options, translations)
    VALUES
      (v_content_id, 'Lebensrad öffnen', 'Öffne dein persönliches Lebensrad und betrachte alle Bereiche.', 'navigation', 1, '{"action": "open_lifewheel"}'::jsonb, '{}'::jsonb),
      (v_content_id, 'IST-Bewertung', 'Bewerte jeden Bereich ehrlich: Wie zufrieden bist du aktuell (0-10)?', 'lifewheel_rating', 2, '{"rating_type": "current"}'::jsonb, '{}'::jsonb),
      (v_content_id, 'SOLL-Bewertung', 'Wie zufrieden möchtest du in jedem Bereich sein?', 'lifewheel_rating', 3, '{"rating_type": "target"}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Diskrepanzen erkennen', 'Wo sind die größten Unterschiede zwischen IST und SOLL?', 'reflection', 4, '{"prompt": "Welche Bereiche zeigen die größten Diskrepanzen?"}'::jsonb, '{}'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;

  -- K-Metamodel Level 1 Steps
  SELECT mc.id INTO v_content_id 
  FROM module_contents mc 
  JOIN modules m ON mc.module_id = m.id 
  WHERE m.slug = 'k-metamodel-level1' 
  LIMIT 1;

  IF v_content_id IS NOT NULL THEN
    INSERT INTO excercise_steps (module_content_id, title, instructions, step_type, order_index, options, translations)
    VALUES
      (v_content_id, 'Theorie: Universalquantoren', 'Lerne, was Universalquantoren sind und warum sie problematisch sein können.', 'content', 1, '{"content_type": "theory"}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Beispiele erkennen', 'Erkenne Universalquantoren in Beispielsätzen.', 'multiple_choice', 2, '{"examples": ["Ich schaffe das nie.", "Alle sind gegen mich.", "Du verstehst mich immer falsch."]}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Eigene Aussagen analysieren', 'Gib eine eigene Aussage ein, die du mit dem Meta-Modell untersuchen möchtest.', 'text_input', 3, '{"ai_analysis": true, "pattern": "universalquantoren"}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Präzisierende Fragen', 'Formuliere präzisierende Fragen zu deiner Aussage.', 'text_input', 4, '{"ai_suggestions": true}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Reflexion', 'Was hast du über deine Denkmuster gelernt?', 'reflection', 5, '{"journal_integration": true}'::jsonb, '{}'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;

  -- K-Genius Gate Practice Steps
  SELECT mc.id INTO v_content_id 
  FROM module_contents mc 
  JOIN modules m ON mc.module_id = m.id 
  WHERE m.slug = 'k-genius-gate-practice' 
  LIMIT 1;

  IF v_content_id IS NOT NULL THEN
    INSERT INTO excercise_steps (module_content_id, title, instructions, step_type, order_index, options, translations)
    VALUES
      (v_content_id, 'Thema wählen', 'Wähle ein Thema oder eine Blockade, die du erforschen möchtest.', 'text_input', 1, '{"placeholder": "z.B. Ich fühle mich in meinem Job gefangen"}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Erste Genius-Frage', 'Was genau hindert dich daran, diese Situation zu verändern?', 'text_input', 2, '{"ai_coaching": true, "depth_level": 1}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Vertiefen', 'Und was ist darunter? Was ist der wahre Grund?', 'text_input', 3, '{"ai_coaching": true, "depth_level": 2}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Kernüberzeugung', 'Welche Überzeugung liegt dieser Blockade zugrunde?', 'text_input', 4, '{"ai_coaching": true, "depth_level": 3}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Integration', 'Was hast du über dich selbst gelernt?', 'reflection', 5, '{"ai_summary": true, "journal_integration": true}'::jsonb, '{}'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;

  -- K-Incongruence Mapping Steps
  SELECT mc.id INTO v_content_id 
  FROM module_contents mc 
  JOIN modules m ON mc.module_id = m.id 
  WHERE m.slug = 'k-incongruence-mapping' 
  LIMIT 1;

  IF v_content_id IS NOT NULL THEN
    INSERT INTO excercise_steps (module_content_id, title, instructions, step_type, order_index, options, translations)
    VALUES
      (v_content_id, 'Situation identifizieren', 'Beschreibe eine Situation, in der du dich innerlich zerrissen fühlst.', 'text_input', 1, '{}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Was denkst du?', 'Was denkst du in dieser Situation? (Kognitive Ebene)', 'text_input', 2, '{"level": "cognitive"}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Was fühlst du?', 'Was fühlst du wirklich? (Emotionale Ebene)', 'text_input', 3, '{"level": "emotional"}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Was tust du?', 'Wie handelst du tatsächlich? (Verhaltensebene)', 'text_input', 4, '{"level": "behavioral"}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Inkongruenz erkennen', 'Wo widersprechen sich diese Ebenen?', 'ai_analysis', 5, '{"pattern_recognition": true, "visualization": true}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Ursachen erforschen', 'Was könnte die Ursache dieser Inkongruenz sein?', 'reflection', 6, '{"ai_insights": true}'::jsonb, '{}'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;

  -- K-Clarity Reflection Steps
  SELECT mc.id INTO v_content_id 
  FROM module_contents mc 
  JOIN modules m ON mc.module_id = m.id 
  WHERE m.slug = 'k-clarity-reflection' 
  LIMIT 1;

  IF v_content_id IS NOT NULL THEN
    INSERT INTO excercise_steps (module_content_id, title, instructions, step_type, order_index, options, translations)
    VALUES
      (v_content_id, 'Wichtigste Erkenntnisse', 'Was waren deine wichtigsten Aha-Momente in diesem Modul?', 'text_input', 1, '{"multiline": true}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Muster & Blockaden', 'Welche wiederkehrenden Muster oder Blockaden hast du erkannt?', 'text_input', 2, '{"ai_pattern_summary": true}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Größte Inkongruenz', 'Was ist deine größte Inkongruenz zwischen Denken, Fühlen und Handeln?', 'text_input', 3, '{}'::jsonb, '{}'::jsonb),
      (v_content_id, 'Nächste Schritte', 'Was möchtest du als Erstes verändern?', 'text_input', 4, '{}'::jsonb, '{}'::jsonb),
      (v_content_id, 'AI-Zusammenfassung', 'Erhalte eine personalisierte Zusammenfassung deiner Klarheits-Reise.', 'ai_summary', 5, '{"include_all_insights": true, "next_module_preview": true}'::jsonb, '{}'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 4) AI Prompt Templates für K-Modul
-- Note: Using correct column names for ai_prompt_templates table
-- First, add UNIQUE constraint on template_name if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ai_prompt_templates_template_name_key'
  ) THEN
    ALTER TABLE ai_prompt_templates 
      ADD CONSTRAINT ai_prompt_templates_template_name_key UNIQUE (template_name);
  END IF;
END $$;

INSERT INTO ai_prompt_templates (module_reference, prompt_type, template_name, prompt_template, variables, is_active)
VALUES
  ('k-welcome', 'coaching', 'k_welcome_personalized',
   'Begrüße {user_name} persönlich zum K-Modul (Klarheit). Berücksichtige ihre/seine Hauptherausforderung: {main_challenge}. Erkläre in 2-3 Sätzen, warum Klarheit der erste Schritt ist und was sie/ihn erwartet. Ton: Warm, ermutigend, authentisch.',
   '{"user_name": "string", "main_challenge": "string"}'::jsonb,
   true),

  ('k-lifewheel-analysis', 'analysis', 'k_lifewheel_insights',
   'Analysiere das Lebensrad von {user_name}. IST-Werte: {current_values}. SOLL-Werte: {target_values}. Identifiziere die 2-3 Bereiche mit den größten Diskrepanzen und gib konkrete, einfühlsame Hinweise, was diese Diskrepanzen bedeuten könnten.',
   '{"user_name": "string", "current_values": "array", "target_values": "array"}'::jsonb,
   true),

  ('k-metamodel-level1', 'analysis', 'k_metamodel_analysis',
   'Analysiere folgende Aussage mit dem Meta-Modell: "{user_statement}". Identifiziere Muster (Generalisierungen, Tilgungen, Verzerrungen) und generiere präzisierende Fragen. Level: {level}. Fokus: {challenge}.',
   '{"user_statement": "string", "level": "integer", "challenge": "string"}'::jsonb,
   true),

  ('k-genius-gate-practice', 'coaching', 'k_genius_gate_coaching',
   'Führe {user_name} durch einen Genius-Gate-Prozess. Thema: {topic}. Aktuelle Tiefe: {depth_level}. Stelle eine präzise, tiefgehende Frage, die zum Kern der Blockade führt. Nutze sokratische Fragetechnik.',
   '{"user_name": "string", "topic": "string", "depth_level": "integer"}'::jsonb,
   true),

  ('k-incongruence-mapping', 'analysis', 'k_incongruence_insights',
   'Analysiere die Inkongruenz von {user_name}. Denken: {cognitive}. Fühlen: {emotional}. Handeln: {behavioral}. Identifiziere Widersprüche und gib einfühlsame Hinweise zu möglichen Ursachen.',
   '{"user_name": "string", "cognitive": "string", "emotional": "string", "behavioral": "string"}'::jsonb,
   true),

  ('k-completion', 'summary', 'k_completion_summary',
   'Erstelle eine persönliche Zusammenfassung für {user_name} über ihre/seine Klarheits-Reise. Wichtigste Erkenntnisse: {key_insights}. Muster: {patterns}. Würdige den Fortschritt und gib einen motivierenden Ausblick auf das L-Modul (Lebendigkeit).',
   '{"user_name": "string", "key_insights": "array", "patterns": "array"}'::jsonb,
   true)

ON CONFLICT (template_name) DO UPDATE SET
  prompt_template = EXCLUDED.prompt_template,
  variables = EXCLUDED.variables,
  updated_at = now();

-- 5) User Progress Tracking für K-Modul
CREATE TABLE IF NOT EXISTS k_module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_phase text NOT NULL, -- welcome, ist_analysis, metamodel_intro, etc.
  completed_phases text[] DEFAULT '{}',
  metamodel_level integer DEFAULT 1,
  lifewheel_completed boolean DEFAULT false,
  genius_gate_sessions integer DEFAULT 0,
  incongruence_maps_created integer DEFAULT 0,
  key_insights jsonb DEFAULT '[]'::jsonb,
  patterns_identified jsonb DEFAULT '[]'::jsonb,
  started_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS Policies für k_module_progress
ALTER TABLE k_module_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own K-module progress"
  ON k_module_progress FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own K-module progress"
  ON k_module_progress FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own K-module progress"
  ON k_module_progress FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Indexes
CREATE INDEX IF NOT EXISTS k_module_progress_user_id_idx ON k_module_progress(user_id);
CREATE INDEX IF NOT EXISTS k_module_progress_current_phase_idx ON k_module_progress(current_phase);

-- 6) Function: Update K-Module Progress
CREATE OR REPLACE FUNCTION update_k_module_progress(
  p_user_id uuid,
  p_phase text,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_progress jsonb;
BEGIN
  -- Insert or update progress
  INSERT INTO k_module_progress (user_id, current_phase, last_activity_at, metadata)
  VALUES (p_user_id, p_phase, now(), p_data)
  ON CONFLICT (user_id) DO UPDATE SET
    current_phase = p_phase,
    completed_phases = CASE 
      WHEN NOT (p_phase = ANY(k_module_progress.completed_phases)) 
      THEN array_append(k_module_progress.completed_phases, k_module_progress.current_phase)
      ELSE k_module_progress.completed_phases
    END,
    last_activity_at = now(),
    metadata = k_module_progress.metadata || p_data,
    updated_at = now();

  -- Return updated progress
  SELECT jsonb_build_object(
    'current_phase', current_phase,
    'completed_phases', completed_phases,
    'metamodel_level', metamodel_level,
    'progress_percentage', (array_length(completed_phases, 1)::float / 12.0 * 100)::int
  ) INTO v_progress
  FROM k_module_progress
  WHERE user_id = p_user_id;

  RETURN v_progress;
END;
$$;

COMMENT ON TABLE k_module_progress IS 'Tracks detailed progress through the K (Klarheit/Clarity) module transformation journey';
COMMENT ON FUNCTION update_k_module_progress IS 'Updates user progress in K-module and returns current state';
