-- Create storage bucket for vision board images if not exists
do $$
begin
  if not exists (select 1 from storage.buckets where name = 'vision-board-images') then
    insert into storage.buckets (id, name, public)
    values ('vision-board-images', 'vision-board-images', true);
  end if;
end $$;

-- Drop existing policies if they exist
drop policy if exists "Vision board images are publicly accessible" on storage.objects;
drop policy if exists "Anyone can upload to vision board" on storage.objects;
drop policy if exists "Anyone can update their own vision board items" on storage.objects;
drop policy if exists "Anyone can delete their own vision board items" on storage.objects;

-- Set up access policies for the bucket
create policy "Vision board images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'vision-board-images');

create policy "Anyone can upload to vision board"
  on storage.objects for insert
  with check (
    bucket_id = 'vision-board-images' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can update their own vision board items"
  on storage.objects for update
  using (
    bucket_id = 'vision-board-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'vision-board-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Anyone can delete their own vision board items"
  on storage.objects for delete
  using (
    bucket_id = 'vision-board-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
