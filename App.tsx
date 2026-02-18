import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import Prospecting from './components/Prospecting';
import ProspectDetail from './components/ProspectDetail';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Routes>
        <Route path="/" element={<LandingPage onNavigateToAuth={(mode) => navigate(`/${mode}`)} theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="/signup" element={<AuthPage mode="signup" onAuthSuccess={() => navigate('/dashboard')} onBack={() => navigate('/')} theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="/login" element={<AuthPage mode="login" onAuthSuccess={() => navigate('/dashboard')} onBack={() => navigate('/')} theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="/dashboard" element={<Dashboard ownerInfo={{name: 'User', role: 'Owner', email: 'user@example.com', bio: ''}} businessInfo={{name: 'GoogleHubs', industry: 'Technology', mission: '', website: '', size: 'Startup'}} boards={[]} onSelectPage={() => {}} onSelectBoard={() => {}} />} />
        <Route path="/prospecting" element={<Prospecting />} />
        <Route path="/prospects/:prospectId" element={<ProspectDetail />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>
    </div>
  );
};

export default App;
