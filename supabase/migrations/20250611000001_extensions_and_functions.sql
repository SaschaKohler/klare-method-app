-- =====================================================
-- 001 - Extensions and Core Functions
-- AI-Ready Database Reconstruction - Part 1
-- =====================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- =======================================
-- CORE TRIGGER FUNCTIONS
-- =======================================

-- Updated_at trigger function (used across multiple tables)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- =======================================
-- AI SERVICE FUNCTIONS (placeholder)
-- =======================================

-- Function to generate AI prompts (will be enhanced with TFP integration)
CREATE OR REPLACE FUNCTION generate_ai_prompt(
  template_name TEXT,
  user_context JSONB DEFAULT '{}'
)
RETURNS TEXT AS $$
BEGIN
  -- Basic implementation - will be enhanced for TFP
  RETURN 'AI prompt for: ' || template_name;
END;
$$ LANGUAGE plpgsql;
-- Function to process user insights
CREATE OR REPLACE FUNCTION process_user_insight(
  user_id UUID,
  insight_data JSONB
)
RETURNS UUID AS $$
DECLARE
  insight_id UUID;
BEGIN
  INSERT INTO personal_insights (user_id, insight_type, content, source_data)
  VALUES (
    user_id, 
    insight_data->>'type', 
    insight_data->>'content', 
    insight_data
  )
  RETURNING id INTO insight_id;
  
  RETURN insight_id;
END;
$$ LANGUAGE plpgsql;
