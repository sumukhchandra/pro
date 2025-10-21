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
import { contentAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreatorStudioScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch user's content
  const { data: myContent, isLoading: contentLoading, refetch: refetchContent } = useQuery(
    'my-content',
    () => contentAPI.getMyContent(),
    { enabled: !!user }
  );

  // Fetch user's earnings
  const { data: earnings, isLoading: earningsLoading } = useQuery(
    'earnings',
    () => userAPI.getEarnings(),
    { enabled: !!user }
  );

  // Fetch user's stats
  const { data: stats, isLoading: statsLoading } = useQuery(
    'user-stats',
    () => userAPI.getStats(),
    { enabled: !!user }
  );

  const handleCreateContent = () => {
    Alert.alert('Coming Soon', 'Content creation will be available in the next update!');
  };

  const renderDashboard = () => (
    <ScrollView style={styles.container}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📚</Text>
          <Text style={styles.statValue}>
            {stats?.contentStats?.totalContent || 0}
          </Text>
          <Text style={styles.statLabel}>Total Content</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>👀</Text>
          <Text style={styles.statValue}>
            {stats?.contentStats?.totalViews || 0}
          </Text>
          <Text style={styles.statLabel}>Total Views</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statValue}>
            {stats?.contentStats?.averageRating?.toFixed(1) || '0.0'}
          </Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>💰</Text>
          <Text style={styles.statValue}>
            ${stats?.userStats?.adShareBalance?.toFixed(2) || '0.00'}
          </Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
      </View>

      {/* Recent Content */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Content</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateContent}
          >
            <Text style={styles.createButtonText}>Create New</Text>
          </TouchableOpacity>
        </View>

        {contentLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading content...</Text>
          </View>
        ) : myContent?.length > 0 ? (
          <View style={styles.contentList}>
            {myContent.map((content) => (
              <View key={content._id} style={styles.contentItem}>
                <View style={styles.contentInfo}>
                  <Text style={styles.contentTitle}>{content.title}</Text>
                  <Text style={styles.contentMeta}>
                    {content.contentType} • {content.status} • {content.totalViewCount} views
                  </Text>
                  <View style={styles.contentFooter}>
                    <Text style={styles.contentRating}>
                      {content.averageRating.toFixed(1)} ⭐ ({content.ratingCount})
                    </Text>
                    <View style={[
                      styles.priceTag,
                      content.monetizationType === 'free_ad_share'
                        ? styles.freeTag
                        : styles.premiumTag
                    ]}>
                      <Text style={styles.priceTagText}>
                        {content.monetizationType === 'free_ad_share' ? 'Free' : `$${content.price}`}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.contentActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
                    <Text style={[styles.actionButtonText, styles.primaryActionText]}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No content yet</Text>
            <Text style={styles.emptySubtitle}>Start creating your first piece of content!</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleCreateContent}
            >
              <Text style={styles.emptyButtonText}>Create Your First Content</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderEarnings = () => (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Earnings Overview</Text>
        {earningsLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading earnings...</Text>
          </View>
        ) : (
          <View style={styles.earningsContainer}>
            <View style={styles.earningsCard}>
              <Text style={styles.earningsValue}>
                ${earnings?.totalEarnings?.toFixed(2) || '0.00'}
              </Text>
              <Text style={styles.earningsLabel}>Total Earnings</Text>
            </View>
            <View style={styles.earningsCard}>
              <Text style={styles.earningsValue}>
                {earnings?.totalViews || 0}
              </Text>
              <Text style={styles.earningsLabel}>Total Views</Text>
            </View>
            <View style={styles.earningsCard}>
              <Text style={styles.earningsValue}>
                ${earnings?.currentBalance?.toFixed(2) || '0.00'}
              </Text>
              <Text style={styles.earningsLabel}>Current Balance</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Earnings by Content</Text>
        {earningsLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading content earnings...</Text>
          </View>
        ) : earnings?.earningsByContent?.length > 0 ? (
          <View style={styles.earningsList}>
            {earnings.earningsByContent.map((item) => (
              <View key={item.contentId} style={styles.earningsItem}>
                <View style={styles.earningsItemInfo}>
                  <Text style={styles.earningsItemTitle}>{item.title}</Text>
                  <Text style={styles.earningsItemMeta}>
                    {item.totalViews} views • ${item.totalEarnings.toFixed(2)} earned
                  </Text>
                </View>
                <Text style={styles.earningsItemValue}>
                  ${item.totalEarnings.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💰</Text>
            <Text style={styles.emptyTitle}>No earnings yet</Text>
            <Text style={styles.emptySubtitle}>Start creating content to earn from ad revenue!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderCreate = () => (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create New Content</Text>
        <View style={styles.createForm}>
          <Text style={styles.formLabel}>Content Type</Text>
          <TouchableOpacity style={styles.formInput}>
            <Text style={styles.formInputText}>Novel</Text>
          </TouchableOpacity>

          <Text style={styles.formLabel}>Monetization</Text>
          <TouchableOpacity style={styles.formInput}>
            <Text style={styles.formInputText}>
              {user?.isPro ? 'Free (Ad Revenue) or Premium (Set Price)' : 'Free (Ad Revenue)'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.formLabel}>Title</Text>
          <TouchableOpacity style={styles.formInput}>
            <Text style={styles.formInputText}>Enter content title</Text>
          </TouchableOpacity>

          <Text style={styles.formLabel}>Description</Text>
          <TouchableOpacity style={[styles.formInput, styles.formTextArea]}>
            <Text style={styles.formInputText}>Enter content description</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createContentButton}
            onPress={handleCreateContent}
          >
            <Text style={styles.createContentButtonText}>Create Content</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Creator Studio</Text>
        <Text style={styles.headerSubtitle}>Manage your content and track your earnings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'earnings' && styles.activeTab]}
          onPress={() => setActiveTab('earnings')}
        >
          <Text style={[styles.tabText, activeTab === 'earnings' && styles.activeTabText]}>
            Earnings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
            Create
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'earnings' && renderEarnings()}
      {activeTab === 'create' && renderCreate()}
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  contentList: {
    padding: 16,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  contentMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  contentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentRating: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  freeTag: {
    backgroundColor: '#dcfce7',
  },
  premiumTag: {
    backgroundColor: '#e0e7ff',
  },
  priceTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#166534',
  },
  contentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  primaryAction: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#374151',
  },
  primaryActionText: {
    color: 'white',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
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
  earningsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  earningsCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  earningsList: {
    padding: 16,
  },
  earningsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  earningsItemInfo: {
    flex: 1,
  },
  earningsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  earningsItemMeta: {
    fontSize: 14,
    color: '#6b7280',
  },
  earningsItemValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  createForm: {
    padding: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  formTextArea: {
    height: 80,
  },
  formInputText: {
    fontSize: 16,
    color: '#6b7280',
  },
  createContentButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  createContentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreatorStudioScreen;