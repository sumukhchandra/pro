import Image from 'next/image';
import Link from 'next/link';
import { SaveButton } from '../components/SaveButton';

export default async function HomePage() {
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
  async function get(path: string){
    try {
      const res = await fetch(`${base}${path}`, { next: { revalidate: 60 } });
      return await res.json();
    } catch {
      return [] as any[];
    }
  }
  const [featured, comics, manga, novels] = await Promise.all([
    get('/content?sort=newest'),
    get('/content?type=comic'),
    get('/content?type=manga'),
    get('/content?type=novel'),
  ]);

  return (
    <div>
      <section>
        <div className="section-title">Featured</div>
        <div className="hscroll">
          {featured.slice(0, 5).map((b: any) => (
            <div key={b._id} className="slide" style={{ minWidth: '90%' }}>
              <img src={b.coverImageURL || '/placeholder.png'} alt={b.title} style={{ width:'100%', height:320, objectFit:'cover' }} />
              <div className="title">{b.title}</div>
              <SaveButton id={b._id} />
            </div>
          ))}
        </div>
      </section>

      <CategoryRow title="Trending Comics" items={comics} />
      <CategoryRow title="Manga" items={manga} />
      <CategoryRow title="Novels" items={novels} />
    </div>
  );
}

function CategoryRow({ title, items }: { title: string; items: any[] }) {
  return (
    <section>
      <div className="section-title">{title}</div>
      <div className="hscroll">
        {items.map((b) => (
          <div key={b._id} className="card" style={{ minWidth: 160 }}>
            <img className="card-img" src={b.coverImageURL || '/placeholder.png'} alt={b.title} />
            <div className="card-body">
              <div style={{ fontWeight:700, color:'var(--gold)' }}>{b.title}</div>
              <SaveButton id={b._id} small />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// SaveButton moved to client component in components/SaveButton.tsx
