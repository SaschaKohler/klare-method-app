-- ============================================================================
-- STORAGE BUCKETS & POLICIES (Vision Board Support)
-- ============================================================================

-- Create storage bucket for vision board images if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'vision-board-images') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('vision-board-images', 'vision-board-images', true);
  END IF;
END $$;

-- Drop existing policies if they exist (clean slate for policies)
DROP POLICY IF EXISTS "Vision board images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to vision board" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update their own vision board items" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete their own vision board items" ON storage.objects;

-- Set up access policies for the vision board bucket  
CREATE POLICY "Vision board images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vision-board-images');

CREATE POLICY "Anyone can upload to vision board"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vision-board-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can update their own vision board items"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'vision-board-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'vision-board-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can delete their own vision board items"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vision-board-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- ADDITIONAL STORAGE BUCKETS (for future AI features)
-- ============================================================================

-- AI-Generated Content Storage (for generated images, documents, etc.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'ai-generated-content') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('ai-generated-content', 'ai-generated-content', false); -- Private bucket
  END IF;
END $$;

-- AI Generated Content Policies
CREATE POLICY "Users can access their own AI generated content"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ai-generated-content' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload AI generated content"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ai-generated-content' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own AI generated content"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'ai-generated-content' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own AI generated content"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ai-generated-content' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- User Profile Images Storage
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'profile-images') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('profile-images', 'profile-images', true); -- Public bucket
  END IF;
END $$;

-- Profile Images Policies
CREATE POLICY "Profile images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile image"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own profile image"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile image"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- STORAGE HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's storage folder path
CREATE OR REPLACE FUNCTION get_user_storage_path(bucket_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN bucket_name || '/' || auth.uid()::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up orphaned storage objects
CREATE OR REPLACE FUNCTION cleanup_orphaned_storage_objects()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Clean up vision board images that no longer have corresponding database entries
  WITH orphaned_objects AS (
    SELECT so.name, so.bucket_id
    FROM storage.objects so
    WHERE so.bucket_id = 'vision-board-images' 
      AND NOT EXISTS (
        SELECT 1 FROM vision_board_items vbi 
        WHERE vbi.image_url LIKE '%' || so.name || '%'
      )
  )
  DELETE FROM storage.objects 
  WHERE (name, bucket_id) IN (SELECT name, bucket_id FROM orphaned_objects);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'STORAGE CONFIGURATION COMPLETE' as status, NOW() as completed_at;
