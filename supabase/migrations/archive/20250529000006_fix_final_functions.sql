-- Final fix: Exact function signatures for the last 2 functions
-- Based on discovery query results

-- Fix set_life_wheel_area_translation with correct signature
ALTER FUNCTION public.set_life_wheel_area_translation(p_id text, p_lang text, p_field text, p_value text) SET search_path = '';

-- Fix set_life_wheel_area_translations with correct signature  
ALTER FUNCTION public.set_life_wheel_area_translations(p_id text, p_lang text, p_translations jsonb) SET search_path = '';

-- Success confirmation
DO $$
BEGIN
    RAISE NOTICE 'SUCCESS: All remaining function search_path issues have been fixed!';
    RAISE NOTICE 'Fixed: set_life_wheel_area_translation(p_id text, p_lang text, p_field text, p_value text)';
    RAISE NOTICE 'Fixed: set_life_wheel_area_translations(p_id text, p_lang text, p_translations jsonb)';
END $$;
