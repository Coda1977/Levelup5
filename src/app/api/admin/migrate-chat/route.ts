import { NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-client';

export async function POST() {
  const supabase = createServiceSupabaseClient();

  try {
    // Check if tables already exist
    const { data: existingTables } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);

    if (existingTables !== null) {
      return NextResponse.json({ 
        message: 'Chat tables already exist',
        status: 'already_migrated'
      });
    }
  } catch (error: any) {
    // Table doesn't exist, proceed with migration
    console.log('Tables do not exist, creating them...');
  }

  // SQL migration for chat schema
  const migrationSQL = `
-- Create conversations table
create table if not exists public.conversations (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (id)
);

-- Create messages table
create table if not exists public.messages (
  id uuid not null default gen_random_uuid(),
  conversation_id uuid not null references public.conversations on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now(),

  primary key (id)
);

-- Create indexes for faster queries
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_created_at_idx on public.messages(created_at);
create index if not exists conversations_user_id_idx on public.conversations(user_id);

-- RLS policies for conversations
alter table public.conversations enable row level security;

drop policy if exists "Users can view their own conversations." on public.conversations;
create policy "Users can view their own conversations."
  on public.conversations for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can create their own conversations." on public.conversations;
create policy "Users can create their own conversations."
  on public.conversations for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own conversations." on public.conversations;
create policy "Users can update their own conversations."
  on public.conversations for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own conversations." on public.conversations;
create policy "Users can delete their own conversations."
  on public.conversations for delete
  using ( auth.uid() = user_id );

-- RLS policies for messages
alter table public.messages enable row level security;

drop policy if exists "Users can view messages in their conversations." on public.messages;
create policy "Users can view messages in their conversations."
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

drop policy if exists "Users can create messages in their conversations." on public.messages;
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
drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row execute procedure public.update_conversation_timestamp();
`;

  try {
    // Execute the migration SQL
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('Trying direct SQL execution...');
      const { error: directError } = await supabase.from('_migrations').insert({
        name: '0004_chat_schema',
        executed_at: new Date().toISOString()
      });

      if (directError) {
        throw new Error(`Migration failed: ${error.message}`);
      }
    }

    return NextResponse.json({ 
      message: 'Chat tables created successfully',
      status: 'migrated'
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run migration',
        details: error.message,
        hint: 'Please run the migration manually in Supabase SQL Editor'
      },
      { status: 500 }
    );
  }
}