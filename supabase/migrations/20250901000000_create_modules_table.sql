-- =============================================
-- Create modules table as source of truth
-- Must run BEFORE 20251002084500_modules_source_of_truth.sql
-- =============================================

CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  klare_step text NOT NULL CHECK (klare_step IN ('K', 'L', 'A', 'R', 'E')),
  title text NOT NULL,
  description text,
  content_type text CHECK (content_type IN ('intro', 'theory', 'exercise', 'quiz', 'video')),
  order_index integer NOT NULL,
  difficulty_level integer CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_duration integer, -- in Minuten
  is_active boolean DEFAULT true,
  prerequisites text[], -- Array von module slugs
  learning_objectives text[],
  tags text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS modules_slug_idx ON modules(slug);
CREATE INDEX IF NOT EXISTS modules_klare_step_idx ON modules(klare_step);
CREATE INDEX IF NOT EXISTS modules_order_idx ON modules(klare_step, order_index);
CREATE INDEX IF NOT EXISTS modules_is_active_idx ON modules(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Modules are viewable by everyone"
  ON modules FOR SELECT
  USING (true);

-- Ensure update_updated_at function exists
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed initial modules from existing module_contents (if they exist)
-- Note: module_contents doesn't have klare_step column, so we skip seeding
-- The actual modules will be inserted by subsequent migrations (e.g., 20250109000001_k_module_complete_flow.sql)

-- Optionally, insert placeholder modules for existing content
INSERT INTO modules (slug, klare_step, title, description, content_type, order_index, difficulty_level, estimated_duration, is_active, tags)
VALUES
  ('k-intro', 'K', 'Klarheit - Einführung', 'Willkommen zur Klarheit', 'intro', 1, 1, 15, true, ARRAY['klarheit', 'einstieg']),
  ('k-meta-model', 'K', 'Meta-Modell der Sprache', 'Präzise Kommunikation für mehr Klarheit', 'exercise', 2, 3, 25, true, ARRAY['meta-modell', 'kommunikation']),
  ('l-intro', 'L', 'Lebendigkeit - Einführung', 'Vitale Energie entdecken', 'intro', 1, 1, 15, true, ARRAY['lebendigkeit', 'energie']),
  ('l-anchoring', 'L', 'Ressourcen-Anker', 'Positive Zustände verankern', 'exercise', 2, 2, 20, true, ARRAY['anchoring', 'ressourcen']),
  ('a-intro', 'A', 'Ausrichtung - Einführung', 'Wahre Richtung finden', 'intro', 1, 1, 15, true, ARRAY['ausrichtung', 'ziele']),
  ('a-timeline', 'A', 'Timeline-Arbeit', 'Vergangenheit heilen, Zukunft gestalten', 'exercise', 2, 4, 30, true, ARRAY['timeline', 'zukunft']),
  ('r-intro', 'R', 'Realisierung - Einführung', 'Vom Wissen zum Handeln', 'intro', 1, 1, 15, true, ARRAY['realisierung', 'handeln']),
  ('r-parts-integration', 'R', 'Innere Teile Integration', 'Konflikte lösen, Ganzheit finden', 'exercise', 2, 4, 35, true, ARRAY['integration', 'teile']),
  ('e-intro', 'E', 'Entfaltung - Einführung', 'Authentisch leben', 'intro', 1, 1, 15, true, ARRAY['entfaltung', 'authentizität']),
  ('e-transformation', 'E', 'Transformationsprozess', 'Nachhaltige Veränderung', 'exercise', 2, 5, 40, true, ARRAY['transformation', 'integration'])
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE modules IS 'Source of truth for module metadata. module_contents contains the actual content.';
COMMENT ON COLUMN modules.slug IS 'Unique identifier for the module, used in URLs and code';
COMMENT ON COLUMN modules.klare_step IS 'Which KLARE step this module belongs to: K, L, A, R, or E';
COMMENT ON COLUMN modules.prerequisites IS 'Array of module slugs that must be completed before this one';
COMMENT ON COLUMN modules.learning_objectives IS 'What the user will learn/achieve in this module';
COMMENT ON COLUMN modules.metadata IS 'Flexible JSON field for module-specific configuration';
