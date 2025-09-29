import Link from 'next/link';

export default function Navbar() {
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
          <Link href="/admin" className="text-sm font-medium hover:underline">
            Admin
          </Link>
          <Link
            href="/auth/login"
            className="btn-primary"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}