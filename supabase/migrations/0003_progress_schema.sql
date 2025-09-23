-- Create user_progress table
create table public.user_progress (
  user_id uuid not null references auth.users on delete cascade,
  chapter_id uuid not null references public.chapters on delete cascade,
  completed_at timestamptz not null default now(),

  primary key (user_id, chapter_id),
  unique (user_id, chapter_id)
);

-- RLS policy for user_progress
alter table public.user_progress enable row level security;

create policy "Users can manage their own progress."
  on public.user_progress for all
  using ( auth.uid() = user_id );