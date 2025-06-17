-- Discovery script to find exact function signatures
-- Run this first to see the actual function signatures in your database

SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    'ALTER FUNCTION ' || n.nspname || '.' || p.proname || '(' || 
    pg_get_function_identity_arguments(p.oid) || ') SET search_path = '''';' as fix_command
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN (
    'get_translated_text',
    'set_translation', 
    'update_translations',
    'get_transformation_paths',
    'get_practical_exercises',
    'get_supporting_questions',
    'get_translated_practical_exercises',
    'get_translated_supporting_questions', 
    'get_translated_transformation_paths',
    'get_translated_content_sections',
    'get_translated_life_wheel_areas',
    'set_life_wheel_area_translation',
    'set_life_wheel_area_translations',
    'set_updated_at',
    'update_modified_column',
    'update_lifewheel_from_exercise',
    'import_translations_batch'
)
AND n.nspname = 'public'
ORDER BY p.proname;
