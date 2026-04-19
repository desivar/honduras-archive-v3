import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import LanguageToggle from './LanguageToggle';

// ── Honduras National Pride Palette ──────────────────────────────────────────
// Deep blue:   #0F3460  (dark navy — flag blue)
// Mid blue:    #1A5276  (sidebar base)
// Light blue:  #2E86C1  (accents)
// White:       #F8FBFF  (text)
// Gold:        #D4AC0D  (highlights)
// Nature green:#2E7D32  (special links)
// Soft green:  #4CAF50  (hover states)

const Sidebar = ({ user, onLogout, totalCount, lastUpdate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (user && user.role === 'genealogist') {
      try {
        const token = localStorage.getItem('token');
        const sessionIndex = localStorage.getItem('sessionIndex');
        await axios.post('https://honduras-archive-v3.onrender.com/api/auth/logout',
          { sessionIndex: parseInt(sessionIndex) },
          { headers: { 'x-auth-token': token } }
        );
      } catch (err) {
        console.error('Logout tracking error:', err);
      }
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('sessionStart');
    localStorage.removeItem('sessionIndex');
    if (onLogout) onLogout();
    navigate('/');
  };

  const linkStyle = {
    color: '#F8FBFF',
    textDecoration: 'none',
    padding: '7px 8px',
    display: 'block',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    borderRadius: '4px',
  };

  const headerStyle = {
    fontSize: '0.72rem',
    color: '#D4AC0D',
    marginTop: '20px',
    marginBottom: '4px',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: '0.1em',
  };

  const specialLinkStyle = {
    ...linkStyle,
    backgroundColor: 'rgba(46,126,50,0.25)',
    borderRadius: '6px',
    padding: '8px 10px',
    marginTop: '4px',
    borderLeft: '3px solid #4CAF50',
    color: '#a8e6a3',
  };

  return (
    <div style={{
      width: '260px',
      background: 'linear-gradient(180deg, #0F3460 0%, #1A5276 60%, #0F3460 100%)',
      color: '#F8FBFF',
      height: '100vh',
      padding: '20px',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      boxSizing: 'border-box',
      boxShadow: '3px 0 16px rgba(0,0,0,0.3)',
      overflowY: 'auto',
    }}>

      {/* Title */}
      <h2 style={{
        fontFamily: 'serif',
        borderBottom: '2px solid #D4AC0D',
        paddingBottom: '10px',
        marginBottom: '10px',
        fontSize: '1.2rem',
        color: '#F8FBFF',
        letterSpacing: '0.02em',
      }}>
        {t('sidebar.title')}
      </h2>

      {/* Language toggle */}
      <div style={{ marginBottom: '15px' }}>
        <LanguageToggle />
      </div>

      {/* Stats */}
      <div style={{
        backgroundColor: 'rgba(212,172,13,0.15)',
        padding: '10px 12px',
        borderRadius: '6px',
        marginBottom: '20px',
        borderLeft: '4px solid #D4AC0D',
      }}>
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#F8FBFF' }}>
          <strong style={{ color: '#D4AC0D' }}>{t('sidebar.magnitude')}:</strong> {totalCount || 0} {t('sidebar.records')}
        </p>
        {lastUpdate && (
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#F8FBFF' }}>
            <strong style={{ color: '#D4AC0D' }}>{t('sidebar.lastUpdate')}:</strong> {new Date(lastUpdate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* User block */}
      {user ? (
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(212,172,13,0.3)',
        }}>
          <p style={{ margin: 0, fontSize: '0.75rem', marginBottom: '2px', color: '#D4AC0D', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('sidebar.loggedAs')}:
          </p>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', color: '#F8FBFF' }}>
            {user.username}
          </p>
          <p style={{ margin: '2px 0 10px', fontSize: '0.75rem', color: '#a8d4f5' }}>
            {user.role === 'genealogist' ? '🔬 Genealogist' : user.role === 'admin' ? '⚙️ Admin' : '👤 Visitor'}
          </p>

          {user.role === 'genealogist' && (
            <Link to="/dashboard" style={{
              display: 'block',
              backgroundColor: 'rgba(46,134,193,0.3)',
              color: '#F8FBFF',
              textAlign: 'center',
              padding: '7px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              marginBottom: '8px',
              border: '1px solid rgba(46,134,193,0.5)',
            }}>
              📊 My Dashboard
            </Link>
          )}

          {user.role === 'admin' && (
            <Link to="/admin" style={{
              display: 'block',
              backgroundColor: 'rgba(212,172,13,0.2)',
              color: '#D4AC0D',
              textAlign: 'center',
              padding: '7px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              marginBottom: '8px',
              border: '1px solid rgba(212,172,13,0.4)',
            }}>
              ⚙️ Admin Panel
            </Link>
          )}

          <button onClick={handleLogout} style={{
            width: '100%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#F8FBFF',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '6px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}>
            🚪 {t('sidebar.logout')}
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <Link to="/login" style={{
            display: 'block',
            backgroundColor: 'rgba(212,172,13,0.2)',
            color: '#D4AC0D',
            textAlign: 'center',
            padding: '10px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            border: '1px solid rgba(212,172,13,0.4)',
          }}>
            🔐 {t('sidebar.login')}
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Link to="/" style={linkStyle}>🏠 {t('sidebar.home')}</Link>
        {user && user.role === 'admin' && (
          <Link to="/upload" style={{ ...linkStyle, color: '#D4AC0D', fontWeight: 'bold' }}>
            📤 {t('sidebar.upload')}
          </Link>
        )}
        <Link to="/about" style={linkStyle}>📖 {t('sidebar.about')}</Link>
        <Link to="/contact" style={linkStyle}>✉️ {t('sidebar.contact')}</Link>

        <hr style={{ borderColor: 'rgba(212,172,13,0.3)', width: '100%', margin: '12px 0' }} />

        <h3 style={headerStyle}>{t('sidebar.collections')}</h3>
        <Link to="/category/Portrait" style={linkStyle}>👤 {t('sidebar.portrait')}</Link>
        <Link to="/category/News" style={linkStyle}>📰 {t('sidebar.news')}</Link>
        <Link to="/historic-events" style={specialLinkStyle}>🏛️ Historic Events</Link>
        <Link to="/businesses" style={specialLinkStyle}>🏢 Businesses</Link>

        <h3 style={headerStyle}>{t('sidebar.vitalRecords')}</h3>
        <Link to="/category/Birth" style={linkStyle}>🍼 {t('sidebar.births')}</Link>
        <Link to="/category/Marriage" style={linkStyle}>💍 {t('sidebar.marriages')}</Link>
        <Link to="/category/Death" style={linkStyle}>⚰️ {t('sidebar.deaths')}</Link>
      </nav>

      {/* Surname index */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={headerStyle}>{t('sidebar.surnameIndex')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginTop: '10px' }}>
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => (
            <Link key={l} to={'/alpha/' + l} style={{
              color: '#F8FBFF',
              textDecoration: 'none',
              fontSize: '0.8rem',
              textAlign: 'center',
              padding: '5px 2px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}>
              {l}
            </Link>
          ))}
        </div>
      </div>

      {/* Support button */}
      <div style={{ marginTop: 'auto', paddingTop: '15px', paddingBottom: '20px' }}>
        <a href="https://paypal.me/yourusername" target="_blank" rel="noopener noreferrer" style={{
          display: 'block',
          background: 'linear-gradient(135deg, #0070ba, #003087)',
          color: 'white',
          textAlign: 'center',
          padding: '10px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          ❤️ {t('sidebar.support')}
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
