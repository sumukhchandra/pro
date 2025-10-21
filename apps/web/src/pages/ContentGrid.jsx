import React, { useEffect, useState, useMemo } from 'react';
import ContentCard from '../components/ContentCard';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

const ContentGrid = ({ type }) => {
  const { user } = useAuth();
  const isPro = user?.userRole === 'pro';
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const params = useMemo(() => new URLSearchParams({ type, q }).toString(), [type, q]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/content?${params}`);
        if (!active) return;
        setItems(data.items || []);
      } catch (e) {
        if (!active) return;
        setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [params]);

  const handleToggleList = async (id) => {
    try {
      await apiFetch(`/api/content/${id}/my-list`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = async (id) => {
    try {
      const data = await apiFetch(`/api/content/${id}/download`);
      // naive save to localStorage for demo
      localStorage.setItem(`download-${id}`, JSON.stringify(data));
      alert('Downloaded for offline use');
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex items-center mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${type}s...`} className="border p-2 rounded w-full" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <ContentCard key={item._id} item={item} isPro={isPro} onToggleList={() => handleToggleList(item._id)} onDownload={() => handleDownload(item._id)} />
        ))}
      </div>
    </div>
  );
};

export default ContentGrid;
