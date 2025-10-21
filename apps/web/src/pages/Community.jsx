import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../api/client';
import { apiFetch } from '../api/client';

const Community = () => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/api/users');
        setUsers(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(API_BASE, { auth: { token } });
    socket.on('message', (m) => setMessages((cur) => [...cur, m]));
    return () => socket.disconnect();
  }, []);

  return (
    <div className="flex h-[calc(100vh-140px)]">
      <aside className="w-64 border-r p-3 overflow-y-auto">
        <h3 className="font-semibold mb-2">People</h3>
        {users.map((u) => (
          <button key={u.id} onClick={() => setSelected(u)} className={`block w-full text-left p-2 rounded ${selected?.id===u.id?'bg-gray-200':''}`}>{u.email || u.username}</button>
        ))}
      </aside>
      <section className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          {messages.map((m) => (
            <div key={m._id} className="p-2 bg-gray-100 rounded w-fit max-w-[75%]">{m.content}</div>
          ))}
        </div>
        <form className="p-3 border-t flex gap-2" onSubmit={(e)=>{e.preventDefault();}}>
          <input className="border p-2 flex-1" value={text} onChange={(e)=>setText(e.target.value)} placeholder="Type a message" />
          <button className="bg-blue-600 text-white px-3 py-2 rounded" disabled={!selected}>Send</button>
        </form>
      </section>
    </div>
  );
};

export default Community;
