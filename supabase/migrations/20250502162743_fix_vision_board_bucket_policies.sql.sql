-- First enable RLS on the storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'vision-board-images');

-- Allow anyone to view images (public bucket)
CREATE POLICY "Allow public to view images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'vision-board-images');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Allow users to update their own images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'vision-board-images' AND auth.uid() = owner);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow users to delete their own images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'vision-board-images' AND auth.uid() = owner);
