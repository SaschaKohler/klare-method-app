-- KLARE Method App: Interactive Exercises Translation Analysis
-- Erstellt für AI-freundliche Übersetzungsplanung

-- 1. Practical Exercises Übersetzungsstatus
SELECT 
    'Practical Exercises' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN translations IS NOT NULL AND translations->>'en' IS NOT NULL THEN 1 END) as translated_count,
    ROUND(
        (COUNT(CASE WHEN translations IS NOT NULL AND translations->>'en' IS NOT NULL THEN 1 END)::decimal / COUNT(*)) * 100, 
        1
    ) as translation_percentage
FROM practical_exercises;

-- 2. Unübersetzte Practical Exercises Details
SELECT 
    id,
    title,
    description,
    step_id,
    duration_minutes,
    sort_order,
    CASE 
        WHEN translations IS NULL THEN 'No translations'
        WHEN translations->>'en' IS NULL THEN 'Missing EN translation'
        ELSE 'Has translation'
    END as translation_status
FROM practical_exercises
WHERE translations IS NULL OR translations->>'en' IS NULL
ORDER BY step_id, sort_order;

-- 3. Supporting Questions Übersetzungsstatus  
SELECT 
    'Supporting Questions' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN translations IS NOT NULL AND translations->>'en' IS NOT NULL THEN 1 END) as translated_count,
    ROUND(
        (COUNT(CASE WHEN translations IS NOT NULL AND translations->>'en' IS NOT NULL THEN 1 END)::decimal / COUNT(*)) * 100, 
        1
    ) as translation_percentage
FROM supporting_questions;

-- 4. Unübersetzte Supporting Questions Details
SELECT 
    id,
    question,
    step_id,
    sort_order,
    CASE 
        WHEN translations IS NULL THEN 'No translations'
        WHEN translations->>'en' IS NULL THEN 'Missing EN translation'
        ELSE 'Has translation'
    END as translation_status
FROM supporting_questions
WHERE translations IS NULL OR translations->>'en' IS NULL
ORDER BY step_id, sort_order;

-- 5. Step-basierte Exercise-Verteilung (für KLARE → CLEAR Mapping)
SELECT 
    pe.step_id,
    COUNT(pe.id) as practical_exercises_count,
    COUNT(sq.id) as supporting_questions_count,
    COUNT(CASE WHEN pe.translations IS NOT NULL AND pe.translations->>'en' IS NOT NULL THEN 1 END) as pe_translated,
    COUNT(CASE WHEN sq.translations IS NOT NULL AND sq.translations->>'en' IS NOT NULL THEN 1 END) as sq_translated
FROM practical_exercises pe
FULL OUTER JOIN supporting_questions sq ON pe.step_id = sq.step_id
GROUP BY pe.step_id
ORDER BY pe.step_id;

-- 6. AI-Prompting Struktur-Analyse
SELECT 
    'Practical Exercises Fields' as analysis_type,
    'title, description, duration_minutes' as key_fields_for_ai,
    'AI-Struktur: Titel → Beschreibung → Dauer → Schritte' as ai_prompt_structure;

SELECT 
    'Supporting Questions Fields' as analysis_type,
    'question, step_id, sort_order' as key_fields_for_ai,
    'AI-Struktur: Frage → Kontext (Step) → Reihenfolge' as ai_prompt_structure;

-- 7. Terminologie-Konsistenz für AI-Training
SELECT DISTINCT
    step_id,
    title as german_title,
    translations->>'en' as english_title
FROM practical_exercises
WHERE translations IS NOT NULL AND translations->>'en' IS NOT NULL
ORDER BY step_id;
