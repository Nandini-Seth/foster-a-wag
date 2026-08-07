'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(setSession);
  }, [pathname]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession({ isLoggedIn: false });
    router.push('/');
  };

  const dashboardHref = session?.role === 'RESCUE' ? '/dashboard/rescue' : session?.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/foster';

  return (
    <nav className="bg-green-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpeg" alt="Foster A Wag" width={36} height={36} className="rounded-full object-cover" />
            <span className="font-display text-white text-xl italic">Foster A Wag</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {session?.isLoggedIn ? (
              <>
                {session.role === 'FOSTER' && (
                  <Link href="/pets" className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors">Browse Pets</Link>
                )}
                {session.role === 'RESCUE' && (
                  <>
                    <Link href="/fosters" className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors">Browse Fosters</Link>
                    <Link href="/rescue/pets/new" className="text-green-100 hover:text-amber-300 text-sm font-medium transition-colors">Post a Pet</Link>
                  </>
                )}
                <Link href={dashboardHref} className="text-green-100 hover:text-amber-300 text-sm font-medium transition-colors">Dashboard</Link>
                <button onClick={logout} className="text-green-100 hover:text-amber-300 text-sm font-medium transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-green-100 hover:text-amber-300 text-sm font-medium transition-colors">Sign In</Link>
                <Link href="/register" className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-green-700 py-3 pb-4 flex flex-col gap-3">
            {session?.isLoggedIn ? (
              <>
                {session.role === 'FOSTER' && <Link href="/pets" className="text-amber-300 text-sm font-semibold px-2">Browse Pets</Link>}
                {session.role === 'RESCUE' && <>
                  <Link href="/fosters" className="text-amber-300 text-sm font-semibold px-2">Browse Fosters</Link>
                  <Link href="/rescue/pets/new" className="text-green-100 text-sm font-medium px-2">Post a Pet</Link>
                </>}
                <Link href={dashboardHref} className="text-green-100 text-sm font-medium px-2">Dashboard</Link>
                <button onClick={logout} className="text-green-100 text-sm font-medium px-2 text-left">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-green-100 text-sm font-medium px-2">Sign In</Link>
                <Link href="/register" className="text-amber-300 text-sm font-medium px-2">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
