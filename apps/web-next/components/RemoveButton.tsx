'use client';
import { useState } from 'react';

export function RemoveButton({ id }: { id: string }){
  const [removing, setRemoving] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
  async function remove(){
    setRemoving(true);
    await fetch(`${apiBase}/content/${id}/save`, { method:'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
    window.location.reload();
  }
  return <button onClick={remove} className="btn-outline" disabled={removing}>{removing ? 'Removing…' : 'Unsave'}</button>;
}
