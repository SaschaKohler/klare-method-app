-- Test der Quiz Questions Übersetzungen
DO $$
DECLARE
    translated_count INTEGER := 0;
    total_count INTEGER := 0;
    rec RECORD;
BEGIN
    SELECT COUNT(*) INTO translated_count 
    FROM translated_quiz_questions 
    WHERE question_en IS NOT NULL AND question_en != question;
    
    SELECT COUNT(*) INTO total_count 
    FROM quiz_questions;
    
    RAISE NOTICE '🎯 QUIZ QUESTIONS: % von % übersetzt (%%%)', 
        translated_count, total_count, 
        CASE WHEN total_count > 0 THEN ROUND((translated_count::DECIMAL / total_count::DECIMAL) * 100, 1) ELSE 0 END;
    
    -- Zeige Beispiele
    RAISE NOTICE '📝 Beispiele:';
    FOR rec IN 
        SELECT question, question_en 
        FROM translated_quiz_questions 
        WHERE question_en IS NOT NULL AND question_en != question
        LIMIT 3
    LOOP
        RAISE NOTICE '  DE: "%"', LEFT(rec.question, 50) || '...';
        RAISE NOTICE '  EN: "%"', LEFT(rec.question_en, 50) || '...';
        RAISE NOTICE '  ---';
    END LOOP;
END $$;
