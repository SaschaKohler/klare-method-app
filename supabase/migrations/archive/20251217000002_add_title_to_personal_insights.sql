-- =====================================================
-- Add title column to personal_insights table
-- Fixes OnboardingService error: "Could not find the 'content' column"
-- (Actually missing 'title' column, error message is misleading)
-- =====================================================

-- Add title column to personal_insights table
ALTER TABLE personal_insights 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add index for better performance when searching by title
CREATE INDEX IF NOT EXISTS idx_personal_insights_title ON personal_insights(title);

-- Update existing insights to have meaningful titles (if any exist)
UPDATE personal_insights 
SET title = CASE 
  WHEN insight_type = 'goal_focus' THEN 'Your Focus Areas'
  WHEN insight_type = 'life_balance' THEN 'Life Balance Assessment'  
  WHEN insight_type = 'priority_area' THEN 'Priority Development Area'
  WHEN insight_type = 'breakthrough' THEN 'Breakthrough Insight'
  WHEN insight_type = 'pattern' THEN 'Pattern Recognition'
  WHEN insight_type = 'tfp_mastery' THEN 'TFP Mastery Level'
  WHEN insight_type = 'meta_model_insight' THEN 'Meta Model Insight'
  ELSE 'Personal Insight'
END
WHERE title IS NULL;
