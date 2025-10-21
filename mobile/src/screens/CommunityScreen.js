import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { useQuery } from 'react-query';
import { communityAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CommunityScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('channels');

  // Fetch channels
  const { data: channels, isLoading: channelsLoading } = useQuery(
    'channels',
    () => communityAPI.getChannels(),
    { refetchInterval: 30000 }
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
      Alert.alert('Success', 'Joined channel successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to join channel');
    }
  };

  const handleLeaveChannel = async (channelId) => {
    try {
      await communityAPI.leaveChannel(channelId);
      Alert.alert('Success', 'Left channel successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to leave channel');
    }
  };

  const renderChannels = () => (
    <ScrollView style={styles.container}>
      {channelsLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading channels...</Text>
        </View>
      ) : channels?.length > 0 ? (
        <View style={styles.listContainer}>
          {channels.map((channel) => (
            <View key={channel._id} style={styles.channelCard}>
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>{channel.name}</Text>
                <Text style={styles.channelDescription}>{channel.description}</Text>
                <View style={styles.channelMeta}>
                  <Text style={styles.channelMetaText}>
                    {channel.members?.length || 0} members
                  </Text>
                  <Text style={styles.channelMetaText}>•</Text>
                  <Text style={styles.channelMetaText}>
                    {channel.type === 'public' ? 'Public' : 'Private'}
                  </Text>
                </View>
              </View>
              <View style={styles.channelActions}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => Alert.alert('Coming Soon', 'Channel view will be available soon!')}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleJoinChannel(channel._id)}
                >
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>No channels yet</Text>
          <Text style={styles.emptySubtitle}>Be the first to create a channel!</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => Alert.alert('Coming Soon', 'Channel creation will be available soon!')}
          >
            <Text style={styles.emptyButtonText}>Create Channel</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderConversations = () => (
    <ScrollView style={styles.container}>
      {conversationsLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : conversations?.length > 0 ? (
        <View style={styles.listContainer}>
          {conversations.map((conversation) => {
            const otherParticipant = conversation.participants.find(
              p => p._id !== user?._id
            );
            return (
              <TouchableOpacity
                key={conversation._id}
                style={styles.conversationCard}
                onPress={() => Alert.alert('Coming Soon', 'Conversation view will be available soon!')}
              >
                <View style={styles.conversationAvatar}>
                  <Text style={styles.conversationAvatarText}>
                    {otherParticipant?.username?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.conversationInfo}>
                  <Text style={styles.conversationName}>
                    {otherParticipant?.username}
                  </Text>
                  <Text style={styles.conversationLastMessage} numberOfLines={1}>
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </Text>
                </View>
                <View style={styles.conversationMeta}>
                  <Text style={styles.conversationTime}>
                    {conversation.lastMessageAt
                      ? new Date(conversation.lastMessageAt).toLocaleDateString()
                      : ''
                    }
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💌</Text>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>Start a conversation with other creators!</Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Writers Community</Text>
        <Text style={styles.headerSubtitle}>Connect with other writers and creators</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'channels' && styles.activeTab]}
          onPress={() => setActiveTab('channels')}
        >
          <Text style={[styles.tabText, activeTab === 'channels' && styles.activeTabText]}>
            Channels
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'conversations' && styles.activeTab]}
          onPress={() => setActiveTab('conversations')}
        >
          <Text style={[styles.tabText, activeTab === 'conversations' && styles.activeTabText]}>
            Conversations
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'channels' && renderChannels()}
      {activeTab === 'conversations' && renderConversations()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  listContainer: {
    padding: 16,
  },
  channelCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  channelInfo: {
    marginBottom: 12,
  },
  channelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  channelDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  channelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelMetaText: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
  },
  channelActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  joinButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  conversationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  conversationAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  conversationLastMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  conversationTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default CommunityScreen;