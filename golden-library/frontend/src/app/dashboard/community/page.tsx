'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  username: string;
  email: string;
}

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
  };
  createdAt: string;
}

interface Channel {
  _id: string;
  name: string;
  description: string;
  members: User[];
}

export default function CommunityPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isDmMode, setIsDmMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);

    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('new_dm', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    // Fetch channels
    fetchChannels();

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChannels = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/channels');
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const joinChannel = (channelId: string) => {
    if (socket) {
      socket.emit('join_channel', channelId);
      setCurrentChannel(channelId);
      setIsDmMode(false);
      setSelectedUser(null);
      fetchChannelMessages(channelId);
    }
  };

  const fetchChannelMessages = async (channelId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/channels/${channelId}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !socket) return;

    if (isDmMode && selectedUser) {
      // Send direct message
      socket.emit('send_dm', {
        dmId: currentChannel,
        content: messageInput
      });
    } else if (currentChannel) {
      // Send channel message
      socket.emit('send_message', {
        channelId: currentChannel,
        content: messageInput
      });
    }

    setMessageInput('');
  };

  const startDirectMessage = (user: User) => {
    if (socket) {
      socket.emit('start_dm', user.id);
      setSelectedUser(user);
      setIsDmMode(true);
      setCurrentChannel(null);
      setMessages([]);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/chat/search-users?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-pulse text-golden-500 text-xl">Loading community...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-serif font-bold text-golden-500 mb-8">
          Community
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Channels */}
            <div className="card">
              <h2 className="text-lg font-semibold text-golden-500 mb-4">
                Channels
              </h2>
              <div className="space-y-2">
                {channels.map((channel) => (
                  <button
                    key={channel._id}
                    onClick={() => joinChannel(channel._id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                      currentChannel === channel._id && !isDmMode
                        ? 'bg-golden-500/20 text-golden-500'
                        : 'text-dark-300 hover:bg-dark-800'
                    }`}
                  >
                    <div className="font-medium">#{channel.name}</div>
                    <div className="text-sm text-dark-400">{channel.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Messages */}
            <div className="card">
              <h2 className="text-lg font-semibold text-golden-500 mb-4">
                Direct Messages
              </h2>
              
              {/* User Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  className="input-field w-full text-sm"
                />
                
                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => startDirectMessage(user)}
                        className="w-full text-left p-2 text-sm text-dark-300 hover:bg-dark-800 rounded-lg transition-colors duration-200"
                      >
                        {user.username}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedUser && (
                <div className="p-3 bg-golden-500/20 text-golden-500 rounded-lg">
                  <div className="font-medium">@{selectedUser.username}</div>
                  <div className="text-sm text-golden-400">Direct Message</div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="card flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="border-b border-dark-700 pb-4 mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {isDmMode && selectedUser ? `@${selectedUser.username}` : 
                   currentChannel ? `#${channels.find(c => c._id === currentChannel)?.name}` :
                   'Select a channel or start a conversation'}
                </h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-golden-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-dark-950 font-bold text-sm">
                        {message.sender.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-white text-sm">
                          {message.sender.username}
                        </span>
                        <span className="text-dark-400 text-xs">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-dark-300 text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="input-field flex-1"
                  disabled={!currentChannel && !isDmMode}
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || (!currentChannel && !isDmMode)}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}