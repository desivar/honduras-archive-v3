import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🟢 Now used in handleDelete below

const ArchiveCard = ({ record, category, onDeleteSuccess }) => {
  const navigate = useNavigate();
  
  // Get token and user for Admin checks
  const token = localStorage.getItem('token');
  const isAdmin = JSON.parse(localStorage.getItem('user'))?.role === 'admin';

  // Define accent color
  const accentColor = (category === 'Business') ? '#586379' : '#737958';

  const getInfo = () => {
    switch (category) {
      case 'Business': return { title: record.businessName || 'Unnamed Business', icon: '🏢', sub: record.businessType };
      case 'Historic Event': return { title: record.eventName || 'Unnamed Event', icon: '🏛️', sub: record.location };
      case 'Portrait': return { title: record.fullName || 'Portrait', icon: '🖼️', sub: record.eventDate };
      case 'Person': return { title: record.fullName || 'Person', icon: '👤', sub: record.occupation };
      case 'News': return { title: record.headline || 'News Clipping', icon: '📰', sub: record.newspaperName };
      default: return { title: record.title || 'Record', icon: '📄', sub: '' };
    }
  };

  const { title, icon, sub } = getInfo();

  // ─── 🟢 THIS USES AXIOS AND ONDELETESUCCESS ───
  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevents the card from opening when clicking delete
    if (window.confirm(`Delete "${title}"?`)) {
      try {
        await axios.delete(`https://honduras-archive.onrender.com/api/archive/${record._id}`, {
          headers: { 'x-auth-token': token }
        });
        alert('Deleted!');
        if (onDeleteSuccess) onDeleteSuccess(); // 🟢 Now used!
      } catch (err) {
        alert('Error deleting record');
      }
    }
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div 
      onClick={() => navigate(`/record/${record._id}`)} 
      style={cardStyle(accentColor)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <h3 style={{ color: accentColor, margin: 0 }}>{title}</h3>
      </div>
      
      {record.imageUrl && <img src={record.imageUrl} style={imageStyle} alt={title} />}

      <div style={{ padding: '10px 0' }}>
        {sub && <p style={{ fontSize: '0.9rem', color: '#555' }}><strong>{sub}</strong></p>}
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            onClick={(e) => { stop(e); alert("Citation logic goes here!"); }} 
            style={buttonStyle}
          >
            📄 Cite
          </button>
          
          {isAdmin && (
            <button 
              onClick={handleDelete} // 🟢 Connected to the function above
              style={{ ...buttonStyle, color: '#a94442', borderColor: '#a94442' }}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- STYLES (Make sure these are at the bottom) ---
const cardStyle = (color) => ({
  backgroundColor: 'white',
  padding: '20px',
  marginBottom: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  border: `2px solid ${color}`,
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s'
});

const imageStyle = {
  width: '100%',
  borderRadius: '4px',
  marginBottom: '15px',
  display: 'block',
  height: 'auto',
  objectFit: 'contain',
  maxHeight: '400px',
  backgroundColor: '#f9f9f9'
};

const buttonStyle = {
  padding: '8px 12px',
  backgroundColor: 'white',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.85rem'
};

export default ArchiveCard;