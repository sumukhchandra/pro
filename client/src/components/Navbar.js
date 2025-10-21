import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAd } from '../contexts/AdContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { getAdComponent } = useAd();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/novels', label: 'Novels' },
    { path: '/ebooks', label: 'E-books' },
    { path: '/comics', label: 'Comics' },
    { path: '/mangas', label: 'Mangas' },
    { path: '/community', label: 'Community' },
  ];

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Freemium</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Creator Studio Link */}
                  <Link
                    to="/studio"
                    className="btn btn-outline btn-sm"
                  >
                    Creator Studio
                  </Link>

                  {/* Pro Upgrade Button or Downloads */}
                  {user?.isPro ? (
                    <Link
                      to="/profile"
                      className="btn btn-primary btn-sm pro-badge"
                    >
                      Pro
                    </Link>
                  ) : (
                    <button className="btn btn-primary btn-sm">
                      Upgrade to Pro
                    </button>
                  )}

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        {user?.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {user?.username?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="hidden md:block text-sm font-medium">
                        {user?.username}
                      </span>
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/profile?tab=my-list"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          My List
                        </Link>
                        <Link
                          to="/profile?tab=earnings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Earnings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="btn btn-outline btn-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link
                    to="/studio"
                    className="nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Creator Studio
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Banner Ad for Standard Users */}
      {isAuthenticated && !user?.isPro && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-800">
                  Upgrade to Pro for an ad-free experience and offline downloads!
                </span>
              </div>
              <button className="btn btn-primary btn-sm">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;