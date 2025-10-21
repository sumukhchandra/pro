import { cookies } from 'next/headers';

export default async function SavedPage(){
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
  const token = cookies().get('token')?.value || '';
  const res = await fetch(`${base}/saved`, { cache: 'no-store', headers: { Authorization: `Bearer ${token}` } });
  const items = await res.json();
  return (
    <div>
      <h1 className="section-title" style={{ fontSize: 28 }}>Saved List</h1>
      <div className="grid">
        {items.map((b: any) => (
          <div key={b._id} className="card">
            <img className="card-img" src={b.coverImageURL || '/placeholder.png'} alt={b.title} />
            <div className="card-body" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontWeight:700, color:'var(--gold)' }}>{b.title}</div>
              <RemoveButton id={b._id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { RemoveButton } from '../../components/RemoveButton';
