import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TagInput = ({ tags, setTags, placeholder, inputId }) => {
  const [inputVal, setInputVal] = useState('');

  const addTag = (val) => {
    const trimmed = val.trim().replace(/,$/, '');
    if (trimmed) {
      setTags([...tags, trimmed]);
      setInputVal('');
    }
  };

  return (
    <div
      style={{
        ...inputStyle,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        alignItems: 'center',
        minHeight: '44px',
        height: 'auto',
        cursor: 'text',
        padding: '6px 10px',
      }}
      onClick={() => document.getElementById(inputId).focus()}
    >
      {tags.map((tag, i) => (
        <span
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#e8e4d4',
            color: '#4a4a2a',
            border: '1px solid #ACA37E',
            borderRadius: '999px',
            padding: '2px 10px',
            fontSize: '13px',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#737958', fontSize: '15px', lineHeight: 1, padding: 0,
            }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={inputId}
        type="text"
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputVal);
          } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
            setTags(tags.slice(0, -1));
          }
        }}
        onBlur={() => addTag(inputVal)}
        placeholder={tags.length === 0 ? placeholder : ''}
        style={{
          border: 'none', outline: 'none', background: 'transparent',
          fontSize: '14px', flex: '1', minWidth: '160px',
        }}
      />
    </div>
  );
};

const UploadPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ── Scan state ──────────────────────────────────────────────────────────────
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Shared fields
  const [category, setCategory] = useState('Portrait');
  const [eventDate, setEventDate] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [location, setLocation] = useState('');
  const [newspaperName, setNewspaperName] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [summary, setSummary] = useState('');
  const [image, setImage] = useState(null);

  // Person-record fields
  const [names, setNames] = useState([]);
  const [countryOfOrigin, setCountryOfOrigin] = useState('');

  // Historic Event fields
  const [eventName, setEventName] = useState('');
  const [peopleInvolved, setPeopleInvolved] = useState([]);

  // Business fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [owner, setOwner] = useState('');
  const [yearFounded, setYearFounded] = useState('');

  const isHistoricEvent = category === 'Historic Event';
  const isBusiness = category === 'Business';
  const isPersonRecord = !isHistoricEvent && !isBusiness;

  // ── Image pick ──────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setScanDone(false);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ── Claude Vision scan ──────────────────────────────────────────────────────
  const handleScan = async () => {
    if (!image) return;
    setScanning(true);
    setScanDone(false);

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('image', image);

      const res = await axios.post(
        'https://honduras-archive.onrender.com/api/archive/scan',
        data,
        { headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token } }
      );

      const d = res.data;

      // Fill in whatever Claude found — only overwrite if value exists
      if (d.category)               setCategory(d.category);
      if (d.eventDate)              setEventDate(d.eventDate);
      if (d.publicationDate)        setPublicationDate(d.publicationDate);
      if (d.location)               setLocation(d.location);
      if (d.newspaperName)          setNewspaperName(d.newspaperName);
      if (d.pageNumber)             setPageNumber(String(d.pageNumber));
      if (d.summary)                setSummary(d.summary);
      if (d.names?.length)          setNames(d.names);
      if (d.countryOfOrigin)        setCountryOfOrigin(d.countryOfOrigin);
      if (d.eventName)              setEventName(d.eventName);
      if (d.peopleInvolved?.length) setPeopleInvolved(d.peopleInvolved);
      if (d.businessName)           setBusinessName(d.businessName);
      if (d.businessType)           setBusinessType(d.businessType);
      if (d.owner)                  setOwner(d.owner);
      if (d.yearFounded)            setYearFounded(d.yearFounded);

      setScanDone(true);
    } catch (err) {
      console.error('Scan error:', err);
      alert('Scan failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setScanning(false);
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('category', category);
    formData.append('eventDate', eventDate);
    formData.append('publicationDate', publicationDate);
    formData.append('location', location);
    formData.append('newspaperName', newspaperName);
    formData.append('pageNumber', pageNumber);
    formData.append('summary', summary);
    if (image) formData.append('image', image);

    if (isHistoricEvent) {
      formData.append('eventName', eventName);
      formData.append('peopleInvolved', JSON.stringify(peopleInvolved));
      formData.append('names', JSON.stringify([]));
    } else if (isBusiness) {
      formData.append('businessName', businessName);
      formData.append('businessType', businessType);
      formData.append('owner', owner);
      formData.append('yearFounded', yearFounded);
      formData.append('names', JSON.stringify([]));
      formData.append('peopleInvolved', JSON.stringify([]));
    } else {
      formData.append('names', JSON.stringify(names));
      formData.append('countryOfOrigin', countryOfOrigin);
      formData.append('peopleInvolved', JSON.stringify([]));
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('https://honduras-archive.onrender.com/api/archive', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token }
      });
      alert('Record uploaded successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error uploading record. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '620px', margin: '40px auto', padding: '30px',
      backgroundColor: 'white', borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#737958', textAlign: 'center', marginBottom: '24px' }}>
        Upload New Archive Record
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Image upload + Scan button ─────────────────────────────────────── */}
        <div>
          <label style={labelStyle}>Upload Image:</label>

          {imagePreview && (
            <div style={{ marginBottom: '10px', textAlign: 'center' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          )}

          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            style={inputStyle}
          />

          {/* Scan button — appears only after an image is selected */}
          {image && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={handleScan}
                disabled={scanning}
                style={{
                  padding: '9px 20px',
                  backgroundColor: scanning ? '#aaa' : '#4a7c59',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: scanning ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                }}
              >
                {scanning ? '🔍 Scanning...' : '🤖 Scan with Claude'}
              </button>

              {scanDone && (
                <span style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '0.88rem' }}>
                  ✓ Fields pre-filled — review and correct below
                </span>
              )}
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}>Category:</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
            <option value="Portrait">Portrait</option>
            <option value="News">News &amp; Clippings</option>
            <option value="Birth">Birth</option>
            <option value="Marriage">Marriage</option>
            <option value="Death">Death</option>
            <option value="Historic Event">🏛️ Historic Event</option>
            <option value="Business">🏢 Business</option>
          </select>
        </div>

        {/* Historic Event fields */}
        {isHistoricEvent && (
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>🏛️ Historic Event Details</p>
            <div>
              <label style={labelStyle}>Event Name: *</label>
              <input
                type="text" value={eventName} onChange={e => setEventName(e.target.value)}
                required placeholder="e.g. Battle of La Trinidad" style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>People Involved:</label>
              <TagInput
                tags={peopleInvolved}
                setTags={setPeopleInvolved}
                placeholder="Type a name and press Enter…"
                inputId="people-involved-input"
              />
              <p style={hintStyle}>Press Enter or comma after each name</p>
            </div>
          </div>
        )}

        {/* Business fields */}
        {isBusiness && (
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>🏢 Business Details</p>
            <div>
              <label style={labelStyle}>Business Name: *</label>
              <input
                type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                required placeholder="e.g. Casa Comercial Morazán" style={inputStyle}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Type of Business:</label>
                <input
                  type="text" value={businessType} onChange={e => setBusinessType(e.target.value)}
                  placeholder="e.g. Import, Pharmacy, Hotel" style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Year Founded / Mentioned:</label>
                <input
                  type="text" value={yearFounded} onChange={e => setYearFounded(e.target.value)}
                  placeholder="e.g. 1905" style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Owner(s):</label>
              <input
                type="text" value={owner} onChange={e => setOwner(e.target.value)}
                placeholder="e.g. Don Carlos Izaguirre" style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* Person fields */}
        {isPersonRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Names: *</label>
              <TagInput
                tags={names}
                setTags={setNames}
                placeholder="Type a name and press Enter…"
                inputId="names-input"
              />
              <p style={hintStyle}>Press Enter or comma after each name</p>
            </div>
            <div>
              <label style={labelStyle}>Person's Origin:</label>
              <input
                type="text" value={countryOfOrigin} onChange={e => setCountryOfOrigin(e.target.value)}
                placeholder="e.g. Italy" style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* Dates */}
        <div>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#737958', fontWeight: 'bold', textTransform: 'uppercase' }}>
            📅 Dates
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date of Event:</label>
              <input
                type="text" value={eventDate} onChange={e => setEventDate(e.target.value)}
                placeholder="e.g. 5 de Enero 1827" style={inputStyle}
              />
              <p style={hintStyle}>When it actually happened</p>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date of Publication:</label>
              <input
                type="text" value={publicationDate} onChange={e => setPublicationDate(e.target.value)}
                placeholder="e.g. 12 de Marzo 1930" style={inputStyle}
              />
              <p style={hintStyle}>When it appeared in the source</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label style={labelStyle}>Location / Place:</label>
          <input
            type="text" value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Tegucigalpa, Francisco Morazán" style={inputStyle}
          />
        </div>

        {/* Source */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Newspaper / Source:</label>
            <input
              type="text" value={newspaperName} onChange={e => setNewspaperName(e.target.value)}
              placeholder="e.g. El Cronista" style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Page:</label>
            <input
              type="text" value={pageNumber} onChange={e => setPageNumber(e.target.value)}
              placeholder="e.g. 5" style={inputStyle}
            />
          </div>
        </div>

        {/* Summary */}
        <div>
          <label style={labelStyle}>Description / Summary:</label>
          <textarea
            value={summary} onChange={e => setSummary(e.target.value)} rows="4"
            placeholder={
              isHistoricEvent ? 'Describe what happened during this event...'
              : isBusiness ? 'Describe the business, its history, products or services...'
              : 'Summary of the record...'
            }
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '15px', backgroundColor: loading ? '#aaa' : '#737958',
            color: 'white', border: 'none', borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem'
          }}
        >
          {loading ? 'Uploading...' : '💾 Save to Archive'}
        </button>

      </form>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.9rem', color: '#444' };
const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', width: '100%', boxSizing: 'border-box' };
const hintStyle = { margin: '4px 0 0 0', fontSize: '0.75rem', color: '#999', fontStyle: 'italic' };
const sectionStyle = { backgroundColor: '#f7f5ef', border: '2px solid #ACA37E', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' };
const sectionTitleStyle = { margin: 0, fontWeight: 'bold', color: '#737958', fontSize: '0.95rem' };

export default UploadPage;