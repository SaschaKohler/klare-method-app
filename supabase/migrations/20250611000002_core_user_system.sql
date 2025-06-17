-- =====================================================
-- 002 - Core User System  
-- AI-Ready Database Reconstruction - Part 2
-- =====================================================

-- =======================================
-- CORE USER TABLES
-- =======================================

-- Main users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  progress INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_modules TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced user profiles for AI personalization  
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  learning_style JSONB DEFAULT '{}',
  communication_preferences JSONB DEFAULT '{}',
  progress_patterns JSONB DEFAULT '{}',
  personality_insights JSONB DEFAULT '{}',
  vakog_preferences JSONB DEFAULT '{}', -- TFP: Visual/Auditory/Kinesthetic/Olfactory/Gustatory
  meta_model_patterns JSONB DEFAULT '{}', -- TFP: Common distortions/generalizations/deletions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User behavior patterns for AI analysis
CREATE TABLE IF NOT EXISTS user_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- 'learning', 'engagement', 'breakthrough'
  pattern_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User events for analytics and AI learning
CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personal values (important for TFP logical levels work)
CREATE TABLE IF NOT EXISTS personal_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value_name TEXT NOT NULL,
  importance_rating INTEGER CHECK (importance_rating >= 1 AND importance_rating <= 10),
  value_definition TEXT,
  examples JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, value_name)
);

-- =======================================
-- INDEXES FOR PERFORMANCE
-- =======================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_patterns_user_type ON user_patterns(user_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_user_events_user_type ON user_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_personal_values_user_id ON personal_values(user_id);

-- =======================================
-- TRIGGERS
-- =======================================

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_personal_values_updated_at ON personal_values;
CREATE TRIGGER update_personal_values_updated_at 
  BEFORE UPDATE ON personal_values 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();