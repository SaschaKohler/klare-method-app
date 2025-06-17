-- Migration: Fix function search_path security warnings (SAFE APPROACH)
-- This migration adds SET search_path = '' but handles missing functions gracefully

-- Use DO blocks to safely attempt each ALTER FUNCTION command
-- If a function doesn't exist or has wrong signature, it will skip it

-- 1. Core Translation Functions
DO $$
BEGIN
    -- Try different possible signatures for each function
    BEGIN
        ALTER FUNCTION public.get_translated_text(TEXT, JSONB, TEXT, TEXT) SET search_path = '';
        RAISE NOTICE 'Fixed get_translated_text';
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix get_translated_text: %', SQLERRM;
    END;
    
    BEGIN
        ALTER FUNCTION public.set_translation(JSONB, TEXT, TEXT, TEXT) SET search_path = '';
        RAISE NOTICE 'Fixed set_translation';
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix set_translation: %', SQLERRM;
    END;
    
    -- Try both possible signatures for update_translations
    BEGIN
        ALTER FUNCTION public.update_translations(TEXT, TEXT, TEXT, JSONB, TEXT) SET search_path = '';
        RAISE NOTICE 'Fixed update_translations (5 params)';
    EXCEPTION 
        WHEN OTHERS THEN 
            BEGIN
                ALTER FUNCTION public.update_translations(TEXT, TEXT, UUID, JSONB) SET search_path = '';
                RAISE NOTICE 'Fixed update_translations (4 params)';
            EXCEPTION 
                WHEN OTHERS THEN 
                    RAISE NOTICE 'Could not fix update_translations: %', SQLERRM;
            END;
    END;
END $$;

-- 2. Content Retrieval Functions
DO $$
BEGIN
    BEGIN
        ALTER FUNCTION public.get_transformation_paths(TEXT) SET search_path = '';
        RAISE NOTICE 'Fixed get_transformation_paths';
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix get_transformation_paths: %', SQLERRM;
    END;
    
    BEGIN
        ALTER FUNCTION public.get_practical_exercises(TEXT) SET search_path = '';
        RAISE NOTICE 'Fixed get_practical_exercises';
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix get_practical_exercises: %', SQLERRM;
    END;
    
    BEGIN
        ALTER FUNCTION public.get_supporting_questions(TEXT) SET search_path = '';
        RAISE NOTICE 'Fixed get_supporting_questions';  
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix get_supporting_questions: %', SQLERRM;
    END;
END $$;

-- 3. Translated Content Functions
DO $$
BEGIN
    BEGIN
        ALTER FUNCTION public.get_translated_practical_exercises(TEXT, TEXT) SET search_path = '';
        RAISE NOTICE 'Fixed get_translated_practical_exercises';
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix get_translated_practical_exercises: %', SQLERRM;
    END;
    
    BEGIN
        ALTER FUNCTION public.get_translated_supporting_questions(TEXT, TEXT) SET search_path = '';
        RAISE NOTICE 'Fixed get_translated_supporting_questions';
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix get_translated_supporting_questions: %', SQLERRM;
    END;
    
    BEGIN
        ALTER FUNCTION public.get_translated_transformation_paths(TEXT, TEXT) SET search_path = '';
        RAISE NOTICE 'Fixed get_translated_transformation_paths';
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix get_translated_transformation_paths: %', SQLERRM;
    END;
    
    BEGIN
        ALTER FUNCTION public.get_translated_content_sections(TEXT, TEXT) SET search_path = '';
        RAISE NOTICE 'Fixed get_translated_content_sections';
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix get_translated_content_sections: %', SQLERRM;
    END;
END $$;

-- 4. Life Wheel Functions
DO $$
BEGIN
    BEGIN
        ALTER FUNCTION public.get_translated_life_wheel_areas(UUID, TEXT) SET search_path = '';
        RAISE NOTICE 'Fixed get_translated_life_wheel_areas';
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix get_translated_life_wheel_areas: %', SQLERRM;
    END;
    
    BEGIN
        ALTER FUNCTION public.set_life_wheel_area_translation(UUID, TEXT, TEXT, TEXT) SET search_path = '';
        RAISE NOTICE 'Fixed set_life_wheel_area_translation';
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix set_life_wheel_area_translation: %', SQLERRM;
    END;
    
    BEGIN
        ALTER FUNCTION public.set_life_wheel_area_translations(UUID, TEXT, JSONB) SET search_path = '';
        RAISE NOTICE 'Fixed set_life_wheel_area_translations';
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix set_life_wheel_area_translations: %', SQLERRM;
    END;
END $$;

-- 5. Utility Functions
DO $$
BEGIN
    BEGIN
        ALTER FUNCTION public.set_updated_at() SET search_path = '';
        RAISE NOTICE 'Fixed set_updated_at';
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix set_updated_at: %', SQLERRM;
    END;
    
    BEGIN
        ALTER FUNCTION public.update_modified_column() SET search_path = '';
        RAISE NOTICE 'Fixed update_modified_column';
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix update_modified_column: %', SQLERRM;
    END;
    
    BEGIN
        ALTER FUNCTION public.update_lifewheel_from_exercise() SET search_path = '';
        RAISE NOTICE 'Fixed update_lifewheel_from_exercise';
    EXCEPTION 
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix update_lifewheel_from_exercise: %', SQLERRM;
    END;
END $$;

-- 6. Batch Functions
DO $$
BEGIN
    -- Try different possible signatures for import_translations_batch
    BEGIN
        ALTER FUNCTION public.import_translations_batch(TEXT, TEXT, TEXT) SET search_path = '';
        RAISE NOTICE 'Fixed import_translations_batch (3 params)';
    EXCEPTION 
        WHEN OTHERS THEN 
            BEGIN
                ALTER FUNCTION public.import_translations_batch(TEXT, JSONB[]) SET search_path = '';
                RAISE NOTICE 'Fixed import_translations_batch (2 params)';
            EXCEPTION 
                WHEN OTHERS THEN 
                    RAISE NOTICE 'Could not fix import_translations_batch: %', SQLERRM;
            END;
    END;
END $$;

-- Final summary
DO $$
BEGIN
    RAISE NOTICE 'Function search_path fix completed. Check the notices above for results.';
END $$;
