'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { session, supabase } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/90 backdrop-blur sticky top-0 z-40 border-b border-black/5 w-full overflow-x-hidden">
      <div className="container-max px-4 sm:px-5 py-3 flex items-center justify-between max-w-full">
        <Link href="/" className="font-extrabold tracking-tight text-lg sm:text-xl" onClick={closeMobileMenu}>
          Level<span className="relative" style={{ top: '-0.15em', marginLeft: '0.05em' }}>Up</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-4 flex-shrink-0">
          {session && (
            <>
              <Link href="/learn" className="text-sm font-medium hover:underline">
                Learn
              </Link>
              <Link href="/chat" className="text-sm font-medium hover:underline">
                Chat
              </Link>
            </>
          )}
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
              className="btn-secondary text-sm px-3 py-2 md:px-4 whitespace-nowrap"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="btn-primary text-sm px-3 py-2 md:px-4 whitespace-nowrap"
            >
              Sign in
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={closeMobileMenu}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40 md:hidden">
            <nav className="container-max px-4 py-4 flex flex-col gap-3">
              {session && (
                <>
                  <Link
                    href="/learn"
                    className="text-base font-medium hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors min-h-[44px] flex items-center"
                    onClick={closeMobileMenu}
                  >
                    Learn
                  </Link>
                  <Link
                    href="/chat"
                    className="text-base font-medium hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors min-h-[44px] flex items-center"
                    onClick={closeMobileMenu}
                  >
                    Chat
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link
                    href="/editor"
                    className="text-base font-medium hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors min-h-[44px] flex items-center"
                    onClick={closeMobileMenu}
                  >
                    Editor
                  </Link>
                  <Link
                    href="/users"
                    className="text-base font-medium hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors min-h-[44px] flex items-center"
                    onClick={closeMobileMenu}
                  >
                    Users
                  </Link>
                </>
              )}
              <div className="border-t border-gray-200 my-2"></div>
              {session ? (
                <button
                  onClick={() => {
                    handleSignOut();
                    closeMobileMenu();
                  }}
                  className="btn-secondary w-full text-base py-3 min-h-[48px]"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="btn-primary w-full text-base py-3 min-h-[48px] text-center"
                  onClick={closeMobileMenu}
                >
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}