'use client';
import { useState } from 'react';

export function SaveButton({ id, small }: { id: string; small?: boolean }) {
  const [saved, setSaved] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
  async function toggleSave() {
    try {
      const method = saved ? 'DELETE' : 'POST';
      const res = await fetch(`${apiBase}/content/${id}/save`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (res.ok) setSaved(!saved);
    } catch {}
  }
  return (
    <button onClick={toggleSave} className={small ? 'btn-outline' : 'save'}>{saved ? '★' : '☆'}</button>
  );
}
