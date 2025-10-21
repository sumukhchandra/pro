import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import { useQuery } from 'react-query';
import { userAPI, paymentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch user's list
  const { data: myList, isLoading: listLoading } = useQuery(
    'my-list',
    () => userAPI.getMyList(),
    { enabled: !!user }
  );

  // Fetch user's downloads (Pro only)
  const { data: downloads, isLoading: downloadsLoading } = useQuery(
    'downloads',
    () => userAPI.getDownloads(),
    { enabled: !!user?.isPro }
  );

  // Fetch user's earnings
  const { data: earnings, isLoading: earningsLoading } = useQuery(
    'earnings',
    () => userAPI.getEarnings(),
    { enabled: !!user }
  );

  const handleUpgradeToPro = () => {
    Alert.alert('Upgrade to Pro', 'Pro features will be available soon!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const renderProfile = () => (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          {user?.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.isPro && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>Pro Member</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue}>{user?.username}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Bio</Text>
          <Text style={styles.infoValue}>{user?.bio || 'No bio yet'}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon!')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {!user?.isPro && (
        <View style={styles.upgradeSection}>
          <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
          <Text style={styles.upgradeSubtitle}>
            Get ad-free experience, offline downloads, and premium content creation features.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgradeToPro}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderMyList = () => (
    <ScrollView style={styles.container}>
      {listLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your list...</Text>
        </View>
      ) : myList?.length > 0 ? (
        <View style={styles.listContainer}>
          {myList.map((content) => (
            <TouchableOpacity key={content._id} style={styles.contentCard}>
              <Image
                source={{ uri: content.coverImageURL }}
                style={styles.contentImage}
              />
              <View style={styles.contentInfo}>
                <Text style={styles.contentTitle} numberOfLines={2}>
                  {content.title}
                </Text>
                <Text style={styles.contentAuthor} numberOfLines={1}>
                  by {content.authorId?.username}
                </Text>
                <View style={styles.contentFooter}>
                  <Text style={styles.contentRating}>
                    {content.averageRating.toFixed(1)} ⭐
                  </Text>
                  <TouchableOpacity style={styles.readButton}>
                    <Text style={styles.readButtonText}>Read</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>Your list is empty</Text>
          <Text style={styles.emptySubtitle}>Start adding content to your list!</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderDownloads = () => (
    <ScrollView style={styles.container}>
      {!user?.isPro ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📱</Text>
          <Text style={styles.emptyTitle}>Pro Feature</Text>
          <Text style={styles.emptySubtitle}>
            Download content for offline reading with Pro subscription.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleUpgradeToPro}
          >
            <Text style={styles.emptyButtonText}>Upgrade to Pro</Text>
          </TouchableOpacity>
        </View>
      ) : downloadsLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading downloads...</Text>
        </View>
      ) : downloads?.length > 0 ? (
        <View style={styles.listContainer}>
          {downloads.map((content) => (
            <TouchableOpacity key={content._id} style={styles.contentCard}>
              <Image
                source={{ uri: content.coverImageURL }}
                style={styles.contentImage}
              />
              <View style={styles.contentInfo}>
                <Text style={styles.contentTitle} numberOfLines={2}>
                  {content.title}
                </Text>
                <Text style={styles.contentAuthor} numberOfLines={1}>
                  by {content.authorId?.username}
                </Text>
                <View style={styles.contentFooter}>
                  <Text style={styles.downloadStatus}>Downloaded</Text>
                  <TouchableOpacity style={styles.readButton}>
                    <Text style={styles.readButtonText}>Read Offline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📱</Text>
          <Text style={styles.emptyTitle}>No downloads yet</Text>
          <Text style={styles.emptySubtitle}>Download content for offline reading!</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderEarnings = () => (
    <ScrollView style={styles.container}>
      {earningsLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading earnings...</Text>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earnings Overview</Text>
            <View style={styles.earningsGrid}>
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
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earnings by Content</Text>
            {earnings?.earningsByContent?.length > 0 ? (
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
        </>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-list' && styles.activeTab]}
          onPress={() => setActiveTab('my-list')}
        >
          <Text style={[styles.tabText, activeTab === 'my-list' && styles.activeTabText]}>
            My List
          </Text>
        </TouchableOpacity>
        {user?.isPro && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'downloads' && styles.activeTab]}
            onPress={() => setActiveTab('downloads')}
          >
            <Text style={[styles.tabText, activeTab === 'downloads' && styles.activeTabText]}>
              Downloads
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.tab, activeTab === 'earnings' && styles.activeTab]}
          onPress={() => setActiveTab('earnings')}
        >
          <Text style={[styles.tabText, activeTab === 'earnings' && styles.activeTabText]}>
            Earnings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'profile' && renderProfile()}
      {activeTab === 'my-list' && renderMyList()}
      {activeTab === 'downloads' && renderDownloads()}
      {activeTab === 'earnings' && renderEarnings()}
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
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  proBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  proBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  upgradeSection: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    margin: 16,
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  upgradeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
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
  contentCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentImage: {
    width: 60,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
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
  contentAuthor: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentRating: {
    fontSize: 12,
    color: '#6b7280',
  },
  downloadStatus: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  readButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  readButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
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
  earningsGrid: {
    flexDirection: 'row',
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
    gap: 12,
  },
  earningsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
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
});

export default ProfileScreen;