-- Add UNIQUE constraint on user_id in user_profiles table
-- This is required for upsert operations with onConflict

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);;
