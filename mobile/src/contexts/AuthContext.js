import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import Toast from 'react-native-toast-message';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await authAPI.getMe();
          dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
        } else {
          dispatch({ type: 'AUTH_FAILURE', payload: null });
        }
      } catch (error) {
        await AsyncStorage.removeItem('token');
        dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('token', token);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      Toast.show({
        type: 'success',
        text1: 'Login successful!'
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      Toast.show({
        type: 'error',
        text1: message
      });
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.register({ username, email, password });
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('token', token);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      Toast.show({
        type: 'success',
        text1: 'Registration successful!'
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      Toast.show({
        type: 'error',
        text1: message
      });
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    dispatch({ type: 'AUTH_LOGOUT' });
    Toast.show({
      type: 'success',
      text1: 'Logged out successfully'
    });
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      dispatch({ type: 'UPDATE_USER', payload: response.data.user });
      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully!'
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      Toast.show({
        type: 'error',
        text1: message
      });
      return { success: false, error: message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};