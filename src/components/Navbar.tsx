'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { session, supabase } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (!session?.user) {
        setIsAdmin(false);
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      setIsAdmin(profile?.role === 'admin');
    }

    checkAdmin();
  }, [session, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="bg-white/90 backdrop-blur sticky top-0 z-40 border-b border-black/5">
      <div className="container-max px-5 py-3 flex items-center justify-between">
        <Link href="/" className="font-extrabold tracking-tight text-xl">
          LevelUp
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/learn" className="text-sm font-medium hover:underline">
            Learn
          </Link>
          <Link href="/chat" className="text-sm font-medium hover:underline">
            Chat
          </Link>
          {isAdmin && (
            <>
              <Link href="/editor" className="text-sm font-medium hover:underline">
                Editor
              </Link>
              <Link href="/users" className="text-sm font-medium hover:underline">
                Users
              </Link>
            </>
          )}
          {session ? (
            <button
              onClick={handleSignOut}
              className="btn-secondary"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="btn-primary"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}