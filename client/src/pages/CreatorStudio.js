import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { contentAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const CreatorStudio = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedContent, setSelectedContent] = useState(null);

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
    setActiveTab('create');
    setSelectedContent(null);
  };

  const handleEditContent = (content) => {
    setSelectedContent(content);
    setActiveTab('create');
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.contentStats?.totalContent || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">👀</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.contentStats?.totalViews || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.contentStats?.averageRating?.toFixed(1) || '0.0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats?.userStats?.adShareBalance?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">My Content</h3>
            <button
              onClick={handleCreateContent}
              className="btn btn-primary btn-sm"
            >
              Create New
            </button>
          </div>
        </div>
        <div className="p-6">
          {contentLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-300 h-3 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : myContent?.length > 0 ? (
            <div className="space-y-4">
              {myContent.map((content) => (
                <div key={content._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={content.coverImageURL}
                      alt={content.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{content.title}</h4>
                      <p className="text-sm text-gray-600">
                        {content.contentType} • {content.status} • {content.totalViewCount} views
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">
                          {content.averageRating.toFixed(1)} ⭐ ({content.ratingCount})
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          content.monetizationType === 'free_ad_share'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {content.monetizationType === 'free_ad_share' ? 'Free' : `$${content.price}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditContent(content)}
                      className="btn btn-outline btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => window.open(`/content/${content._id}`, '_blank')}
                      className="btn btn-primary btn-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
              <p className="text-gray-600 mb-4">Start creating your first piece of content!</p>
              <button
                onClick={handleCreateContent}
                className="btn btn-primary"
              >
                Create Your First Content
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEarnings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Earnings Overview</h3>
        {earningsLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="bg-gray-300 h-8 rounded w-1/2"></div>
            <div className="bg-gray-300 h-4 rounded w-3/4"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                ${earnings?.totalEarnings?.toFixed(2) || '0.00'}
              </span>
              <span className="text-sm text-gray-600">
                {earnings?.totalViews || 0} total views
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Current Balance: ${earnings?.currentBalance?.toFixed(2) || '0.00'}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Earnings by Content</h3>
        {earningsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-300 h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : earnings?.earningsByContent?.length > 0 ? (
          <div className="space-y-4">
            {earnings.earningsByContent.map((item) => (
              <div key={item.contentId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.coverImageURL}
                    alt={item.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">
                      {item.totalViews} views • ${item.totalEarnings.toFixed(2)} earned
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    ${item.totalEarnings.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings yet</h3>
            <p className="text-gray-600">Start creating content to earn from ad revenue!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCreate = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        {selectedContent ? 'Edit Content' : 'Create New Content'}
      </h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Content Type</label>
            <select className="form-input" defaultValue="novel">
              <option value="novel">Novel</option>
              <option value="ebook">E-book</option>
              <option value="comic">Comic</option>
              <option value="manga">Manga</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Monetization</label>
            <select className="form-input" defaultValue="free_ad_share">
              <option value="free_ad_share">Free (Ad Revenue)</option>
              {user?.isPro && (
                <option value="premium_to_buy">Premium (Set Price)</option>
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter content title"
            defaultValue={selectedContent?.title || ''}
          />
        </div>

        <div>
          <label className="form-label">Description</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Enter content description"
            defaultValue={selectedContent?.description || ''}
          />
        </div>

        <div>
          <label className="form-label">Cover Image URL</label>
          <input
            type="url"
            className="form-input"
            placeholder="https://example.com/cover.jpg"
            defaultValue={selectedContent?.coverImageURL || ''}
          />
        </div>

        <div>
          <label className="form-label">Tags (comma separated)</label>
          <input
            type="text"
            className="form-input"
            placeholder="fantasy, adventure, romance"
            defaultValue={selectedContent?.tags?.join(', ') || ''}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button className="btn btn-primary">
            {selectedContent ? 'Update Content' : 'Create Content'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Creator Studio</h1>
          <p className="text-gray-600">Manage your content and track your earnings</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'earnings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Earnings
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Create Content
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'earnings' && renderEarnings()}
        {activeTab === 'create' && renderCreate()}
      </div>
    </div>
  );
};

export default CreatorStudio;