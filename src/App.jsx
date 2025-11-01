import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import Dashboard from '@/pages/Dashboard';
import CVEditor from '@/pages/CVEditor';
import CVPreview from '@/pages/CVPreview';
import RecommendationsPage from '@/pages/RecommendationsPage';
import AIOptimizer from '@/pages/AIOptimizer';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('cv_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('cv_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cv_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>CV Generator Pro - Créez des CV Modernes et Professionnels</title>
        <meta name="description" content="Plateforme intelligente de génération de CV avec IA intégrée. Créez plusieurs versions de votre CV, générez des versions anonymes, et optimisez pour chaque offre d'emploi." />
      </Helmet>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage user={user} />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <RegisterPage onLogin={handleLogin} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/cv/new" 
            element={user ? <CVEditor user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/cv/edit/:id" 
            element={user ? <CVEditor user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/cv/preview/:id" 
            element={user ? <CVPreview user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/recommendations" 
            element={user ? <RecommendationsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/ai-optimizer/:id" 
            element={user ? <AIOptimizer user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
        </Routes>
        <Toaster />
      </Router>
    </>
  );
}

export default App;