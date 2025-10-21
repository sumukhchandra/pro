import './globals.css';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { ClientActiveLink, SettingsPanel } from '../components/NavClient';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <div style={{ height: 60 }} />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}

function NavBar() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo">The Golden Library</Link>
        <div className="nav-links">
          <ActiveLink href="/">Home</ActiveLink>
          <ActiveLink href="/novels">Novels</ActiveLink>
          <ActiveLink href="/ebooks">E-Books</ActiveLink>
          <ActiveLink href="/comics">Comics</ActiveLink>
          <ActiveLink href="/manga">Manga</ActiveLink>
          <ActiveLink href="/saved">Saved List</ActiveLink>
          <ActiveLink href="/community">Community</ActiveLink>
        </div>
        <Suspense>
          <SettingsPanel tokenPresent={!!token} />
        </Suspense>
      </div>
    </nav>
  );
}

function ActiveLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <ClientActiveLink href={href}>{children}</ClientActiveLink>;
}
