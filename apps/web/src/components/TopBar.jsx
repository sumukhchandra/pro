import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TopBar = () => {
  const { logout, user } = useAuth();

  return (
    <nav className="bg-white shadow-md text-gray-800 p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/home" className="text-2xl font-bold text-gray-800">Everbloom</Link>
      </div>
      <ul className="flex space-x-6 items-center">
        <li><Link to="/" className="hover:text-gray-500">Home</Link></li>
        <li><Link to="/novels" className="hover:text-gray-500">Novels</Link></li>
        <li><Link to="/ebooks" className="hover:text-gray-500">E-books</Link></li>
        <li><Link to="/comics" className="hover:text-gray-500">Comics</Link></li>
        <li><Link to="/mangas" className="hover:text-gray-500">Mangas</Link></li>
        <li><Link to="/community" className="hover:text-gray-500">Writers Community</Link></li>
        <li><Link to="/studio" className="hover:text-gray-500">Creator Studio</Link></li>
      </ul>
      <div className="flex items-center space-x-4">
        {user?.userRole !== 'pro' ? (
          <Link to="/upgrade" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-full">
            Upgrade to Pro
          </Link>
        ) : (
          <Link to="/downloads" className="bg-gray-800 hover:bg-black text-white font-bold py-2 px-4 rounded-full">
            My Downloads
          </Link>
        )}
        <button
          onClick={logout}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default TopBar;