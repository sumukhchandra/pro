import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { Link } from 'react-router-dom';

const Row = ({ title, type }) => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`/api/content/top?type=${type}`);
        setItems(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [type]);

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {items.map((it) => (
          <Link key={it._id} to={`/read/${it._id}`} className="min-w-[160px]">
            <img src={it.coverImageURL || '/placeholder.png'} alt={it.title} className="w-40 h-56 object-cover rounded" />
            <div className="mt-1 text-sm line-clamp-1">{it.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
};

const Home = () => (
  <div className="p-4">
    <Row title="Top 10 Books of the Week" type="ebook" />
    <Row title="Top 10 Mangas of the Week" type="manga" />
    <Row title="Top 10 Comics of the Week" type="comic" />
    <Row title="Top 10 Novels of the Week" type="novel" />
  </div>
);

export default Home;
