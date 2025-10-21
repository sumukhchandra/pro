'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function SettingsPanel({ tokenPresent }: { tokenPresent: boolean }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    function onKey(e: KeyboardEvent){ if(e.key === 'Escape') setOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button aria-label="Settings" className="btn-outline" onClick={() => setOpen(true)}>⚙</button>
      {mounted && open && createPortal(
        <>
          <div className="backdrop" onClick={() => setOpen(false)} />
          <div className="panel open">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:12 }}>
              <div className="gold" style={{ fontWeight: 700 }}>Settings</div>
              <button className="btn-outline" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div style={{ padding:12, display:'grid', gap:10 }}>
              <Link href="/contact" className="btn-outline">Contact Us</Link>
            </div>
            <div style={{ position:'absolute', bottom:12, left:12, right:12 }}>
              {tokenPresent ? (
                <form action="/api/logout" method="post">
                  <button className="btn" style={{ width:'100%' }}>Logout</button>
                </form>
              ) : (
                <Link href="/login" className="btn" style={{ display:'block', textAlign:'center' }}>Login</Link>
              )}
            </div>
          </div>
        </>, document.body)
      }
    </div>
  );
}

export function ClientActiveLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const check = () => setActive(window.location.pathname === href);
    check();
    window.addEventListener('popstate', check);
    return () => window.removeEventListener('popstate', check);
  }, [href]);
  return <Link href={href} className={active ? 'nav-link active' : 'nav-link'}>{children}</Link>;
}
