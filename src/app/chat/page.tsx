import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-client';
import ChatInterface from '@/components/ChatInterface';

export default async function ChatPage() {
  const supabase = createServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  return (
    <main className="section-container">
      <div className="container-max">
        <header className="mb-10">
          <h1 className="h1-hero fade-in">AI Mentor</h1>
          <p className="text-body max-w-2xl">
            Your personal management coach powered by AI. Ask questions, get practical advice.
          </p>
        </header>

        <ChatInterface userId={user.id} />
      </div>
    </main>
  );
}