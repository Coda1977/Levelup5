-- Create user_profiles table to store public user data
-- and a 'user' role by default.
create table public.user_profiles (
  id uuid not null references auth.users on delete cascade,
  role text not null default 'user',
  full_name text,
  avatar_url text,

  primary key (id)
);

-- RLS policy: users can view their own profile, and update it.
alter table public.user_profiles enable row level security;

create policy "Users can view their own profiles."
  on public.user_profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profiles."
  on public.user_profiles for update
  using ( auth.uid() = id );

-- Function to create a user profile when a new user signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id)
  values (new.id);
  return new;
end;
$$;

-- Trigger to call the function when a new user is created in auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();