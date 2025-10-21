import React from 'react';
import TopBar from './TopBar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      <main className="p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
