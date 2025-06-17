-- =====================================================
-- 007 - RLS Policies and Security
-- AI-Ready Database Reconstruction - Part 7
-- =====================================================

-- =======================================
-- ENABLE RLS ON ALL TABLES
-- =======================================

-- Core user tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_values ENABLE ROW LEVEL SECURITY;

-- AI system tables
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_service_logs ENABLE ROW LEVEL SECURITY;

-- Life wheel tables
ALTER TABLE life_wheel_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_wheel_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_board_items ENABLE ROW LEVEL SECURITY;

-- Module and content tables
ALTER TABLE module_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE excercise_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_excercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE supporting_questions ENABLE ROW LEVEL SECURITY;

-- Journal system tables
ALTER TABLE journal_template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Translation table
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

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
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- User patterns policies
DROP POLICY IF EXISTS "Users can manage their own user_patterns" ON user_patterns;
CREATE POLICY "Users can manage their own user_patterns" 
ON user_patterns FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- User events policies
DROP POLICY IF EXISTS "Users can manage their own user_events" ON user_events;
CREATE POLICY "Users can manage their own user_events" 
ON user_events FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Personal values policies
DROP POLICY IF EXISTS "Users can manage their own personal_values" ON personal_values;
CREATE POLICY "Users can manage their own personal_values" 
ON personal_values FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- =======================================
-- AI SYSTEM POLICIES
-- =======================================

-- AI conversations policies
DROP POLICY IF EXISTS "Users can manage their own ai_conversations" ON ai_conversations;
CREATE POLICY "Users can manage their own ai_conversations" 
ON ai_conversations FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

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
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Generated content policies
DROP POLICY IF EXISTS "Users can manage their own generated_content" ON generated_content;
CREATE POLICY "Users can manage their own generated_content" 
ON generated_content FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- AI service logs (admin access only for debugging)
DROP POLICY IF EXISTS "Users can read their own ai_service_logs" ON ai_service_logs;
CREATE POLICY "Users can read their own ai_service_logs" 
ON ai_service_logs FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- =======================================
-- LIFE WHEEL POLICIES
-- =======================================

-- Life wheel areas policies
DROP POLICY IF EXISTS "Users can manage their own life_wheel_areas" ON life_wheel_areas;
CREATE POLICY "Users can manage their own life_wheel_areas" 
ON life_wheel_areas FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Life wheel snapshots policies
DROP POLICY IF EXISTS "Users can manage their own life_wheel_snapshots" ON life_wheel_snapshots;
CREATE POLICY "Users can manage their own life_wheel_snapshots" 
ON life_wheel_snapshots FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Vision board items policies
DROP POLICY IF EXISTS "Users can manage their own vision_board_items" ON vision_board_items;
CREATE POLICY "Users can manage their own vision_board_items" 
ON vision_board_items FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

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
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- User answers policies
DROP POLICY IF EXISTS "Users can manage their own user_answers" ON user_answers;
CREATE POLICY "Users can manage their own user_answers" 
ON user_answers FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Practical exercises (read for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can read practical_excercises" ON practical_excercises;
CREATE POLICY "Authenticated users can read practical_excercises" 
ON practical_excercises FOR SELECT 
TO authenticated 
USING (true);

-- Supporting questions (read for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can read supporting_questions" ON supporting_questions;
CREATE POLICY "Authenticated users can read supporting_questions" 
ON supporting_questions FOR SELECT 
TO authenticated 
USING (true);

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
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- =======================================
-- TRANSLATION SYSTEM POLICIES
-- =======================================

-- Translations (read for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can read translations" ON translations;
CREATE POLICY "Authenticated users can read translations" 
ON translations FOR SELECT 
TO authenticated 
USING (true);