-- Create conversations table
create table public.conversations (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (id)
);

-- Create messages table
create table public.messages (
  id uuid not null default gen_random_uuid(),
  conversation_id uuid not null references public.conversations on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now(),

  primary key (id)
);

-- Create index for faster queries
create index messages_conversation_id_idx on public.messages(conversation_id);
create index messages_created_at_idx on public.messages(created_at);
create index conversations_user_id_idx on public.conversations(user_id);

-- RLS policies for conversations
alter table public.conversations enable row level security;

create policy "Users can view their own conversations."
  on public.conversations for select
  using ( auth.uid() = user_id );

create policy "Users can create their own conversations."
  on public.conversations for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own conversations."
  on public.conversations for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own conversations."
  on public.conversations for delete
  using ( auth.uid() = user_id );

-- RLS policies for messages
alter table public.messages enable row level security;

create policy "Users can view messages in their conversations."
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can create messages in their conversations."
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- Function to update conversation updated_at timestamp
create or replace function public.update_conversation_timestamp()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

-- Trigger to update conversation timestamp when message is added
create trigger on_message_created
  after insert on public.messages
  for each row execute procedure public.update_conversation_timestamp();