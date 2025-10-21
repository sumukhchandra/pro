import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdProvider } from './contexts/AdContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Novels from './pages/Novels';
import Ebooks from './pages/Ebooks';
import Comics from './pages/Comics';
import Mangas from './pages/Mangas';
import ContentReader from './pages/ContentReader';
import CreatorStudio from './pages/CreatorStudio';
import Community from './pages/Community';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <AdProvider>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/novels" element={<Novels />} />
              <Route path="/ebooks" element={<Ebooks />} />
              <Route path="/comics" element={<Comics />} />
              <Route path="/mangas" element={<Mangas />} />
              <Route path="/content/:id" element={<ContentReader />} />
              <Route path="/content/:id/chapter/:chapterNumber" element={<ContentReader />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/studio" element={
                <ProtectedRoute>
                  <CreatorStudio />
                </ProtectedRoute>
              } />
              <Route path="/community" element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </AdProvider>
    </AuthProvider>
  );
}

export default App;