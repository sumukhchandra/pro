import React, { useState, useEffect } from 'react';

const AdManager = () => {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowAd(true);
    }, 300000); // 5 minutes

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleCloseAd = () => {
    setShowAd(false);
  };

  if (!showAd) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Advertisement</h2>
        <p>This is a dummy ad.</p>
        <button
          className="mt-4 px-4 py-2 rounded bg-blue-500 text-white"
          onClick={handleCloseAd}
        >
          Close Ad
        </button>
      </div>
    </div>
  );
};

export default AdManager;