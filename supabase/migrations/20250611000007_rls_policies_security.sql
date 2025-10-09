-- =====================================================
-- 007 - RLS Policies and Security
-- AI-Ready Database Reconstruction - Part 7
-- =====================================================

-- =======================================
-- ENABLE RLS ON ALL TABLES (only if they exist)
-- =======================================

DO $$ 
DECLARE
  tables_to_secure text[] := ARRAY[
    'users', 'user_profiles', 'user_patterns', 'user_events', 'personal_values',
    'ai_conversations', 'ai_prompt_templates', 'personal_insights', 'generated_content', 'ai_service_logs',
    'life_wheel_areas', 'life_wheel_snapshots', 'vision_board_items',
    'module_contents', 'content_sections', 'excercise_steps', 'quiz_questions', 'completed_modules',
    'user_answers', 'practical_excercises', 'supporting_questions',
    'journal_template_categories', 'journal_templates', 'journal_entries',
    'translations'
  ];
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY tables_to_secure
  LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = table_name) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    END IF;
  END LOOP;
END $$;

-- =======================================
-- USER DATA POLICIES
-- =======================================

-- Users table policies
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
CREATE POLICY "Users can create their own profile" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read their own profile" ON users;
CREATE POLICY "Users can read their own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- User profiles policies
DROP POLICY IF EXISTS "Users can manage their own user_profiles" ON user_profiles;
CREATE POLICY "Users can manage their own user_profiles" 
ON user_profiles FOR ALL 
USING (auth.uid()::uuid = user_id::uuid) 
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- User patterns policies
DROP POLICY IF EXISTS "Users can manage their own user_patterns" ON user_patterns;
CREATE POLICY "Users can manage their own user_patterns" 
ON user_patterns FOR ALL 
USING (auth.uid()::uuid = user_id::uuid) 
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- User events policies
DROP POLICY IF EXISTS "Users can manage their own user_events" ON user_events;
CREATE POLICY "Users can manage their own user_events" 
ON user_events FOR ALL 
USING (auth.uid()::uuid = user_id::uuid) 
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- Personal values policies
DROP POLICY IF EXISTS "Users can manage their own personal_values" ON personal_values;
CREATE POLICY "Users can manage their own personal_values" 
ON personal_values FOR ALL 
USING (auth.uid()::uuid = user_id::uuid) 
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- =======================================
-- AI SYSTEM POLICIES
-- =======================================

-- AI conversations policies
DROP POLICY IF EXISTS "Users can manage their own ai_conversations" ON ai_conversations;
CREATE POLICY "Users can manage their own ai_conversations" 
ON ai_conversations FOR ALL 
USING (auth.uid()::uuid = user_id::uuid) 
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- AI prompt templates (read for all authenticated users, admin write)
DROP POLICY IF EXISTS "Authenticated users can read ai_prompt_templates" ON ai_prompt_templates;
CREATE POLICY "Authenticated users can read ai_prompt_templates" 
ON ai_prompt_templates FOR SELECT 
TO authenticated 
USING (true);

