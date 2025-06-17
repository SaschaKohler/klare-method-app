-- Final fix for remaining function search_path warnings  
-- Only 2 functions left to fix!

DO $$
BEGIN
    -- Fix set_life_wheel_area_translation
    BEGIN
        -- Try most likely signature first
        ALTER FUNCTION public.set_life_wheel_area_translation(UUID, TEXT, TEXT, TEXT) SET search_path = '';
        RAISE NOTICE 'SUCCESS: Fixed set_life_wheel_area_translation (UUID, TEXT, TEXT, TEXT)';
    EXCEPTION 
        WHEN OTHERS THEN 
            -- Try alternative signature without UUID
            BEGIN
                ALTER FUNCTION public.set_life_wheel_area_translation(TEXT, TEXT, TEXT) SET search_path = '';
                RAISE NOTICE 'SUCCESS: Fixed set_life_wheel_area_translation (TEXT, TEXT, TEXT)';
            EXCEPTION 
                WHEN OTHERS THEN 
                    -- Try with different parameter types
                    BEGIN
                        ALTER FUNCTION public.set_life_wheel_area_translation(TEXT, TEXT, TEXT, TEXT) SET search_path = '';
                        RAISE NOTICE 'SUCCESS: Fixed set_life_wheel_area_translation (TEXT, TEXT, TEXT, TEXT)';
                    EXCEPTION 
                        WHEN OTHERS THEN 
                            RAISE NOTICE 'FAILED: Could not fix set_life_wheel_area_translation - %', SQLERRM;
                    END;
            END;
    END;

    -- Fix set_life_wheel_area_translations  
    BEGIN
        -- Try most likely signature first
        ALTER FUNCTION public.set_life_wheel_area_translations(UUID, TEXT, JSONB) SET search_path = '';
        RAISE NOTICE 'SUCCESS: Fixed set_life_wheel_area_translations (UUID, TEXT, JSONB)';
    EXCEPTION 
        WHEN OTHERS THEN 
            -- Try alternative signature
            BEGIN
                ALTER FUNCTION public.set_life_wheel_area_translations(TEXT, TEXT, JSONB) SET search_path = '';
                RAISE NOTICE 'SUCCESS: Fixed set_life_wheel_area_translations (TEXT, TEXT, JSONB)';
            EXCEPTION 
                WHEN OTHERS THEN 
                    -- Try with different parameter count
                    BEGIN
                        ALTER FUNCTION public.set_life_wheel_area_translations(UUID, JSONB) SET search_path = '';
                        RAISE NOTICE 'SUCCESS: Fixed set_life_wheel_area_translations (UUID, JSONB)';
                    EXCEPTION 
                        WHEN OTHERS THEN 
                            RAISE NOTICE 'FAILED: Could not fix set_life_wheel_area_translations - %', SQLERRM;
                    END;
            END;
    END;
    
    RAISE NOTICE 'Final function search_path fix attempt completed!';
END $$;
