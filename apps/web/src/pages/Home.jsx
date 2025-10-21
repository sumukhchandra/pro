import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const Home = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3001/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          throw new Error('Failed to fetch users. Is the API server running?');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message && selectedUser) {
      socket.emit('chat message', { to: selectedUser.id, text: message });
      setMessage('');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-full text-red-500">{error}</div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* User list sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">People</h2>
        <ul>
          {users.map((user) => (
            <li
              key={user.id}
              className={`p-2 hover:bg-gray-200 cursor-pointer rounded mb-2 ${selectedUser?.id === user.id ? 'bg-gray-300' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              {user.email}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat area */}
      <div className="w-3/4 flex flex-col">
        {selectedUser ? (
          <div className="flex flex-col h-full">
            {/* Chat header */}
            <div className="p-4 border-b-2 border-gray-200">
              <h2 className="text-xl font-bold">{selectedUser.email}</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.from === selectedUser?.id ? 'text-left' : 'text-right'}`}>
                  <div className={`inline-block p-2 rounded-lg ${msg.from === selectedUser?.id ? 'bg-gray-200' : 'bg-blue-500 text-white'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <div className="p-4 border-t-2 border-gray-200">
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  className="w-full border p-2 rounded-l-md"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600">
                  Send
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full bg-gray-50">
            <p className="text-gray-500">Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
