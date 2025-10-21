import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useQuery } from 'react-query';
import { contentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

const ContentListScreen = ({ type }) => {
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [filters, setFilters] = useState({
    sort: 'newest',
    search: '',
    page: 1
  });
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery(
    [type, filters],
    () => contentAPI.getContent({
      type,
      sort: filters.sort,
      search: filters.search,
      page: filters.page,
      limit: 20
    }),
    { 
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setFilters(prev => ({ ...prev, search: text, page: 1 }));
  };

  const handleSortChange = (sort) => {
    setFilters(prev => ({ ...prev, sort, page: 1 }));
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }

    if (hasHalfStar) {
      stars.push('☆');
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push('☆');
    }

    return stars.join('');
  };

  const renderContentCard = ({ item }) => (
    <TouchableOpacity
      style={styles.contentCard}
      onPress={() => navigation.navigate('ContentReader', { 
        contentId: item._id,
        chapterNumber: 1 
      })}
    >
      <Image
        source={{ uri: item.coverImageURL }}
        style={styles.contentImage}
        defaultSource={require('../../assets/placeholder.png')}
      />
      <View style={styles.contentInfo}>
        <Text style={styles.contentTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.contentAuthor} numberOfLines={1}>
          by {item.authorId?.username}
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>
            {renderStars(item.averageRating)}
          </Text>
          <Text style={styles.ratingCount}>
            ({item.ratingCount})
          </Text>
        </View>
        <View style={styles.contentFooter}>
          <Text style={styles.contentType}>
            {item.contentType}
          </Text>
          <Text style={[
            styles.priceTag,
            item.monetizationType === 'free_ad_share' 
              ? styles.freeTag 
              : styles.premiumTag
          ]}>
            {item.monetizationType === 'free_ad_share' ? 'Free' : `$${item.price}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>
        {type.charAt(0).toUpperCase() + type.slice(1)}s
      </Text>
      <Text style={styles.subtitle}>
        Discover amazing {type}s from talented creators
      </Text>
      
      {/* Ad Banner for Standard Users */}
      {isAuthenticated && !user?.isPro && (
        <View style={styles.adBanner}>
          <Text style={styles.adText}>📢 Advertisement</Text>
        </View>
      )}

      {/* Search and Filter */}
      <View style={styles.filters}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${type}s...`}
          value={filters.search}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            const sortOptions = ['newest', 'oldest', 'popular', 'rating'];
            const currentIndex = sortOptions.indexOf(filters.sort);
            const nextSort = sortOptions[(currentIndex + 1) % sortOptions.length];
            handleSortChange(nextSort);
          }}
        >
          <Text style={styles.sortButtonText}>
            Sort: {filters.sort.charAt(0).toUpperCase() + filters.sort.slice(1)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>
        {type === 'novel' ? '📚' : type === 'ebook' ? '📖' : type === 'comic' ? '🎨' : '📚'}
      </Text>
      <Text style={styles.emptyTitle}>No {type}s found</Text>
      <Text style={styles.emptySubtitle}>
        {filters.search 
          ? `No ${type}s match your search`
          : `No ${type}s have been published yet`
        }
      </Text>
      {filters.search && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => setFilters(prev => ({ ...prev, search: '', page: 1 }))}
        >
          <Text style={styles.clearButtonText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error loading {type}s</Text>
        <Text style={styles.errorSubtitle}>Something went wrong while loading the {type}s.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.content || []}
        renderItem={renderContentCard}
        keyExtractor={(item) => item._id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  adBanner: {
    backgroundColor: '#fef3c7',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 16,
  },
  adText: {
    color: '#92400e',
    fontWeight: '500',
  },
  filters: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  sortButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  sortButtonText: {
    color: '#374151',
    fontSize: 14,
  },
  contentCard: {
    width: cardWidth,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  contentInfo: {
    padding: 12,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  contentAuthor: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    color: '#fbbf24',
  },
  ratingCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentType: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  priceTag: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeTag: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  premiumTag: {
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  clearButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ContentListScreen;