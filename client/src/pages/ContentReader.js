import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { contentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useAd } from '../contexts/AdContext';
import toast from 'react-hot-toast';

const ContentReader = () => {
  const { id, chapterNumber } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getAdComponent, logAdView } = useAd();
  const [currentChapter, setCurrentChapter] = useState(parseInt(chapterNumber) || 1);

  // Fetch content details
  const { data: contentData, isLoading: contentLoading } = useQuery(
    ['content', id],
    () => contentAPI.getContentById(id),
    { enabled: !!id }
  );

  // Fetch chapters
  const { data: chaptersData, isLoading: chaptersLoading } = useQuery(
    ['chapters', id],
    () => contentAPI.getChapters(id),
    { enabled: !!id }
  );

  // Fetch current chapter
  const { data: chapterData, isLoading: chapterLoading } = useQuery(
    ['chapter', id, currentChapter],
    () => contentAPI.getChapter(id, currentChapter),
    { enabled: !!id && !!currentChapter }
  );

  // Log ad view on content open
  useEffect(() => {
    if (contentData && !user?.isPro) {
      logAdView(id, 'content_open', `content_open_${id}_${Date.now()}`, 0.01);
    }
  }, [contentData, id, user?.isPro, logAdView]);

  // Log ad view on chapter change
  useEffect(() => {
    if (chapterData && currentChapter > 1 && !user?.isPro) {
      logAdView(id, 'per_chapter', `per_chapter_${id}_${currentChapter}_${Date.now()}`, 0.005, currentChapter);
    }
  }, [chapterData, currentChapter, id, user?.isPro, logAdView]);

  const handleChapterChange = (direction) => {
    if (!chaptersData?.length) return;

    const newChapter = direction === 'next' ? currentChapter + 1 : currentChapter - 1;
    const maxChapter = chaptersData.length;

    if (newChapter >= 1 && newChapter <= maxChapter) {
      setCurrentChapter(newChapter);
      navigate(`/content/${id}/chapter/${newChapter}`, { replace: true });
    }
  };

  const handleRating = async (rating) => {
    if (!isAuthenticated) {
      toast.error('Please login to rate content');
      return;
    }

    try {
      await contentAPI.rateContent(id, { ratingValue: rating });
      toast.success('Rating submitted successfully');
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  if (contentLoading || chaptersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!contentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Content not found</h2>
          <p className="text-gray-600 mb-4">The content you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const content = contentData;
  const chapters = chaptersData || [];
  const chapter = chapterData;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-outline btn-sm"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{content.title}</h1>
                <p className="text-sm text-gray-600">
                  by {content.authorId?.username} • Chapter {currentChapter} of {chapters.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleRating(5)}
                className="btn btn-outline btn-sm"
                title="Rate 5 stars"
              >
                ⭐
              </button>
              <button className="btn btn-outline btn-sm">
                📖
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ad for content open */}
      {!user?.isPro && (
        <div className="bg-yellow-50 border-b border-yellow-200 py-4">
          <div className="container mx-auto px-4">
            {getAdComponent('content_open', id)}
          </div>
        </div>
      )}

      {/* Chapter Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleChapterChange('prev')}
              disabled={currentChapter <= 1}
              className="btn btn-outline btn-sm"
            >
              ← Previous Chapter
            </button>
            
            <div className="flex items-center space-x-2">
              <select
                value={currentChapter}
                onChange={(e) => {
                  const newChapter = parseInt(e.target.value);
                  setCurrentChapter(newChapter);
                  navigate(`/content/${id}/chapter/${newChapter}`, { replace: true });
                }}
                className="form-input"
              >
                {chapters.map((_, index) => (
                  <option key={index + 1} value={index + 1}>
                    Chapter {index + 1}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => handleChapterChange('next')}
              disabled={currentChapter >= chapters.length}
              className="btn btn-outline btn-sm"
            >
              Next Chapter →
            </button>
          </div>
        </div>
      </div>

      {/* Ad between chapters */}
      {!user?.isPro && currentChapter > 1 && (
        <div className="bg-yellow-50 border-b border-yellow-200 py-4">
          <div className="container mx-auto px-4">
            {getAdComponent('per_chapter', id, currentChapter)}
          </div>
        </div>
      )}

      {/* Chapter Content */}
      <div className="container mx-auto px-4 py-8">
        {chapterLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : chapter ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {chapter.chapterTitle}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Chapter {chapter.chapterNumber}</span>
                <span>•</span>
                <span>{chapter.readTime} min read</span>
                {chapter.chapterType === 'text' && (
                  <>
                    <span>•</span>
                    <span>{chapter.wordCount} words</span>
                  </>
                )}
              </div>
            </div>

            {chapter.chapterType === 'text' ? (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: chapter.textContent }}
              />
            ) : (
              <div className="space-y-4">
                {chapter.imageURLs?.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`Page ${index + 1}`}
                    className="w-full h-auto rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chapter not found</h2>
            <p className="text-gray-600 mb-6">This chapter doesn't exist or hasn't been published yet.</p>
            <button onClick={() => navigate(`/content/${id}`)} className="btn btn-primary">
              Back to Content
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleChapterChange('prev')}
              disabled={currentChapter <= 1}
              className="btn btn-outline btn-sm"
            >
              ← Previous
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {currentChapter} of {chapters.length}
              </span>
            </div>
            
            <button
              onClick={() => handleChapterChange('next')}
              disabled={currentChapter >= chapters.length}
              className="btn btn-outline btn-sm"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentReader;