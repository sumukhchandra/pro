import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const conversations = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Doe' },
];

const ChatSidebar = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message) {
      socket.emit('chat message', message);
      setMessage('');
    }
  };

  return (
    <div className="w-80 bg-gray-100 p-4">
      <h2 className="text-xl font-bold mb-4">Chats</h2>
      <ul>
        {conversations.map((conv) => (
          <li
            key={conv.id}
            className="p-2 hover:bg-gray-200 cursor-pointer"
            onClick={() => setSelectedConversation(conv)}
          >
            {conv.name}
          </li>
        ))}
      </ul>

      {selectedConversation && (
        <div className="mt-4">
          <h3 className="text-lg font-bold">{selectedConversation.name}</h3>
          <div className="h-64 overflow-y-auto border p-2 my-2">
            {messages.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              className="w-full border p-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 mt-2">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;