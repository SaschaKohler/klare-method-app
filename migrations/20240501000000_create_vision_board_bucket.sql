-- Create storage bucket for vision board images
insert into storage.buckets (id, name, public)
values ('vision-board-images', 'vision-board-images', true);

-- Set up access policies for the bucket
create policy "Vision board images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'vision-board-images' );

create policy "Anyone can upload to vision board"
  on storage.objects for insert
  with check ( bucket_id = 'vision-board-images' );

create policy "Anyone can update their own vision board items"
  on storage.objects for update
  using ( bucket_id = 'vision-board-images' )
  with check ( auth.uid() = owner );

create policy "Anyone can delete their own vision board items"
  on storage.objects for delete
  using ( auth.uid() = owner );