-- Personal insights policies
DROP POLICY IF EXISTS "Users can manage their own personal_insights" ON personal_insights;
CREATE POLICY "Users can manage their own personal_insights" 
ON personal_insights FOR ALL 
USING (auth.uid()::uuid = user_id::uuid) 
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- Generated content policies
DROP POLICY IF EXISTS "Users can manage their own generated_content" ON generated_content;
CREATE POLICY "Users can manage their own generated_content" 
ON generated_content FOR ALL 
USING (auth.uid()::uuid = user_id::uuid) 
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- AI service logs (admin access only for debugging)
DROP POLICY IF EXISTS "Users can read their own ai_service_logs" ON ai_service_logs;
CREATE POLICY "Users can read their own ai_service_logs" 
ON ai_service_logs FOR SELECT 
USING (auth.uid()::uuid = user_id::uuid OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can insert their own ai_service_logs" ON ai_service_logs;
CREATE POLICY "Users can insert their own ai_service_logs" 
ON ai_service_logs FOR INSERT 
WITH CHECK (auth.uid()::uuid = user_id::uuid OR user_id IS NULL);

-- =======================================
-- LIFE WHEEL POLICIES
-- =======================================

-- Life wheel areas policies
DROP POLICY IF EXISTS "Users can manage their own life_wheel_areas" ON life_wheel_areas;
CREATE POLICY "Users can manage their own life_wheel_areas" 
ON life_wheel_areas FOR ALL 
USING (auth.uid()::uuid = user_id::uuid) 
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- Life wheel snapshots policies
DROP POLICY IF EXISTS "Users can manage their own life_wheel_snapshots" ON life_wheel_snapshots;
CREATE POLICY "Users can manage their own life_wheel_snapshots" 
ON life_wheel_snapshots FOR ALL 
USING (auth.uid()::uuid = user_id::uuid) 
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- Vision board items policies
DROP POLICY IF EXISTS "Users can manage their own vision_board_items" ON vision_board_items;
CREATE POLICY "Users can manage their own vision_board_items" 
ON vision_board_items FOR ALL 
USING (auth.uid()::uuid = user_id::uuid) 
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- =======================================
-- CONTENT AND MODULE POLICIES
-- =======================================

-- Module contents (read for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can read module_contents" ON module_contents;
CREATE POLICY "Authenticated users can read module_contents" 
ON module_contents FOR SELECT 
TO authenticated 
USING (true);

-- Content sections (read for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can read content_sections" ON content_sections;
CREATE POLICY "Authenticated users can read content_sections" 
ON content_sections FOR SELECT 
TO authenticated 
USING (true);

-- Exercise steps (read for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can read excercise_steps" ON excercise_steps;
CREATE POLICY "Authenticated users can read excercise_steps" 
ON excercise_steps FOR SELECT 
TO authenticated 
USING (true);

-- Quiz questions (read for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can read quiz_questions" ON quiz_questions;
CREATE POLICY "Authenticated users can read quiz_questions" 
ON quiz_questions FOR SELECT 
TO authenticated 
USING (true);

-- Completed modules policies
DROP POLICY IF EXISTS "Users can manage their own completed_modules" ON completed_modules;
CREATE POLICY "Users can manage their own completed_modules" 
ON completed_modules FOR ALL 
USING (auth.uid()::uuid = user_id::uuid) 
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- User answers policies (only if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_answers') THEN
    DROP POLICY IF EXISTS "Users can manage their own user_answers" ON user_answers;
    CREATE POLICY "Users can manage their own user_answers" 
    ON user_answers FOR ALL 
    USING (auth.uid()::uuid = user_id::uuid) 
    WITH CHECK (auth.uid()::uuid = user_id::uuid);
  END IF;
END $$;

-- Practical exercises (read for all authenticated users, only if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'practical_excercises') THEN
    DROP POLICY IF EXISTS "Authenticated users can read practical_excercises" ON practical_excercises;
    CREATE POLICY "Authenticated users can read practical_excercises" 
    ON practical_excercises FOR SELECT 
    TO authenticated 
    USING (true);
  END IF;
END $$;

-- Supporting questions (read for all authenticated users, only if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'supporting_questions') THEN
    DROP POLICY IF EXISTS "Authenticated users can read supporting_questions" ON supporting_questions;
    CREATE POLICY "Authenticated users can read supporting_questions" 
    ON supporting_questions FOR SELECT 
    TO authenticated 
    USING (true);
  END IF;
END $$;

-- =======================================
-- JOURNAL SYSTEM POLICIES
-- =======================================

-- Journal template categories (read for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can read journal_template_categories" ON journal_template_categories;
CREATE POLICY "Authenticated users can read journal_template_categories" 
ON journal_template_categories FOR SELECT 
TO authenticated 
USING (true);

-- Journal templates (read for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can read journal_templates" ON journal_templates;
CREATE POLICY "Authenticated users can read journal_templates" 
ON journal_templates FOR SELECT 
TO authenticated 
USING (true);

-- Journal entries policies (private by default)
DROP POLICY IF EXISTS "Users can manage their own journal_entries" ON journal_entries;
CREATE POLICY "Users can manage their own journal_entries" 
ON journal_entries FOR ALL 
USING (auth.uid()::uuid = user_id::uuid) 
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- =======================================
-- TRANSLATION SYSTEM POLICIES
-- =======================================

-- Translations (read for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can read translations" ON translations;
CREATE POLICY "Authenticated users can read translations" 
ON translations FOR SELECT 
TO authenticated 
USING (true);