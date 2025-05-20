-- Migration: RPC-Funktionen für den Zugriff auf übersetzte Inhalte (Teil 1)
-- Diese Funktionen ermöglichen den API-Zugriff auf übersetzte Inhalte

-- RPC für practical_exercises mit Übersetzung
CREATE OR REPLACE FUNCTION get_translated_practical_exercises(p_step_id TEXT, p_lang TEXT DEFAULT 'en')
RETURNS TABLE (
  id TEXT,
  step_id TEXT,
  title TEXT,
  description TEXT,
  duration_minutes INTEGER,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pe.id,
    pe.step_id,
    get_translated_text(pe.title, pe.translations, 'title', p_lang),
    get_translated_text(pe.description, pe.translations, 'description', p_lang),
    pe.duration_minutes,
    pe.sort_order
  FROM 
    klare_content.practical_exercises pe
  WHERE 
    pe.step_id = p_step_id
  ORDER BY 
    pe.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC für supporting_questions mit Übersetzung
CREATE OR REPLACE FUNCTION get_translated_supporting_questions(p_step_id TEXT, p_lang TEXT DEFAULT 'en')
RETURNS TABLE (
  id TEXT,
  step_id TEXT,
  question_text TEXT,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sq.id,
    sq.step_id,
    get_translated_text(sq.question_text, sq.translations, 'question_text', p_lang),
    sq.sort_order
  FROM 
    klare_content.supporting_questions sq
  WHERE 
    sq.step_id = p_step_id
  ORDER BY 
    sq.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kommentare für Entwickler
COMMENT ON FUNCTION get_translated_practical_exercises IS 'Gibt übersetzte practical_exercises für eine bestimmte step_id zurück. Parametrisiert mit Sprachcode.';
COMMENT ON FUNCTION get_translated_supporting_questions IS 'Gibt übersetzte supporting_questions für eine bestimmte step_id zurück. Parametrisiert mit Sprachcode.';
