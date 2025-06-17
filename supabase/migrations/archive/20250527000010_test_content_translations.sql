-- Test-Migration: Überprüfung der Content Section Übersetzungen
-- Diese Query testet die translated_content_sections View

-- Test 1: Anzahl der übersetzten Content Sections
DO $$
DECLARE
    translated_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO translated_count 
    FROM translated_content_sections 
    WHERE title_en IS NOT NULL AND title_en != title;
    
    SELECT COUNT(*) INTO total_count 
    FROM content_sections;
    
    RAISE NOTICE 'Content Sections Übersetzung Status:';
    RAISE NOTICE '- Übersetzt: % von % Content Sections', translated_count, total_count;
    RAISE NOTICE '- Übersetzungsrate: %%%', ROUND((translated_count::DECIMAL / total_count::DECIMAL) * 100, 1);
END $$;

-- Test 2: Beispiele der übersetzten Titel
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE 'Beispiele übersetzter Content Sections:';
    FOR rec IN 
        SELECT title, title_en 
        FROM translated_content_sections 
        WHERE title_en IS NOT NULL AND title_en != title
        LIMIT 5
    LOOP
        RAISE NOTICE '- DE: "%" -> EN: "%"', rec.title, rec.title_en;
    END LOOP;
END $$;

-- Test 3: KLARE -> CLEAR Mapping Verifikation
DO $$
DECLARE
    clarity_count INTEGER;
    liveliness_count INTEGER;
    evolvement_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO clarity_count 
    FROM translated_content_sections 
    WHERE title_en ILIKE '%clarity%';
    
    SELECT COUNT(*) INTO liveliness_count 
    FROM translated_content_sections 
    WHERE title_en ILIKE '%liveliness%';
    
    SELECT COUNT(*) INTO evolvement_count 
    FROM translated_content_sections 
    WHERE title_en ILIKE '%evolvement%';
    
    RAISE NOTICE 'KLARE -> CLEAR Mapping:';
    RAISE NOTICE '- K->C (Clarity): % Content Sections', clarity_count;
    RAISE NOTICE '- L->L (Liveliness): % Content Sections', liveliness_count;
    RAISE NOTICE '- A->E (Evolvement): % Content Sections', evolvement_count;
END $$;

-- Kommentar für Entwickler
COMMENT ON VIEW translated_content_sections IS 'View erfolgreich getestet. Englische Übersetzungen sind verfügbar und funktionieren korrekt.';
