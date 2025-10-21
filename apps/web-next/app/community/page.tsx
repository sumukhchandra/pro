'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

export default function CommunityPage(){
  const [channels, setChannels] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    fetch(`${apiBase}/community/channels`, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .then(r=>r.json()).then(setChannels);
  }, []);

  useEffect(() => {
    const s = io(apiBase.replace('/api',''));
    setSocket(s);
    return () => { try { s.close(); } catch {} };
  }, []);

  useEffect(() => {
    if (!socket || !active) return;
    socket.emit('joinChannel', active);
    socket.on('channelMessage', (msg:any) => setMessages((m)=>[...m, msg]));
    return () => { socket.emit('leaveChannel', active); socket.off('channelMessage'); };
  }, [socket, active]);

  useEffect(() => {
    if (!active) return;
    fetch(`${apiBase}/community/channels/${active}/messages`, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .then(r=>r.json()).then(setMessages);
  }, [active]);

  async function send(){
    if (!active || !text.trim()) return;
    const res = await fetch(`${apiBase}/community/channels/${active}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      body: JSON.stringify({ content: text })
    });
    const msg = await res.json();
    socket?.emit('channelMessage', { channelId: active, message: msg });
    setText('');
  }

  return (
    <div>
      <h1 className="section-title" style={{ fontSize: 28 }}>Community</h1>
      <div className="chat">
        <div className="chat-sidebar">
          {channels.map((c)=> (
            <button key={c._id} onClick={()=>setActive(c._id)} className={"btn-outline"} style={{ display:'block', width:'100%', textAlign:'left', marginBottom:8, borderColor: active===c._id ? 'var(--gold)' : undefined }}>
              {c.name}
            </button>
          ))}
        </div>
        <div className="chat-messages">
          <div className="chat-stream">
            {messages.map((m)=> (
              <div key={m._id} style={{ marginBottom:8 }}>
                <span className="gold">{new Date(m.timestamp||m.createdAt).toLocaleTimeString()}:</span> {m.content}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input className="input" value={text} onChange={(e)=>setText(e.target.value)} placeholder="Type your message…" />
            <button className="btn" onClick={send}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
