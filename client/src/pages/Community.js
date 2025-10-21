import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { communityAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Community = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('channels');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Fetch channels
  const { data: channels, isLoading: channelsLoading } = useQuery(
    'channels',
    () => communityAPI.getChannels(),
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery(
    'conversations',
    () => communityAPI.getConversations(),
    { enabled: !!user, refetchInterval: 30000 }
  );

  const handleJoinChannel = async (channelId) => {
    try {
      await communityAPI.joinChannel(channelId);
      toast.success('Joined channel successfully');
    } catch (error) {
      toast.error('Failed to join channel');
    }
  };

  const handleLeaveChannel = async (channelId) => {
    try {
      await communityAPI.leaveChannel(channelId);
      toast.success('Left channel successfully');
    } catch (error) {
      toast.error('Failed to leave channel');
    }
  };

  const renderChannels = () => (
    <div className="space-y-4">
      {channelsLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 h-20 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : channels?.length > 0 ? (
        channels.map((channel) => (
          <div key={channel._id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{channel.name}</h3>
                <p className="text-gray-600 mt-1">{channel.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500">
                    {channel.members?.length || 0} members
                  </span>
                  <span className="text-sm text-gray-500">
                    {channel.type === 'public' ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedChannel(channel)}
                  className="btn btn-outline btn-sm"
                >
                  View
                </button>
                <button
                  onClick={() => handleJoinChannel(channel._id)}
                  className="btn btn-primary btn-sm"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No channels yet</h3>
          <p className="text-gray-600 mb-4">Be the first to create a channel!</p>
          <button className="btn btn-primary">Create Channel</button>
        </div>
      )}
    </div>
  );

  const renderConversations = () => (
    <div className="space-y-4">
      {conversationsLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 h-16 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : conversations?.length > 0 ? (
        conversations.map((conversation) => {
          const otherParticipant = conversation.participants.find(
            p => p._id !== user?._id
          );
          return (
            <div
              key={conversation._id}
              className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  {otherParticipant?.profileImage ? (
                    <img
                      src={otherParticipant.profileImage}
                      alt={otherParticipant.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium text-gray-600">
                      {otherParticipant?.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {otherParticipant?.username}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">
                    {conversation.lastMessageAt
                      ? new Date(conversation.lastMessageAt).toLocaleDateString()
                      : ''
                    }
                  </span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-600">Start a conversation with other creators!</p>
        </div>
      )}
    </div>
  );

  const renderChannelView = () => (
    <div className="bg-white rounded-lg shadow-sm h-96 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedChannel?.name}
          </h3>
          <button
            onClick={() => setSelectedChannel(null)}
            className="btn btn-outline btn-sm"
          >
            ← Back
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {selectedChannel?.description}
        </p>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">💬</div>
            <p>Channel messages will appear here</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="form-input flex-1"
          />
          <button className="btn btn-primary">Send</button>
        </div>
      </div>
    </div>
  );

  const renderConversationView = () => (
    <div className="bg-white rounded-lg shadow-sm h-96 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedConversation?.participants?.find(p => p._id !== user?._id)?.username}
          </h3>
          <button
            onClick={() => setSelectedConversation(null)}
            className="btn btn-outline btn-sm"
          >
            ← Back
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">💌</div>
            <p>Conversation messages will appear here</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="form-input flex-1"
          />
          <button className="btn btn-primary">Send</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Writers Community</h1>
          <p className="text-gray-600">Connect with other writers and creators</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {selectedChannel ? (
          renderChannelView()
        ) : selectedConversation ? (
          renderConversationView()
        ) : (
          <>
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('channels')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'channels'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Channels
                  </button>
                  <button
                    onClick={() => setActiveTab('conversations')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'conversations'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Conversations
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'channels' && renderChannels()}
            {activeTab === 'conversations' && renderConversations()}
          </>
        )}
      </div>
    </div>
  );
};

export default Community;