-- =====================================================
-- Add Onboarding Fields to User Profiles
-- =====================================================

-- Add onboarding-specific fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS preferred_name TEXT,
ADD COLUMN IF NOT EXISTS age_range TEXT,
ADD COLUMN IF NOT EXISTS primary_goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS current_challenges TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS time_commitment TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}';
-- Add index for onboarding completion queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_completed 
ON user_profiles(onboarding_completed_at) 
WHERE onboarding_completed_at IS NOT NULL;
