import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

const AdManager = () => {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    const timer = setInterval(async () => {
      setShowAd(true);
      try { await apiFetch('/api/ads/log', { method: 'POST', body: { adPlacement: 'onPageLoad' } }); } catch {}
      setTimeout(() => setShowAd(false), 1500);
    }, 300000); // 5 minutes

    return () => {
      clearInterval(timer);
    };
  }, []);

  if (!showAd) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Advertisement</h2>
        <p>This is a dummy ad.</p>
      </div>
    </div>
  );
};

export default AdManager;