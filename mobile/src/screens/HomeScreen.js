import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useQuery } from 'react-query';
import { contentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

const HomeScreen = () => {
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch top content for each category
  const { data: novelsData, isLoading: novelsLoading, refetch: refetchNovels } = useQuery(
    'top-novels',
    () => contentAPI.getContent({ type: 'novel', sort: 'popular', limit: 10 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: ebooksData, isLoading: ebooksLoading, refetch: refetchEbooks } = useQuery(
    'top-ebooks',
    () => contentAPI.getContent({ type: 'ebook', sort: 'popular', limit: 10 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: comicsData, isLoading: comicsLoading, refetch: refetchComics } = useQuery(
    'top-comics',
    () => contentAPI.getContent({ type: 'comic', sort: 'popular', limit: 10 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: mangasData, isLoading: mangasLoading, refetch: refetchMangas } = useQuery(
    'top-mangas',
    () => contentAPI.getContent({ type: 'manga', sort: 'popular', limit: 10 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchNovels(),
      refetchEbooks(),
      refetchComics(),
      refetchMangas()
    ]);
    setRefreshing(false);
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

  const renderContentSection = (title, data, isLoading, type) => {
    if (isLoading) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <FlatList
            data={[1, 2, 3, 4, 5]}
            renderItem={() => (
              <View style={styles.contentCard}>
                <View style={[styles.contentImage, styles.skeleton]} />
                <View style={styles.contentInfo}>
                  <View style={[styles.skeleton, { height: 16, marginBottom: 8 }]} />
                  <View style={[styles.skeleton, { height: 12, width: '70%' }]} />
                </View>
              </View>
            )}
            keyExtractor={(item) => item.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      );
    }

    if (!data?.content?.length) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(type, { type })}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={data.content}
          renderItem={renderContentCard}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Discover Amazing Content</Text>
        <Text style={styles.heroSubtitle}>
          Read novels, comics, manga, and e-books. Create and share your own stories.
        </Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Start Reading</Text>
          </TouchableOpacity>
          {!isAuthenticated && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.secondaryButtonText}>Join Community</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Ad Banner for Standard Users */}
      {isAuthenticated && !user?.isPro && (
        <View style={styles.adBanner}>
          <Text style={styles.adText}>📢 Advertisement</Text>
        </View>
      )}

      {/* Content Sections */}
      {renderContentSection(
        'Top 10 Novels of the Week',
        novelsData,
        novelsLoading,
        'Novels'
      )}
      
      {renderContentSection(
        'Top 10 E-books of the Week',
        ebooksData,
        ebooksLoading,
        'Ebooks'
      )}
      
      {renderContentSection(
        'Top 10 Comics of the Week',
        comicsData,
        comicsLoading,
        'Comics'
      )}
      
      {renderContentSection(
        'Top 10 Mangas of the Week',
        mangasData,
        mangasLoading,
        'Mangas'
      )}

      {/* Call to Action */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Start Creating?</Text>
        <Text style={styles.ctaSubtitle}>
          Join thousands of creators sharing their stories and earning from their content.
        </Text>
        {isAuthenticated ? (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Studio')}
          >
            <Text style={styles.ctaButtonText}>Go to Creator Studio</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.ctaButtonText}>Sign Up Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ctaButton, styles.ctaButtonSecondary]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.ctaButtonText, styles.ctaButtonTextSecondary]}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  heroSection: {
    backgroundColor: '#3b82f6',
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  adBanner: {
    backgroundColor: '#fef3c7',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f59e0b',
  },
  adText: {
    color: '#92400e',
    fontWeight: '500',
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  contentCard: {
    width: cardWidth,
    backgroundColor: 'white',
    borderRadius: 8,
    marginRight: 12,
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
  skeleton: {
    backgroundColor: '#e5e7eb',
  },
  ctaSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  ctaButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  ctaButtonTextSecondary: {
    color: '#3b82f6',
  },
});

export default HomeScreen;