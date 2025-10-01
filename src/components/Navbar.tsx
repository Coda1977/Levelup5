'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { session, supabase } = useAuth();

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
          <a href="/admin" className="text-sm font-medium hover:underline">
            Admin
          </a>
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