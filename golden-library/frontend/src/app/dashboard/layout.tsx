'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const navItems = [
    { href: '/dashboard', label: 'Home' },
    { href: '/dashboard/novels', label: 'Novels' },
    { href: '/dashboard/ebooks', label: 'E-Books' },
    { href: '/dashboard/comics', label: 'Comics' },
    { href: '/dashboard/manga', label: 'Manga' },
    { href: '/dashboard/saved', label: 'Saved List' },
    { href: '/dashboard/community', label: 'Community' },
  ];

  if (!user) {
    return <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="animate-pulse text-golden-500">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-dark-950 border-b border-dark-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-golden-500 rounded-lg flex items-center justify-center">
                <span className="text-dark-950 font-bold text-lg">GL</span>
              </div>
              <span className="text-xl font-serif font-bold text-golden-500">
                Golden Library
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    pathname === item.href
                      ? 'nav-link-active'
                      : 'nav-link'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-golden-500 hover:text-golden-400 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-950 border-t border-dark-700 z-40">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors duration-200 ${
                pathname === item.href
                  ? 'text-golden-500'
                  : 'text-dark-300'
              }`}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-0">
        {children}
      </main>

      {/* Settings Side Panel */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSettingsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-80 bg-dark-900 border-l border-dark-700 transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-semibold text-golden-500">
                  Settings
                </h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-dark-400 hover:text-white transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              <div className="mb-6 p-4 bg-dark-800 rounded-lg">
                <div className="w-12 h-12 bg-golden-500 rounded-full flex items-center justify-center mb-3">
                  <span className="text-dark-950 font-bold text-lg">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">{user.username}</h3>
                <p className="text-dark-400 text-sm">{user.email}</p>
              </div>

              {/* Settings Options */}
              <div className="space-y-4">
                <button className="w-full text-left p-3 text-dark-300 hover:text-golden-500 hover:bg-dark-800 rounded-lg transition-colors duration-200">
                  Contact Us
                </button>
                <button className="w-full text-left p-3 text-dark-300 hover:text-golden-500 hover:bg-dark-800 rounded-lg transition-colors duration-200">
                  Privacy Policy
                </button>
                <button className="w-full text-left p-3 text-dark-300 hover:text-golden-500 hover:bg-dark-800 rounded-lg transition-colors duration-200">
                  Terms of Service
                </button>
              </div>

              {/* Logout Button */}
              <div className="mt-8 pt-6 border-t border-dark-700">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-900/20 border border-red-500 text-red-400 hover:bg-red-900/30 py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}