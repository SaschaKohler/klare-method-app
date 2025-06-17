-- =====================================================
-- Comprehensive personal_insights table update
-- Aligns database schema with TypeScript types
-- =====================================================

-- First, let's see what the current table structure is
-- If this fails, we know the table needs to be recreated

-- Add missing columns to personal_insights table to match TypeScript types

-- Add title column (this was the main issue)
ALTER TABLE personal_insights 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add description column (maps to 'content' conceptually)
ALTER TABLE personal_insights 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add source column (maps to 'source_data' conceptually)  
ALTER TABLE personal_insights
ADD COLUMN IF NOT EXISTS source TEXT;

-- Add boolean and array columns from TypeScript types
ALTER TABLE personal_insights
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE personal_insights
ADD COLUMN IF NOT EXISTS related_areas TEXT[];

ALTER TABLE personal_insights
ADD COLUMN IF NOT EXISTS related_modules TEXT[];

ALTER TABLE personal_insights
ADD COLUMN IF NOT EXISTS supporting_evidence TEXT[];

ALTER TABLE personal_insights
ADD COLUMN IF NOT EXISTS user_acknowledged BOOLEAN DEFAULT false;

ALTER TABLE personal_insights
ADD COLUMN IF NOT EXISTS user_notes TEXT;

ALTER TABLE personal_insights
ADD COLUMN IF NOT EXISTS user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5);

ALTER TABLE personal_insights
ADD COLUMN IF NOT EXISTS ai_model TEXT;

ALTER TABLE personal_insights
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Migrate existing data to new structure
UPDATE personal_insights 
SET 
  description = content,
  source = COALESCE(source_data->>'source', 'onboarding'),
  user_acknowledged = (acknowledged_at IS NOT NULL),
  title = CASE 
    WHEN insight_type = 'goal_focus' THEN 'Your Focus Areas'
    WHEN insight_type = 'life_balance' THEN 'Life Balance Assessment'  
    WHEN insight_type = 'priority_area' THEN 'Priority Development Area'
    WHEN insight_type = 'breakthrough' THEN 'Breakthrough Insight'
    WHEN insight_type = 'pattern' THEN 'Pattern Recognition'
    WHEN insight_type = 'tfp_mastery' THEN 'TFP Mastery Level'
    WHEN insight_type = 'meta_model_insight' THEN 'Meta Model Insight'
    ELSE 'Personal Insight'
  END,
  updated_at = COALESCE(updated_at, created_at, NOW())
WHERE title IS NULL OR description IS NULL OR source IS NULL;

-- Add useful indexes
CREATE INDEX IF NOT EXISTS idx_personal_insights_title ON personal_insights(title);
CREATE INDEX IF NOT EXISTS idx_personal_insights_is_active ON personal_insights(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_personal_insights_user_acknowledged ON personal_insights(user_id, user_acknowledged);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_personal_insights_updated_at ON personal_insights;
CREATE TRIGGER update_personal_insights_updated_at 
  BEFORE UPDATE ON personal_insights 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
