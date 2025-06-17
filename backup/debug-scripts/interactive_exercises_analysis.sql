-- KLARE Method App: Interactive Exercises & Modules Translation Analysis
-- Korrigierte Version - fokussiert auf noch zu übersetzende interaktive Inhalte
-- Speziell für AI-Integration vorbereitet

-- 1. Exercise Steps Status (bereits 100% übersetzt laut Memory)
SELECT 
    'Exercise Steps' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN translations IS NOT NULL AND translations->>'en' IS NOT NULL THEN 1 END) as translated_count,
    ROUND(
        (COUNT(CASE WHEN translations IS NOT NULL AND translations->>'en' IS NOT NULL THEN 1 END)::decimal / COUNT(*)) * 100, 
        1
    ) as translation_percentage
FROM exercise_steps;

-- 2. Module Contents Status (bereits 100% übersetzt laut Memory)
SELECT 
    'Module Contents' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN translations IS NOT NULL AND translations->>'en' IS NOT NULL THEN 1 END) as translated_count,
    ROUND(
        (COUNT(CASE WHEN translations IS NOT NULL AND translations->>'en' IS NOT NULL THEN 1 END)::decimal / COUNT(*)) * 100, 
        1
    ) as translation_percentage
FROM module_contents;

-- 3. Interaktive Module mit Exercise Steps (für Resource Finder etc.)
SELECT 
    mc.id as module_id,
    mc.title as module_title,
    mc.content_type,
    mc.step_id,
    COUNT(es.id) as exercise_steps_count,
    COUNT(CASE WHEN es.translations IS NOT NULL AND es.translations->>'en' IS NOT NULL THEN 1 END) as translated_steps
FROM module_contents mc
LEFT JOIN exercise_steps es ON mc.id = es.module_content_id
WHERE mc.content_type = 'exercise' OR mc.title ILIKE '%finder%' OR mc.title ILIKE '%übung%'
GROUP BY mc.id, mc.title, mc.content_type, mc.step_id
ORDER BY mc.step_id, mc.title;

-- 4. Resource Finder und ähnliche interaktive Exercises identifizieren
SELECT 
    mc.id,
    mc.title,
    mc.description,
    mc.content_type,
    mc.step_id,
    mc.translations->>'en' as english_title,
    CASE 
        WHEN mc.translations IS NULL THEN 'No translations'
        WHEN mc.translations->>'en' IS NULL THEN 'Missing EN translation'
        ELSE 'Has translation'
    END as translation_status
FROM module_contents mc
WHERE 
    mc.title ILIKE '%finder%' 
    OR mc.title ILIKE '%resource%'
    OR mc.title ILIKE '%interaktiv%'
    OR mc.content_type = 'exercise'
ORDER BY mc.step_id, mc.title;

-- 5. Exercise Steps die zu interaktiven Modulen gehören
SELECT 
    es.id,
    es.title as step_title,
    es.instructions,
    es.step_type,
    mc.title as parent_module,
    mc.step_id,
    CASE 
        WHEN es.translations IS NULL THEN 'No translations'
        WHEN es.translations->>'en' IS NULL THEN 'Missing EN translation'
        ELSE 'Has translation'
    END as translation_status
FROM exercise_steps es
JOIN module_contents mc ON es.module_content_id = mc.id
WHERE mc.content_type = 'exercise' OR mc.title ILIKE '%finder%'
ORDER BY mc.step_id, es.order_index;

-- 6. AI-Integration Vorbereitung: Strukturanalyse für interaktive Exercises
SELECT 
    'Interactive Exercise Structure for AI' as analysis_type,
    'Module: title + description → Steps: title + instructions + options' as structure,
    'AI-Prompt: Kontext (Modul) → Schritte → Optionen/Eingaben → Feedback' as ai_workflow;

-- 7. KLARE → CLEAR Step Mapping für interaktive Exercises
SELECT DISTINCT
    mc.step_id,
    mc.title as german_module,
    mc.translations->>'en' as english_module,
    COUNT(es.id) as steps_count
FROM module_contents mc
LEFT JOIN exercise_steps es ON mc.id = es.module_content_id
WHERE mc.content_type = 'exercise'
GROUP BY mc.step_id, mc.title, mc.translations->>'en'
ORDER BY mc.step_id;
