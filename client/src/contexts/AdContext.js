import React, { createContext, useContext, useState, useEffect } from 'react';
import { adAPI } from '../services/api';
import { useAuth } from './AuthContext';

const AdContext = createContext();

export const AdProvider = ({ children }) => {
  const [adConfig, setAdConfig] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const checkAdPlacement = async (type, contentId, chapterNumber) => {
    try {
      const response = await adAPI.getPlacement({
        type,
        contentId,
        chapterNumber
      });
      
      const { showAd: shouldShow, adType, adConfig: config } = response.data;
      
      setShowAd(shouldShow);
      setAdConfig(config);
      
      return { shouldShow, adType, config };
    } catch (error) {
      console.error('Error checking ad placement:', error);
      return { shouldShow: false, adType: null, config: null };
    }
  };

  const logAdView = async (contentId, adType, adId, adRevenueAmount, chapterNumber) => {
    if (!isAuthenticated || !user) return;

    try {
      await adAPI.logView({
        contentId,
        adType,
        adId,
        adRevenueAmount,
        chapterNumber,
        pageUrl: window.location.href
      });
    } catch (error) {
      console.error('Error logging ad view:', error);
    }
  };

  const shouldShowAd = (type, contentId, chapterNumber) => {
    // Pro users never see ads
    if (user && user.isPro) {
      return false;
    }

    // For content open ads, always show (unless pro)
    if (type === 'content_open') {
      return true;
    }

    // For per-chapter ads, only show after first chapter
    if (type === 'per_chapter') {
      return chapterNumber && parseInt(chapterNumber) > 1;
    }

    // For banner ads, always show (unless pro)
    if (type === 'banner') {
      return true;
    }

    return false;
  };

  const getAdComponent = (type, contentId, chapterNumber) => {
    if (!shouldShowAd(type, contentId, chapterNumber)) {
      return null;
    }

    return (
      <div className="ad-placeholder">
        <div>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>📢</div>
          <div>Advertisement</div>
          <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {type === 'content_open' && 'Content Open Ad'}
            {type === 'per_chapter' && 'Chapter Ad'}
            {type === 'banner' && 'Banner Ad'}
          </div>
        </div>
      </div>
    );
  };

  const value = {
    adConfig,
    showAd,
    checkAdPlacement,
    logAdView,
    shouldShowAd,
    getAdComponent
  };

  return (
    <AdContext.Provider value={value}>
      {children}
    </AdContext.Provider>
  );
};

export const useAd = () => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAd must be used within an AdProvider');
  }
  return context;
};