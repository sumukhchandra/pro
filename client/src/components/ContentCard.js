import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAd } from '../contexts/AdContext';

const ContentCard = ({ content, onAddToList, onRemoveFromList }) => {
  const { user, isAuthenticated } = useAuth();
  const { getAdComponent } = useAd();

  const isInMyList = user?.myList?.includes(content._id) || false;
  const isAccessible = content.isAccessible || false;
  const isPurchased = user?.purchasedContent?.includes(content._id) || false;

  const handleAddToList = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInMyList) {
      onRemoveFromList(content._id);
    } else {
      onAddToList(content._id);
    }
  };

  const getActionButton = () => {
    if (content.monetizationType === 'free_ad_share') {
      return (
        <Link
          to={`/content/${content._id}`}
          className="btn btn-primary btn-sm flex-1"
        >
          Read
        </Link>
      );
    }

    if (content.monetizationType === 'premium_to_buy') {
      if (isPurchased || isAccessible) {
        return (
          <Link
            to={`/content/${content._id}`}
            className="btn btn-primary btn-sm flex-1"
          >
            Read
          </Link>
        );
      } else {
        return (
          <button className="btn btn-secondary btn-sm flex-1">
            Buy for ${content.price}
          </button>
        );
      }
    }

    return null;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star">☆</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star text-gray-300">★</span>);
    }

    return stars;
  };

  return (
    <div className="content-card card">
      <Link to={`/content/${content._id}`} className="block">
        <img
          src={content.coverImageURL}
          alt={content.title}
          className="content-card-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
      </Link>
      
      <div className="content-card-body">
        <Link to={`/content/${content._id}`} className="block">
          <h3 className="content-card-title">{content.title}</h3>
        </Link>
        
        <p className="content-card-author">
          by {content.authorId?.username || 'Unknown Author'}
        </p>
        
        <div className="content-card-rating">
          {renderStars(content.averageRating)}
          <span className="text-sm text-gray-500 ml-1">
            ({content.ratingCount})
          </span>
        </div>

        <div className="content-card-actions">
          {getActionButton()}
          
          <button
            onClick={handleAddToList}
            className={`btn btn-outline btn-sm ${
              isInMyList ? 'bg-blue-50 text-blue-600' : ''
            }`}
            title={isInMyList ? 'Remove from list' : 'Add to list'}
          >
            {isInMyList ? '✓' : '+'}
          </button>
        </div>

        {/* Download button for Pro users */}
        {user?.isPro && (
          <div className="mt-2">
            <button className="btn btn-outline btn-sm w-full">
              📱 Download
            </button>
          </div>
        )}

        {/* Monetization badge */}
        <div className="mt-2 flex justify-between items-center">
          <span className={`text-xs px-2 py-1 rounded ${
            content.monetizationType === 'free_ad_share'
              ? 'bg-green-100 text-green-800'
              : 'bg-purple-100 text-purple-800'
          }`}>
            {content.monetizationType === 'free_ad_share' ? 'Free' : `$${content.price}`}
          </span>
          
          <span className="text-xs text-gray-500">
            {content.contentType}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;