-- supabase/migrations/20250417000000_transformation_content.sql

-- First, create the schema
CREATE SCHEMA IF NOT EXISTS klare_content;

-- Create tables
CREATE TABLE IF NOT EXISTS klare_content.transformation_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id TEXT NOT NULL CHECK (step_id IN ('K', 'L', 'A', 'R', 'E')),
  from_text TEXT NOT NULL,
  to_text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_transformation_paths_step_id ON klare_content.transformation_paths(step_id);
CREATE INDEX IF NOT EXISTS idx_transformation_paths_sort_order ON klare_content.transformation_paths(sort_order);

-- Create a table for practical exercises
CREATE TABLE IF NOT EXISTS klare_content.practical_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id TEXT NOT NULL CHECK (step_id IN ('K', 'L', 'A', 'R', 'E')),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_practical_exercises_step_id ON klare_content.practical_exercises(step_id);
CREATE INDEX IF NOT EXISTS idx_practical_exercises_sort_order ON klare_content.practical_exercises(sort_order);

-- Create a table for supporting questions
CREATE TABLE IF NOT EXISTS klare_content.supporting_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id TEXT NOT NULL CHECK (step_id IN ('K', 'L', 'A', 'R', 'E')),
  question_text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_supporting_questions_step_id ON klare_content.supporting_questions(step_id);
CREATE INDEX IF NOT EXISTS idx_supporting_questions_sort_order ON klare_content.supporting_questions(sort_order);

-- Enable row level security
ALTER TABLE klare_content.transformation_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE klare_content.practical_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE klare_content.supporting_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (admin access)
CREATE POLICY "Service role can do anything" 
ON klare_content.transformation_paths
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Everyone (authenticated users) can read transformation paths
CREATE POLICY "Everyone can read transformation paths" 
ON klare_content.transformation_paths
FOR SELECT 
TO authenticated
USING (true);

-- Service role policies for practical exercises
CREATE POLICY "Service role can do anything" 
ON klare_content.practical_exercises
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Everyone can read exercises
CREATE POLICY "Everyone can read exercises" 
ON klare_content.practical_exercises
FOR SELECT 
TO authenticated
USING (true);

-- Service role policies for supporting questions
CREATE POLICY "Service role can do anything" 
ON klare_content.supporting_questions
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Everyone can read questions
CREATE POLICY "Everyone can read questions" 
ON klare_content.supporting_questions
FOR SELECT 
TO authenticated
USING (true);

