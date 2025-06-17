-- Migration: RPC-Funktionen für den Zugriff auf übersetzte Inhalte (Teil 2)
-- Fortsetzung der RPC-Funktionen

-- RPC für transformation_paths mit Übersetzung
CREATE OR REPLACE FUNCTION get_translated_transformation_paths(p_step_id TEXT, p_lang TEXT DEFAULT 'en')
RETURNS TABLE (
  id TEXT,
  step_id TEXT,
  from_text TEXT,
  to_text TEXT,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tp.id,
    tp.step_id,
    get_translated_text(tp.from_text, tp.translations, 'from_text', p_lang),
    get_translated_text(tp.to_text, tp.translations, 'to_text', p_lang),
    tp.sort_order
  FROM 
    klare_content.transformation_paths tp
  WHERE 
    tp.step_id = p_step_id
  ORDER BY 
    tp.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC für content_sections mit Übersetzung
CREATE OR REPLACE FUNCTION get_translated_content_sections(p_module_content_id TEXT, p_lang TEXT DEFAULT 'en')
RETURNS TABLE (
  id TEXT,
  module_content_id TEXT,
  title TEXT,
  content TEXT,
  media_url TEXT,
  order_index INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.module_content_id,
    get_translated_text(cs.title, cs.translations, 'title', p_lang),
    get_translated_text(cs.content, cs.translations, 'content', p_lang),
    cs.media_url,
    cs.order_index
  FROM 
    public.content_sections cs
  WHERE 
    cs.module_content_id = p_module_content_id
  ORDER BY 
    cs.order_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kommentare für Entwickler
COMMENT ON FUNCTION get_translated_transformation_paths IS 'Gibt übersetzte transformation_paths für eine bestimmte step_id zurück. Parametrisiert mit Sprachcode.';
COMMENT ON FUNCTION get_translated_content_sections IS 'Gibt übersetzte content_sections für eine bestimmte module_content_id zurück. Parametrisiert mit Sprachcode.';
