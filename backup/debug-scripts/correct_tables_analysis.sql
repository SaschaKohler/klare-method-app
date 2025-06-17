-- KLARE Method App: Korrekte Tabellen-Analyse für Interactive Exercises
-- Basierend auf echten Migration-Dateien

-- === HAUPTTABELLEN ===
-- public schema:
-- - module_contents (100% übersetzt laut Memory) - Haupt-Module/Exercises
-- - exercise_steps (100% übersetzt laut Memory) - Einzelschritte von Exercises  
-- - content_sections (86.4% übersetzt laut Memory) - Content-Abschnitte
-- - quiz_questions (100% übersetzt laut Memory) - Quiz-Fragen

-- klare_content schema:
-- - practical_exercises (Status unbekannt) - Praktische Übungen pro KLARE-Schritt
-- - supporting_questions (Status unbekannt) - Unterstützende Fragen pro KLARE-Schritt
-- - transformation_paths (Status unbekannt) - Transformationspfade

-- 1. Praktische Übungen Status (Resource Finder etc.)
SELECT 
    'Practical Exercises (klare_content)' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN translations IS NOT NULL AND translations->>'en' IS NOT NULL THEN 1 END) as translated_count,
    ROUND(
        (COUNT(CASE WHEN translations IS NOT NULL AND translations->>'en' IS NOT NULL THEN 1 END)::decimal / COUNT(*)) * 100, 
        1
    ) as translation_percentage
FROM klare_content.practical_exercises;

-- 2. Unterstützende Fragen Status
SELECT 
    'Supporting Questions (klare_content)' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN translations IS NOT NULL AND translations->>'en' IS NOT NULL THEN 1 END) as translated_count,
    ROUND(
        (COUNT(CASE WHEN translations IS NOT NULL AND translations->>'en' IS NOT NULL THEN 1 END)::decimal / COUNT(*)) * 100, 
        1
    ) as translation_percentage
FROM klare_content.supporting_questions;

-- 3. Transformationspfade Status
SELECT 
    'Transformation Paths (klare_content)' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN translations IS NOT NULL AND translations->>'en' IS NOT NULL THEN 1 END) as translated_count,
    ROUND(
        (COUNT(CASE WHEN translations IS NOT NULL AND translations->>'en' IS NOT NULL THEN 1 END)::decimal / COUNT(*)) * 100, 
        1
    ) as translation_percentage
FROM klare_content.transformation_paths;

-- 4. Detailanalyse: Was sind die praktischen Übungen (Resource Finder etc.)?
SELECT 
    step_id,
    title,
    description,
    CASE 
        WHEN translations IS NULL THEN 'No translations'
        WHEN translations->>'en' IS NULL THEN 'Missing EN translation'
        ELSE 'Has translation'
    END as translation_status,
    translations->>'en' as english_data
FROM klare_content.practical_exercises
ORDER BY step_id, sort_order;

-- 5. Detailanalyse: Unterstützende Fragen
SELECT 
    step_id,
    question_text,
    CASE 
        WHEN translations IS NULL THEN 'No translations'
        WHEN translations->>'en' IS NULL THEN 'Missing EN translation'
        ELSE 'Has translation'
    END as translation_status
FROM klare_content.supporting_questions
ORDER BY step_id, sort_order;

-- 6. Module Contents mit content_type='exercise' (bereits 100% übersetzt)
SELECT 
    module_id,
    title,
    description,
    content,
    translations->>'en' as english_translation
FROM module_contents 
WHERE content_type = 'exercise'
ORDER BY module_id;

-- 7. AI-Integration: Welche Tabellen sind für interaktive Exercises relevant?
SELECT 
    'AI Integration Priority' as category,
    'klare_content.practical_exercises - High Priority (Resource Finder etc.)' as table_1,
    'klare_content.supporting_questions - High Priority (Coaching Fragen)' as table_2,
    'module_contents (exercise) - Already 100% translated ✓' as table_3,
    'exercise_steps - Already 100% translated ✓' as table_4;

-- 8. KLARE → CLEAR Mapping Check für klare_content Tabellen
SELECT DISTINCT
    step_id,
    COUNT(*) as count_per_step
FROM klare_content.practical_exercises
GROUP BY step_id
ORDER BY step_id;
