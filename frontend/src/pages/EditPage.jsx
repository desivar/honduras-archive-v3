import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [names, setNames] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [category, setCategory] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [newspaperName, setNewspaperName] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [summary, setSummary] = useState('');

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await axios.get(`https://honduras-archive.onrender.com/api/archive/${id}`);
        const r = res.data;
        setNames(Array.isArray(r.names) ? r.names.join(', ') : '');
        setCountryOfOrigin(r.countryOfOrigin || '');
        setCategory(r.category || 'Portrait');
        setEventDate(r.eventDate || '');
        setLocation(r.location || '');
        setNewspaperName(r.newspaperName || '');
        setPageNumber(r.pageNumber || '');
        setSummary(r.summary || '');
      } catch (err) {
        alert('Error loading record');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://honduras-archive.onrender.com/api/archive/${id}`, {
        names: names.split(',').map(n => n.trim()),
        countryOfOrigin,
        category,
        eventDate,
        location,
        newspaperName,
        pageNumber,
        summary
      }, {
        headers: { 'x-auth-token': token }
      });
      alert('Record updated successfully!');
      navigate(`/record/${id}`);
    } catch (err) {
      alert('Error updating record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: '40px', color: '#737958' }}>Loading record...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#737958', textAlign: 'center' }}>Edit Archive Record</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label>Names (separate with commas):</label>
        <input type="text" value={names} onChange={(e) => setNames(e.target.value)} required style={inputStyle} />

        <label>Country of Origin:</label>
        <input type="text" value={countryOfOrigin} onChange={(e) => setCountryOfOrigin(e.target.value)} style={inputStyle} />

        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
          <option value="Portrait">Portrait</option>
          <option value="News">News & Clippings</option>
          <option value="Birth">Birth</option>
          <option value="Marriage">Marriage</option>
          <option value="Death">Death</option>
        </select>

        <label>Event Date:</label>
        <input type="text" value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="e.g. 5 de Enero 1930" style={inputStyle} />

        <label>Location:</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 2 }}>
            <label>Newspaper/Source:</label>
            <input type="text" value={newspaperName} onChange={(e) => setNewspaperName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Page:</label>
            <input type="text" value={pageNumber} onChange={(e) => setPageNumber(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <label>Summary:</label>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows="4" style={inputStyle} />

        <button type="submit" disabled={saving} style={{ padding: '15px', backgroundColor: '#737958', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  width: '100%',
  boxSizing: 'border-box'
};

export default EditPage;