import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api'; // Change this to your server URL

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Content API
export const contentAPI = {
  getContent: (params) => api.get('/content', { params }),
  getContentById: (id) => api.get(`/content/${id}`),
  getChapters: (id) => api.get(`/content/${id}/chapters`),
  getChapter: (id, chapterNumber) => api.get(`/content/${id}/chapters/${chapterNumber}`),
  createContent: (data) => api.post('/content', data),
  updateContent: (id, data) => api.put(`/content/${id}`, data),
  deleteContent: (id) => api.delete(`/content/${id}`),
  rateContent: (id, data) => api.post(`/content/${id}/rate`, data),
  addToList: (id) => api.post(`/content/${id}/add-to-list`),
  removeFromList: (id) => api.delete(`/content/${id}/remove-from-list`),
};

// User API
export const userAPI = {
  getMyContent: () => api.get('/user/my-content'),
  getMyList: () => api.get('/user/my-list'),
  getEarnings: () => api.get('/user/earnings'),
  getDownloads: () => api.get('/user/downloads'),
  downloadContent: (contentId) => api.post(`/user/download/${contentId}`),
  getStats: () => api.get('/user/stats'),
  withdrawEarnings: (data) => api.post('/user/withdraw-earnings', data),
};

// Community API
export const communityAPI = {
  getChannels: () => api.get('/community/channels'),
  createChannel: (data) => api.post('/community/channels', data),
  getChannel: (id) => api.get(`/community/channels/${id}`),
  joinChannel: (id) => api.post(`/community/channels/${id}/join`),
  leaveChannel: (id) => api.post(`/community/channels/${id}/leave`),
  getChannelMessages: (id, params) => api.get(`/community/channels/${id}/messages`, { params }),
  sendChannelMessage: (id, data) => api.post(`/community/channels/${id}/messages`, data),
  getConversations: () => api.get('/community/conversations'),
  createConversation: (data) => api.post('/community/conversations', data),
  getConversationMessages: (id, params) => api.get(`/community/conversations/${id}/messages`, { params }),
  sendConversationMessage: (id, data) => api.post(`/community/conversations/${id}/messages`, data),
};

// Payment API
export const paymentAPI = {
  getPrices: () => api.get('/payment/prices'),
  createSubscription: (data) => api.post('/payment/create-subscription', data),
  cancelSubscription: () => api.post('/payment/cancel-subscription'),
  purchaseContent: (data) => api.post('/payment/purchase-content', data),
  getSetupIntent: () => api.get('/payment/setup-intent'),
  getPaymentMethods: () => api.get('/payment/payment-methods'),
};

// Ad API
export const adAPI = {
  getPlacement: (params) => api.get('/ads/placement', { params }),
  logView: (data) => api.post('/ads/log-view', data),
  getStats: (params) => api.get('/ads/stats', { params }),
  getRevenueBreakdown: (params) => api.get('/ads/revenue-breakdown', { params }),
};

export default api;