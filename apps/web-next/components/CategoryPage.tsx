async function fetchApi(route: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
  try {
    const res = await fetch(`${base}${route}`, { next: { revalidate: 60 } });
    return await res.json();
  } catch {
    return [] as any[];
  }
}

export async function CategoryPage({ title, type }: { title: string; type: string }) {
  const mostLiked = await fetchApi(`/content/most-liked?type=${encodeURIComponent(type)}`);
  const all = await fetchApi(`/content?type=${encodeURIComponent(type)}`);
  return (
    <div>
      <h1 className="section-title" style={{ fontSize: 28 }}>{title}</h1>
      <div style={{ display:'flex', alignItems:'center', gap:8, margin:'8px 0 16px' }}>
        <SortOptions />
      </div>
      <div className="section-title" style={{ fontSize: 20 }}>Most Liked</div>
      <div className="hscroll">
        {mostLiked.map((b: any) => (
          <div key={b._id} className="card" style={{ minWidth: 160 }}>
            <img className="card-img" src={b.coverImageURL || '/placeholder.png'} alt={b.title} />
            <div className="card-body">
              <div style={{ fontWeight:700, color:'var(--gold)' }}>{b.title}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="section-title" style={{ fontSize: 20 }}>All</div>
      <div className="grid">
        {all.map((b: any) => (
          <div key={b._id} className="card">
            <img className="card-img" src={b.coverImageURL || '/placeholder.png'} alt={b.title} />
            <div className="card-body">
              <div style={{ fontWeight:700, color:'var(--gold)' }}>{b.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SortOptions(){
  // Server rendered placeholder; enhance on client if needed
  return (
    <select className="input" style={{ maxWidth: 220 }} defaultValue="most-liked">
      <option value="most-liked">Sort by: Most Liked</option>
      <option value="newest">Sort by: Newest</option>
      <option value="az">Sort by: A-Z</option>
    </select>
  );
}
