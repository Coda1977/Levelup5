import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-client';
import ChatInterface from '@/components/ChatInterface';

export default async function ChatPage() {
  const supabase = await createServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  return <ChatInterface userId={user.id} />;
}