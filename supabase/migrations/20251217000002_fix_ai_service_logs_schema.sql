-- =====================================================
-- Fix AI Service Logs Schema
-- Add missing request_data column if it doesn't exist
-- =====================================================

-- Ensure request_data column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'ai_service_logs' 
    AND column_name = 'request_data'
  ) THEN
    ALTER TABLE ai_service_logs 
    ADD COLUMN request_data JSONB;
    
    RAISE NOTICE 'Added missing request_data column to ai_service_logs';
  ELSE
    RAISE NOTICE 'request_data column already exists in ai_service_logs';
  END IF;
END $$;

-- Ensure response_data column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'ai_service_logs' 
    AND column_name = 'response_data'
  ) THEN
    ALTER TABLE ai_service_logs 
    ADD COLUMN response_data JSONB;
    
    RAISE NOTICE 'Added missing response_data column to ai_service_logs';
  ELSE
    RAISE NOTICE 'response_data column already exists in ai_service_logs';
  END IF;
END $$;

-- Ensure tokens_used column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'ai_service_logs' 
    AND column_name = 'tokens_used'
  ) THEN
    ALTER TABLE ai_service_logs 
    ADD COLUMN tokens_used INTEGER;
    
    RAISE NOTICE 'Added missing tokens_used column to ai_service_logs';
  ELSE
    RAISE NOTICE 'tokens_used column already exists in ai_service_logs';
  END IF;
END $$;

-- Ensure response_time_ms column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'ai_service_logs' 
    AND column_name = 'response_time_ms'
  ) THEN
    ALTER TABLE ai_service_logs 
    ADD COLUMN response_time_ms INTEGER;
    
    RAISE NOTICE 'Added missing response_time_ms column to ai_service_logs';
  ELSE
    RAISE NOTICE 'response_time_ms column already exists in ai_service_logs';
  END IF;
END $$;

-- Ensure error_message column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'ai_service_logs' 
    AND column_name = 'error_message'
  ) THEN
    ALTER TABLE ai_service_logs 
    ADD COLUMN error_message TEXT;
    
    RAISE NOTICE 'Added missing error_message column to ai_service_logs';
  ELSE
    RAISE NOTICE 'error_message column already exists in ai_service_logs';
  END IF;
END $$;

COMMENT ON TABLE ai_service_logs IS 'AI service logs for debugging and analytics (fixed schema)';
