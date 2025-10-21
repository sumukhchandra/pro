import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import { useQuery } from 'react-query';
import { contentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const ContentReaderScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();
  const { contentId, chapterNumber } = route.params;
  const [currentChapter, setCurrentChapter] = useState(parseInt(chapterNumber) || 1);

  // Fetch content details
  const { data: contentData, isLoading: contentLoading } = useQuery(
    ['content', contentId],
    () => contentAPI.getContentById(contentId),
    { enabled: !!contentId }
  );

  // Fetch chapters
  const { data: chaptersData, isLoading: chaptersLoading } = useQuery(
    ['chapters', contentId],
    () => contentAPI.getChapters(contentId),
    { enabled: !!contentId }
  );

  // Fetch current chapter
  const { data: chapterData, isLoading: chapterLoading } = useQuery(
    ['chapter', contentId, currentChapter],
    () => contentAPI.getChapter(contentId, currentChapter),
    { enabled: !!contentId && !!currentChapter }
  );

  const handleChapterChange = (direction) => {
    if (!chaptersData?.length) return;

    const newChapter = direction === 'next' ? currentChapter + 1 : currentChapter - 1;
    const maxChapter = chaptersData.length;

    if (newChapter >= 1 && newChapter <= maxChapter) {
      setCurrentChapter(newChapter);
      navigation.setParams({ chapterNumber: newChapter });
    }
  };

  const handleRating = async (rating) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to rate content');
      return;
    }

    try {
      await contentAPI.rateContent(contentId, { ratingValue: rating });
      Alert.alert('Success', 'Rating submitted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating');
    }
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

  if (contentLoading || chaptersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!contentData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Content not found</Text>
        <Text style={styles.errorSubtitle}>The content you're looking for doesn't exist.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const content = contentData;
  const chapters = chaptersData || [];
  const chapter = chapterData;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {content.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            by {content.authorId?.username} • Chapter {currentChapter} of {chapters.length}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRating(5)}
          >
            <Text style={styles.actionButtonText}>⭐</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ad Banner for Standard Users */}
      {isAuthenticated && !user?.isPro && (
        <View style={styles.adBanner}>
          <Text style={styles.adText}>📢 Advertisement</Text>
        </View>
      )}

      {/* Chapter Navigation */}
      <View style={styles.chapterNav}>
        <TouchableOpacity
          style={[styles.navButton, currentChapter <= 1 && styles.navButtonDisabled]}
          onPress={() => handleChapterChange('prev')}
          disabled={currentChapter <= 1}
        >
          <Text style={[styles.navButtonText, currentChapter <= 1 && styles.navButtonTextDisabled]}>
            ← Previous
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.chapterInfo}>
          Chapter {currentChapter} of {chapters.length}
        </Text>
        
        <TouchableOpacity
          style={[styles.navButton, currentChapter >= chapters.length && styles.navButtonDisabled]}
          onPress={() => handleChapterChange('next')}
          disabled={currentChapter >= chapters.length}
        >
          <Text style={[styles.navButtonText, currentChapter >= chapters.length && styles.navButtonTextDisabled]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ad between chapters */}
      {isAuthenticated && !user?.isPro && currentChapter > 1 && (
        <View style={styles.adBanner}>
          <Text style={styles.adText}>📢 Chapter Advertisement</Text>
        </View>
      )}

      {/* Chapter Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {chapterLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading chapter...</Text>
          </View>
        ) : chapter ? (
          <View style={styles.chapterContent}>
            <Text style={styles.chapterTitle}>
              {chapter.chapterTitle}
            </Text>
            
            <View style={styles.chapterMeta}>
              <Text style={styles.chapterMetaText}>
                Chapter {chapter.chapterNumber}
              </Text>
              <Text style={styles.chapterMetaText}>•</Text>
              <Text style={styles.chapterMetaText}>
                {chapter.readTime} min read
              </Text>
              {chapter.chapterType === 'text' && (
                <>
                  <Text style={styles.chapterMetaText}>•</Text>
                  <Text style={styles.chapterMetaText}>
                    {chapter.wordCount} words
                  </Text>
                </>
              )}
            </View>

            {chapter.chapterType === 'text' ? (
              <Text style={styles.textContent}>
                {chapter.textContent}
              </Text>
            ) : (
              <View style={styles.galleryContent}>
                {chapter.imageURLs?.map((imageUrl, index) => (
                  <Image
                    key={index}
                    source={{ uri: imageUrl }}
                    style={styles.galleryImage}
                    resizeMode="contain"
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Chapter not found</Text>
            <Text style={styles.errorSubtitle}>
              This chapter doesn't exist or hasn't been published yet.
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Back to Content</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.bottomNavButton, currentChapter <= 1 && styles.bottomNavButtonDisabled]}
          onPress={() => handleChapterChange('prev')}
          disabled={currentChapter <= 1}
        >
          <Text style={[styles.bottomNavButtonText, currentChapter <= 1 && styles.bottomNavButtonTextDisabled]}>
            ← Previous
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.bottomNavInfo}>
          {currentChapter} of {chapters.length}
        </Text>
        
        <TouchableOpacity
          style={[styles.bottomNavButton, currentChapter >= chapters.length && styles.bottomNavButtonDisabled]}
          onPress={() => handleChapterChange('next')}
          disabled={currentChapter >= chapters.length}
        >
          <Text style={[styles.bottomNavButtonText, currentChapter >= chapters.length && styles.bottomNavButtonTextDisabled]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
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
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    marginRight: 12,
  },
  headerButtonText: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  actionButtonText: {
    fontSize: 16,
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
  chapterNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  navButtonDisabled: {
    backgroundColor: '#f9fafb',
  },
  navButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: '#9ca3af',
  },
  chapterInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  chapterContent: {
    padding: 16,
  },
  chapterTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  chapterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  chapterMetaText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
  },
  galleryContent: {
    gap: 16,
  },
  galleryImage: {
    width: '100%',
    height: height * 0.6,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bottomNavButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  bottomNavButtonDisabled: {
    backgroundColor: '#f9fafb',
  },
  bottomNavButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  bottomNavButtonTextDisabled: {
    color: '#9ca3af',
  },
  bottomNavInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default ContentReaderScreen;