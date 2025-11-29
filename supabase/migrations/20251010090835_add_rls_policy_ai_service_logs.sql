-- Add RLS policy for ai_service_logs to allow users to log their own service usage

-- Enable RLS if not already enabled
ALTER TABLE ai_service_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own logs
CREATE POLICY "Users can insert their own service logs"
ON ai_service_logs
FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own logs
CREATE POLICY "Users can view their own service logs"
ON ai_service_logs
FOR SELECT
TO public
USING (auth.uid() = user_id);;
