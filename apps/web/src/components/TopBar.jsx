import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TopBar = () => {
  const { logout } = useAuth();

  return (
    <nav className="bg-white shadow-md text-gray-800 p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/home" className="text-2xl font-bold text-gray-800">Everbloom</Link>
      </div>
      <ul className="flex space-x-6 items-center">
        <li>
          <Link to="/home" className="hover:text-gray-500">Home</Link>
        </li>
        <li>
          <Link to="/games" className="hover:text-gray-500">Games</Link>
        </li>
        <li>
          <Link to="/calendar" className="hover:text-gray-500">Calendar</Link>
        </li>
        <li>
          <Link to="/event-planner" className="hover:text-gray-500">Event Planner</Link>
        </li>
        <li>
          <Link to="/diary" className="hover:text-gray-500">Diary</Link>
        </li>
        <li>
          <Link to="/ai" className="hover:text-gray-500">AI</Link>
        </li>
      </ul>
      <div className="flex items-center space-x-4">
        <Link to="/pro-version" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-full">
          Go Pro
        </Link>
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