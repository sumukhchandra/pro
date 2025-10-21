import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { contentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useAd } from '../contexts/AdContext';
import ContentCard from '../components/ContentCard';
import toast from 'react-hot-toast';

const Comics = () => {
  const { user, isAuthenticated } = useAuth();
  const { getAdComponent } = useAd();
  const [filters, setFilters] = useState({
    sort: 'newest',
    search: '',
    page: 1
  });
  const [myList, setMyList] = useState(new Set());

  const { data, isLoading, error } = useQuery(
    ['comics', filters],
    () => contentAPI.getContent({
      type: 'comic',
      sort: filters.sort,
      search: filters.search,
      page: filters.page,
      limit: 20
    }),
    { 
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000 // 2 minutes
    }
  );

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

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: e.target.search.value, page: 1 }));
  };

  const handleSortChange = (sort) => {
    setFilters(prev => ({ ...prev, sort, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error loading comics</h2>
          <p className="text-gray-600 mb-4">Something went wrong while loading the comics.</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Comics</h1>
          <p className="text-gray-600">Discover amazing comics from talented creators</p>
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

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                name="search"
                placeholder="Search comics..."
                className="form-input"
                defaultValue={filters.search}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filters.sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="form-input"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-64 rounded-lg mb-3"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : data?.content?.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={!data.pagination.hasPrev}
                  className="btn btn-outline btn-sm"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, data.pagination.totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`btn btn-sm ${
                          page === filters.page ? 'btn-primary' : 'btn-outline'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!data.pagination.hasNext}
                  className="btn btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No comics found</h2>
            <p className="text-gray-600 mb-6">
              {filters.search 
                ? `No comics match your search for "${filters.search}"`
                : 'No comics have been published yet'
              }
            </p>
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '', page: 1 }))}
                className="btn btn-primary"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comics;