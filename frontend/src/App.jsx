import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/SideBar';
import SearchPage from './pages/SearchPage';
import UploadPage from './pages/UploadPage';
import CollectionView from './pages/CollectionView';
import RecordDetail from './pages/RecordDetail';
import Login from './pages/LoginPage';
import Register from './pages/Register';
import Contact from './pages/Contact';
import AdminPanel from './pages/AdminPanel';
import EditPage from './pages/EditPage';
import About from './pages/About';
import HistoricEventsPage from './pages/HistoricEventsPage';
import BusinessesPage from './pages/BusinessesPage';
import GenealogistDashboard from './pages/GenealogistDashboard';

const API = 'https://honduras-archive-v3.onrender.com/api/archive';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  // ── Reusable stats refresh — called on load AND after every upload ──────────
  const refreshStats = useCallback(async () => {
    try {
      const response = await axios.get(API);
      setTotalCount(response.data.totalCount || 0);
      setLastUpdate(response.data.lastUpdate || null);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); }
      catch { localStorage.removeItem('user'); }
    }
    refreshStats().finally(() => setLoading(false));
  }, [refreshStats]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.token) localStorage.setItem('token', userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('sessionStart');
    localStorage.removeItem('sessionIndex');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#EAF0F7' }}>
        <p style={{ fontSize: '1.2rem', color: '#0F3460', fontWeight: 'bold' }}>Downloading Archive...</p>
      </div>
    );
  }

  const isAdmin = user && user.role === 'admin';
  const isGenealogist = user && user.role === 'genealogist';

  return (
    <Router>
      <div style={{ display: 'flex', backgroundColor: '#EAF0F7', minHeight: '100vh' }}>
        <Sidebar user={user} onLogout={handleLogout} totalCount={totalCount} lastUpdate={lastUpdate} />

        <main style={{ marginLeft: '260px', flex: 1, padding: '20px', width: 'calc(100% - 260px)', boxSizing: 'border-box' }}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<SearchPage />} />
            <Route path="/record/:id" element={<RecordDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />

            {/* Auth */}
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />

            {/* Admin — pass refreshStats so sidebar count updates after upload */}
            <Route path="/upload" element={isAdmin ? <UploadPage onRecordSaved={refreshStats} /> : <Navigate to="/login" replace />} />
        
            <Route path="/admin" element={isAdmin ? <AdminPanel /> : <Navigate to="/login" state={{ from: '/admin' }} replace />} />
            <Route path="/edit/:id" element={isAdmin || loading ? <EditPage /> : <Navigate to="/login" replace />} />

            {/* Genealogist */}
            <Route path="/dashboard" element={isGenealogist ? <GenealogistDashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />} />

            {/* Collections */}
            <Route path="/category/:value" element={<CollectionView type="category" />} />
            <Route path="/alpha/:value" element={<CollectionView type="letter" />} />
            <Route path="/historic-events" element={<HistoricEventsPage />} />
            <Route path="/businesses" element={<BusinessesPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;