-- Create triggers to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transformation_paths_modtime
BEFORE UPDATE ON klare_content.transformation_paths
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_practical_exercises_modtime
BEFORE UPDATE ON klare_content.practical_exercises
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_supporting_questions_modtime
BEFORE UPDATE ON klare_content.supporting_questions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Insert initial data for transformation paths
INSERT INTO klare_content.transformation_paths (step_id, from_text, to_text, sort_order)
VALUES
  -- K - Klarheit
  ('K', 'Vermeidung und Verdrängung', 'Ehrliche Selbstreflexion', 1),
  ('K', 'Unklarheit über Ist-Zustand', 'Präzise Standortbestimmung', 2),
  ('K', 'Selbsttäuschung', 'Authentische Selbsterkenntnis', 3),
  
  -- L - Lebendigkeit
  ('L', 'Energielosigkeit und Blockaden', 'Natürliche Lebensenergie', 1),
  ('L', 'Verschüttete Ressourcen', 'Wiederentdeckte Kraftquellen', 2),
  ('L', 'Stagnation im Alltag', 'Spontane Leichtigkeit', 3),
  
  -- A - Ausrichtung
  ('A', 'Widersprüchliche Ziele', 'Kongruente Zielausrichtung', 1),
  ('A', 'Getrennte Lebensbereiche', 'Ganzheitliche Integration', 2),
  ('A', 'Wertekonflikt', 'Innere Werte-Harmonie', 3),
  
  -- R - Realisierung
  ('R', 'Ideen ohne Umsetzung', 'Konsequente Realisierung', 1),
  ('R', 'Sporadische Bemühungen', 'Nachhaltige Integration im Alltag', 2),
  ('R', 'Rückfall in alte Muster', 'Selbstverstärkende neue Gewohnheiten', 3),
  
  -- E - Entfaltung
  ('E', 'Stagnierende Entwicklung', 'Kontinuierliches Wachstum', 1),
  ('E', 'Anstrengende Zielerreichung', 'Mühelose Manifestation', 2),
  ('E', 'Fragmentierte Lebensbereiche', 'Vollständige Kongruenz in allen Dimensionen', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert initial data for practical exercises
INSERT INTO klare_content.practical_exercises (step_id, title, description, sort_order)
VALUES
  -- K - Klarheit
  ('K', 'Lebensrad-Analyse zur Standortbestimmung', 'Bewerte deine aktuelle Situation in allen wichtigen Lebensbereichen, um ein klares Bild deines Ist-Zustands zu erhalten.', 1),
  ('K', 'Journaling zu Diskrepanzen zwischen Wunsch und Realität', 'Schreibe auf, wo du Unterschiede zwischen deinem gewünschten und deinem tatsächlichen Leben wahrnimmst.', 2),
  ('K', 'Feedback-Einholung von vertrauten Personen', 'Bitte Menschen, die dich gut kennen, um ehrliches Feedback zu deinen blinden Flecken.', 3),
  
  -- L - Lebendigkeit
  ('L', 'Identifikation von Momenten natürlicher Lebendigkeit', 'Sammle Erfahrungen, in denen du dich besonders lebendig und energiegeladen gefühlt hast.', 1),
  ('L', 'Ressourcen-Anker für positive Energiezustände', 'Erschaffe kraftvolle Anker, die positive Energiezustände in dir auslösen können.', 2),
  ('L', 'Blockaden-Mapping und Auflösungsstrategien', 'Identifiziere Energieblockaden und entwickle Strategien zu ihrer Auflösung.', 3),
  
  -- A - Ausrichtung
  ('A', 'Werte-Hierarchie und Lebensbereiche-Integration', 'Ordne deine Werte hierarchisch und integriere sie in alle Lebensbereiche.', 1),
  ('A', 'Visionboard für Ihre ideale Kongruenz', 'Visualisiere deine ideale Zukunft mit vollständiger Kongruenz in allen Bereichen.', 2),
  ('A', 'Ausrichtungs-Check für Entscheidungen', 'Lerne, deine Entscheidungen auf Kongruenz mit deinen tiefsten Werten zu überprüfen.', 3),
  
  -- R - Realisierung
  ('R', 'Micro-Habits für tägliche Kongruenz-Praxis', 'Integriere kleine, kongruente Gewohnheiten in deinen Alltag.', 1),
  ('R', 'Wochenplan mit integrierten Kongruenz-Ritualen', 'Gestalte deinen Wochenplan bewusst mit Ritualen, die deine Kongruenz stärken.', 2),
  ('R', 'Fortschrittstracking mit visuellen Hilfsmitteln', 'Halte deinen Fortschritt visuell fest, um Motivation und Durchhaltevermögen zu stärken.', 3),
  
  -- E - Entfaltung
  ('E', 'Regelmäßiger Kongruenz-Check mit dem KLARE-System', 'Wende regelmäßig das KLARE-System an, um deine Kongruenz kontinuierlich zu verfeinern.', 1),
  ('E', 'Journaling zu mühelosen Erfolgs-Momenten', 'Dokumentiere Momente müheloser Manifestation und Erfolge, die aus vollständiger Kongruenz entstanden sind.', 2),
  ('E', 'Mentoring und Weitergabe Ihrer Erkenntnisse', 'Teile deine Erkenntnisse mit anderen und festige dadurch dein eigenes Wachstum.', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert initial data for supporting questions
INSERT INTO klare_content.supporting_questions (step_id, question_text, sort_order)
VALUES
  -- K - Klarheit
  ('K', 'Welche Diskrepanzen zwischen Wunsch und Realität nehme ich aktuell in meinen Lebensbereichen wahr?', 1),
  ('K', 'In welchen Bereichen meines Lebens fühle ich mich nicht vollständig authentisch?', 2),
  ('K', 'Welche Glaubenssätze hindern mich an einer realistischen Selbstwahrnehmung?', 3),
  
  -- L - Lebendigkeit
  ('L', 'In welchen Momenten fühle ich mich vollständig lebendig und energiegeladen?', 1),
  ('L', 'Welche Aktivitäten oder Umgebungen blockieren meinen natürlichen Energiefluss?', 2),
  ('L', 'Welche verschütteten Talente und Ressourcen möchte ich wiederentdecken?', 3),
  
  -- A - Ausrichtung
  ('A', 'Wie kann ich meine unterschiedlichen Lebensbereiche harmonischer integrieren?', 1),
  ('A', 'Welche meiner Werte stehen aktuell im Konflikt miteinander?', 2),
  ('A', 'Wie kann ich meine Ziele mit meinen tiefsten Werten in Einklang bringen?', 3),
  
  -- R - Realisierung
  ('R', 'Welche konkreten täglichen Gewohnheiten können meine Kongruenz unterstützen?', 1),
  ('R', 'Wie kann ich Hindernisse für die nachhaltige Umsetzung überwinden?', 2),
  ('R', 'Welche Strukturen brauche ich, um alte Muster zu durchbrechen?', 3),
  
  -- E - Entfaltung
  ('E', 'Wie kann ich mein Wachstum mühelos und natürlich gestalten?', 1),
  ('E', 'In welchen Bereichen erlebe ich bereits mühelose Manifestation?', 2),
  ('E', 'Wie kann ich anderen von meinen Erkenntnissen weitergeben?', 3)
ON CONFLICT (id) DO NOTHING;
