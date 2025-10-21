import React from 'react';
import { Link } from 'react-router-dom';

const ContentCard = ({ item, isPro, onToggleList, onDownload }) => {
  const { _id, coverImageURL, title, authorId, averageRating, monetizationType, price, hasPurchased } = item;
  const primaryAction = () => {
    if (monetizationType === 'free_ad_share') return { label: 'Read', to: `/read/${_id}` };
    if (monetizationType === 'premium_to_buy') {
      if (hasPurchased) return { label: 'Read', to: `/read/${_id}` };
      return { label: `Buy for $${Number(price).toFixed(2)}`, to: `/read/${_id}` };
    }
    return { label: 'Read', to: `/read/${_id}` };
  };
  const action = primaryAction();

  return (
    <div className="bg-white rounded shadow p-3 flex flex-col">
      <img src={coverImageURL || '/placeholder.png'} alt={title} className="w-full h-48 object-cover rounded" />
      <div className="mt-2 flex-1">
        <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-500">by {authorId?.username || 'Unknown'}</p>
        <p className="text-yellow-600 text-sm">★ {averageRating?.toFixed?.(1) || '0.0'}</p>
      </div>
      <div className="flex items-center justify-between mt-2">
        <button onClick={onToggleList} className="text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Add to List</button>
        {isPro && (
          <button onClick={onDownload} className="text-sm px-2 py-1 rounded bg-green-100 hover:bg-green-200">Download</button>
        )}
      </div>
      <Link to={action.to} className="mt-2 w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
        {action.label}
      </Link>
    </div>
  );
};

export default ContentCard;
