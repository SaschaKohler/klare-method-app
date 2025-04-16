-- Create resources table for storing user resources
create table if not exists public.resources (
  id uuid not null primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  rating integer not null default 5,
  category text not null,
  activation_tips text,
  last_activated timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Add RLS (Row Level Security) policies to ensure user data separation
alter table public.resources enable row level security;

-- Policy for users to view their own resources
create policy "Users can view their own resources"
  on public.resources
  for select
  using (auth.uid() = user_id);

-- Policy for users to insert their own resources
create policy "Users can insert their own resources"
  on public.resources
  for insert
  with check (auth.uid() = user_id);

-- Policy for users to update their own resources
create policy "Users can update their own resources"
  on public.resources
  for update
  using (auth.uid() = user_id);

-- Policy for users to delete their own resources
create policy "Users can delete their own resources"
  on public.resources
  for delete
  using (auth.uid() = user_id);

-- Create a function to automatically update 'updated_at' field
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add trigger to automatically update 'updated_at' field on update
create trigger set_resources_updated_at
before update on public.resources
for each row
execute function public.set_updated_at();

-- Create index for faster user_id filtering
create index if not exists resources_user_id_idx on public.resources(user_id);

-- Create index for faster category filtering
create index if not exists resources_category_idx on public.resources(category);

-- Ensure users can get their resources
grant select, insert, update, delete on public.resources to authenticated;
