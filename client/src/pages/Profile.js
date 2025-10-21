import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { userAPI, paymentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      bio: user?.bio || ''
    }
  });

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

  // Fetch subscription prices
  const { data: prices, isLoading: pricesLoading } = useQuery(
    'prices',
    () => paymentAPI.getPrices(),
    { enabled: !!user && !user.isPro }
  );

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        username: user.username || '',
        bio: user.bio || ''
      });
    }
  }, [user, reset]);

  const onSubmitProfile = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      setActiveTab('profile');
    }
  };

  const onSubmitPassword = async (data) => {
    const result = await changePassword(data.currentPassword, data.newPassword);
    if (result.success) {
      setShowPasswordForm(false);
    }
  };

  const handleUpgradeToPro = async () => {
    // This would integrate with Stripe
    toast.success('Redirecting to upgrade page...');
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
        <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
          <div>
            <label className="form-label">Username</label>
            <input
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters'
                },
                maxLength: {
                  value: 30,
                  message: 'Username must be less than 30 characters'
                }
              })}
              type="text"
              className={`form-input ${errors.username ? 'border-red-500' : ''}`}
            />
            {errors.username && (
              <p className="form-error">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="form-input bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="form-label">Bio</label>
            <textarea
              {...register('bio', {
                maxLength: {
                  value: 500,
                  message: 'Bio must be less than 500 characters'
                }
              })}
              className={`form-input form-textarea ${errors.bio ? 'border-red-500' : ''}`}
              rows={4}
            />
            {errors.bio && (
              <p className="form-error">{errors.bio.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button type="submit" className="btn btn-primary">
              Update Profile
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="btn btn-outline"
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
            <div>
              <label className="form-label">Current Password</label>
              <input
                {...register('currentPassword', {
                  required: 'Current password is required'
                })}
                type="password"
                className={`form-input ${errors.currentPassword ? 'border-red-500' : ''}`}
              />
              {errors.currentPassword && (
                <p className="form-error">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">New Password</label>
              <input
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type="password"
                className={`form-input ${errors.newPassword ? 'border-red-500' : ''}`}
              />
              {errors.newPassword && (
                <p className="form-error">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Confirm New Password</label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === document.querySelector('input[name="newPassword"]').value || 'Passwords do not match'
                })}
                type="password"
                className={`form-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>

      {!user?.isPro && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-sm p-6 text-white">
          <h3 className="text-lg font-medium mb-2">Upgrade to Pro</h3>
          <p className="text-purple-100 mb-4">
            Get ad-free experience, offline downloads, and premium content creation features.
          </p>
          <button
            onClick={handleUpgradeToPro}
            className="btn bg-white text-purple-600 hover:bg-gray-100"
          >
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );

  const renderMyList = () => (
    <div className="space-y-6">
      {listLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 h-64 rounded-lg mb-3"></div>
              <div className="bg-gray-300 h-4 rounded mb-2"></div>
              <div className="bg-gray-300 h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : myList?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {myList.map((content) => (
            <div key={content._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={content.coverImageURL}
                alt={content.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{content.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  by {content.authorId?.username}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {content.averageRating.toFixed(1)} ⭐
                  </span>
                  <button className="btn btn-primary btn-sm">
                    Read
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your list is empty</h3>
          <p className="text-gray-600 mb-4">Start adding content to your list!</p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
          >
            Browse Content
          </button>
        </div>
      )}
    </div>
  );

  const renderDownloads = () => (
    <div className="space-y-6">
      {!user?.isPro ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pro Feature</h3>
          <p className="text-gray-600 mb-4">Download content for offline reading with Pro subscription.</p>
          <button
            onClick={handleUpgradeToPro}
            className="btn btn-primary"
          >
            Upgrade to Pro
          </button>
        </div>
      ) : downloadsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 h-64 rounded-lg mb-3"></div>
              <div className="bg-gray-300 h-4 rounded mb-2"></div>
              <div className="bg-gray-300 h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : downloads?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {downloads.map((content) => (
            <div key={content._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={content.coverImageURL}
                alt={content.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{content.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  by {content.authorId?.username}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Downloaded
                  </span>
                  <button className="btn btn-primary btn-sm">
                    Read Offline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No downloads yet</h3>
          <p className="text-gray-600 mb-4">Download content for offline reading!</p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
          >
            Browse Content
          </button>
        </div>
      )}
    </div>
  );

  const renderEarnings = () => (
    <div className="space-y-6">
      {earningsLoading ? (
        <div className="space-y-4">
          <div className="bg-gray-300 h-32 rounded-lg animate-pulse"></div>
          <div className="bg-gray-300 h-24 rounded-lg animate-pulse"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Earnings Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  ${earnings?.totalEarnings?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-gray-600">Total Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {earnings?.totalViews || 0}
                </div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  ${earnings?.currentBalance?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-gray-600">Current Balance</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Earnings by Content</h3>
            {earnings?.earningsByContent?.length > 0 ? (
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
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.username}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-medium text-gray-600">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user?.username}</h1>
              <p className="text-gray-600">{user?.email}</p>
              {user?.isPro && (
                <span className="pro-badge mt-2">Pro Member</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('my-list')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My List
              </button>
              {user?.isPro && (
                <button
                  onClick={() => setActiveTab('downloads')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'downloads'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Downloads
                </button>
              )}
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
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'my-list' && renderMyList()}
        {activeTab === 'downloads' && renderDownloads()}
        {activeTab === 'earnings' && renderEarnings()}
      </div>
    </div>
  );
};

export default Profile;