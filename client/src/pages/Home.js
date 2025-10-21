import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { contentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useAd } from '../contexts/AdContext';
import ContentCard from '../components/ContentCard';
import toast from 'react-hot-toast';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { getAdComponent } = useAd();
  const [myList, setMyList] = useState(new Set());

  // Fetch top content for each category
  const { data: novelsData, isLoading: novelsLoading } = useQuery(
    'top-novels',
    () => contentAPI.getContent({ type: 'novel', sort: 'popular', limit: 10 }),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  const { data: ebooksData, isLoading: ebooksLoading } = useQuery(
    'top-ebooks',
    () => contentAPI.getContent({ type: 'ebook', sort: 'popular', limit: 10 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: comicsData, isLoading: comicsLoading } = useQuery(
    'top-comics',
    () => contentAPI.getContent({ type: 'comic', sort: 'popular', limit: 10 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: mangasData, isLoading: mangasLoading } = useQuery(
    'top-mangas',
    () => contentAPI.getContent({ type: 'manga', sort: 'popular', limit: 10 }),
    { staleTime: 5 * 60 * 1000 }
  );

  // Load user's list on mount
  useEffect(() => {
    if (isAuthenticated && user?.myList) {
      setMyList(new Set(user.myList));
    }
  }, [isAuthenticated, user?.myList]);

  const handleAddToList = async (contentId) => {
    if (!isAuthenticated) {
      toast.error('Please login to add content to your list');
      return;
    }

    try {
      await contentAPI.addToList(contentId);
      setMyList(prev => new Set([...prev, contentId]));
      toast.success('Added to your list');
    } catch (error) {
      toast.error('Failed to add to list');
    }
  };

  const handleRemoveFromList = async (contentId) => {
    try {
      await contentAPI.removeFromList(contentId);
      setMyList(prev => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
      });
      toast.success('Removed from your list');
    } catch (error) {
      toast.error('Failed to remove from list');
    }
  };

  const renderContentSection = (title, data, isLoading) => {
    if (isLoading) {
      return (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-2"></div>
                <div className="bg-gray-300 h-4 rounded mb-1"></div>
                <div className="bg-gray-300 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!data?.content?.length) {
      return null;
    }

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.content.map((content) => (
            <ContentCard
              key={content._id}
              content={{
                ...content,
                isAccessible: content.isAccessible,
                isInMyList: myList.has(content._id)
              }}
              onAddToList={handleAddToList}
              onRemoveFromList={handleRemoveFromList}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Amazing Content
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Read novels, comics, manga, and e-books. Create and share your own stories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-white btn-lg">
              Start Reading
            </button>
            {!isAuthenticated && (
              <button className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-blue-600">
                Join Community
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ad Banner for Standard Users */}
      {isAuthenticated && !user?.isPro && (
        <div className="bg-yellow-50 border-b border-yellow-200 py-4">
          <div className="container mx-auto px-4">
            {getAdComponent('banner')}
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-8">
        {renderContentSection(
          'Top 10 Novels of the Week',
          novelsData,
          novelsLoading
        )}
        
        {renderContentSection(
          'Top 10 E-books of the Week',
          ebooksData,
          ebooksLoading
        )}
        
        {renderContentSection(
          'Top 10 Comics of the Week',
          comicsData,
          comicsLoading
        )}
        
        {renderContentSection(
          'Top 10 Mangas of the Week',
          mangasData,
          mangasLoading
        )}

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mt-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of creators sharing their stories and earning from their content.
          </p>
          {isAuthenticated ? (
            <a href="/studio" className="btn btn-primary btn-lg">
              Go to Creator Studio
            </a>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/register" className="btn btn-primary btn-lg">
                Sign Up Now
              </a>
              <a href="/login" className="btn btn-outline btn-lg">
                Login
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;