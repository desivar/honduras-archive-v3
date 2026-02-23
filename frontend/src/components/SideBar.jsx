import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ user, onLogout, totalCount, lastUpdate }) => {  // 👈 add lastUpdate prop
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/');
  };

  const linkStyle = {
    color: '#EFE7DD',
    textDecoration: 'none',
    padding: '7px 0',
    display: 'block',
    fontSize: '1rem',
    transition: 'padding-left 0.2s'
  };

  const headerStyle = {
    fontSize: '0.8rem',
    color: '#ACA37E',
    marginTop: '20px',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  };

  return (
    <div style={{ 
      width: '260px', 
      backgroundColor: '#737958', 
      color: '#EFE7DD', 
      height: '100vh', 
      padding: '20px', 
      position: 'fixed', 
      top: 0, left: 0,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      boxSizing: 'border-box', 
      boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      overflowY: 'auto'
    }}>
      <h2 style={{ 
        fontFamily: 'serif', 
        borderBottom: '2px solid #ACA37E',
        paddingBottom: '10px',
        marginBottom: '10px',
        fontSize: '1.3rem'
      }}>
        Newspaper Archive
      </h2>

      {/* 📊 Magnitud + Last Update */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        padding: '10px', 
        borderRadius: '6px', 
        marginBottom: '20px',
        borderLeft: '4px solid #ACA37E'
      }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#EFE7DD' }}>
          <strong>Magnitud:</strong> {totalCount || 0} Registros
        </p>
        {/* 👇 Add this */}
        {lastUpdate && (
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#EFE7DD', marginTop: '5px' }}>
            <strong>Last Update:</strong> {new Date(lastUpdate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* rest of your sidebar stays exactly the same... */}