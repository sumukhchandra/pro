import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

const Studio = () => {
  const [mine, setMine] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', contentType: 'novel', monetizationType: 'free_ad_share', price: 0 });

  const load = async () => {
    const items = await apiFetch('/api/content/mine');
    setMine(items);
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await apiFetch('/api/content', { method: 'POST', body: form });
    setForm({ title: '', description: '', contentType: 'novel', monetizationType: 'free_ad_share', price: 0 });
    await load();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="space-y-3 bg-white p-4 rounded shadow">
        <h2 className="font-semibold text-lg">Create New</h2>
        <input className="border p-2 w-full" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="border p-2 w-full" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="flex gap-2">
          <select className="border p-2" value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value })}>
            <option value="novel">Novel</option>
            <option value="ebook">E-book</option>
            <option value="comic">Comic</option>
            <option value="manga">Manga</option>
          </select>
          <select className="border p-2" value={form.monetizationType} onChange={(e) => setForm({ ...form, monetizationType: e.target.value })}>
            <option value="free_ad_share">Free-to-Read (Ads)</option>
            <option value="premium_to_buy">Premium-to-Buy</option>
          </select>
          <input className="border p-2 w-32" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
      </form>

      <div>
        <h2 className="font-semibold text-lg mb-2">My Published Works</h2>
        <ul className="space-y-2">
          {mine.map((c) => (
            <li key={c._id} className="bg-white p-3 rounded shadow flex items-center justify-between">
              <div>
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-gray-500">{c.contentType} • {c.monetizationType} • Views: {c.weeklyViewCount}</div>
              </div>
              <a className="text-blue-600 underline" href={`/read/${c._id}`}>Open</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Studio;
