-- 05_fix_foreign_keys_corrected.sql
-- CORRECTED: References public.users, not auth.users

-- Supabase Architecture:
-- auth.users = System authentication table (managed by Supabase)
-- public.users = Your app's user profiles (references auth.users)
-- All your tables should reference public.users(id)

-- Check both users tables exist
SELECT 'auth.users' as table_ref, COUNT(*) as row_count 
FROM auth.users
UNION ALL
SELECT 'public.users', COUNT(*) 
FROM public.users;

-- Add all Foreign Key constraints pointing to public.users
DO $$
BEGIN
  -- user_profiles → public.users
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_profiles_user_id_fkey') THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  -- life_wheel_snapshots → public.users  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'life_wheel_snapshots_user_id_fkey') THEN
    ALTER TABLE life_wheel_snapshots ADD CONSTRAINT life_wheel_snapshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  -- generated_content → public.users
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'generated_content_user_id_fkey') THEN
    ALTER TABLE generated_content ADD CONSTRAINT generated_content_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  -- user_answers → public.users
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_answers_user_id_fkey') THEN
    ALTER TABLE user_answers ADD CONSTRAINT user_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  -- personal_insights → public.users
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'personal_insights_user_id_fkey') THEN
    ALTER TABLE personal_insights ADD CONSTRAINT personal_insights_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  -- journal_entries → public.users
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'journal_entries_user_id_fkey') THEN
    ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  -- user_events → public.users
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_events_user_id_fkey') THEN
    ALTER TABLE user_events ADD CONSTRAINT user_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  -- user_patterns → public.users
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_patterns_user_id_fkey') THEN
    ALTER TABLE user_patterns ADD CONSTRAINT user_patterns_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  -- ai_conversations → public.users
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ai_conversations_user_id_fkey') THEN
    ALTER TABLE ai_conversations ADD CONSTRAINT ai_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  -- Cross-table references
  -- generated_content → ai_prompt_templates
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'generated_content_template_id_fkey') THEN
    ALTER TABLE generated_content ADD CONSTRAINT generated_content_template_id_fkey FOREIGN KEY (template_id) REFERENCES ai_prompt_templates(id) ON DELETE CASCADE;
  END IF;

  -- journal_entries → journal_templates (optional)
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'journal_entries_template_id_fkey') THEN
    ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_template_id_fkey FOREIGN KEY (template_id) REFERENCES journal_templates(id) ON DELETE SET NULL;
  END IF;

  -- ai_conversations → ai_prompt_templates (optional)
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ai_conversations_prompt_template_id_fkey') THEN
    ALTER TABLE ai_conversations ADD CONSTRAINT ai_conversations_prompt_template_id_fkey FOREIGN KEY (prompt_template_id) REFERENCES ai_prompt_templates(id) ON DELETE SET NULL;
  END IF;

END $$;

-- Verify constraints were added
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('user_profiles', 'life_wheel_snapshots', 'generated_content', 'user_answers', 'personal_insights', 'journal_entries', 'user_events', 'user_patterns', 'ai_conversations')
ORDER BY tc.table_name, tc.constraint_name;

SELECT 'FOREIGN KEY CONSTRAINTS ADDED (CORRECTED)' as status, NOW() as completed_at;
