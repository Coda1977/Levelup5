-- Create Categories and Chapters tables
create table public.categories (
  id uuid not null default gen_random_uuid(),
  title text not null,
  display_order integer not null default 0,

  primary key (id)
);

create table public.chapters (
  id uuid not null default gen_random_uuid(),
  category_id uuid not null references public.categories on delete cascade,
  title text not null,
  content text,
  is_published boolean not null default false,
  display_order integer not null default 0,

  primary key (id)
);

-- RLS Policies for Categories
alter table public.categories enable row level security;

create policy "Authenticated users can view categories."
  on public.categories for select
  to authenticated
  using ( true );

create policy "Admins can manage categories."
  on public.categories for all
  using ( (select role from public.user_profiles where id = auth.uid()) = 'admin' );

-- RLS Policies for Chapters
alter table public.chapters enable row level security;

create policy "Authenticated users can view published chapters."
  on public.chapters for select
  to authenticated
  using ( is_published = true );

create policy "Admins can manage chapters."
  on public.chapters for all
  using ( (select role from public.user_profiles where id = auth.uid()) = 'admin' );