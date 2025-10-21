import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Games from './pages/Games';
import Calendar from './pages/Calendar';
import EventPlanner from './pages/EventPlanner';
import Diary from './pages/Diary';
import AI from './pages/AI';
import AdManager from './components/AdManager';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div>Loading app...</div>; // Or a spinner component
  }

  const isPro = user?.subscription === 'active'; // Assuming user object from token might have subscription info

  return (
      <div className="flex h-screen">
        <div className="flex flex-col flex-1">
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/home" element={<Home />} />
                <Route path="/games" element={<Games />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/event-planner" element={<EventPlanner />} />
                <Route path="/diary" element={<Diary />} />
                <Route path="/ai" element={<AI />} />
              </Route>
            </Routes>
          </main>
        </div>
        {isAuthenticated && !isPro && <AdManager />}
      </div>
  );
};

export default App;