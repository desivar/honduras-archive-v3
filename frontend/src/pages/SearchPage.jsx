import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ResultCard, { ResultList } from '../components/ResultCard';
import TodayInHistory from '../components/TodayInHistory';

const API = 'https://honduras-archive-v3.onrender.com/api/archive';

const COLLECTIONS = [
  { key: 'Portrait',       icon: '👤', en: 'Portrait',         es: 'Retratos',          path: '/category/Portrait', color: '#1A5276', border: '#2E86C1' },
  { key: 'News',           icon: '📰', en: 'News & Clippings', es: 'Noticias',           path: '/category/News',     color: '#1A5276', border: '#2E86C1' },
  { key: 'Historic Event', icon: '🏛️', en: 'Historic Events',  es: 'Eventos Históricos', path: '/historic-events',   color: '#2E7D32', border: '#4CAF50' },
  { key: 'Business',       icon: '🏢', en: 'Businesses',       es: 'Negocios',           path: '/businesses',        color: '#2E7D32', border: '#4CAF50' },
  { key: 'Birth',          icon: '🍼', en: 'Births',           es: 'Nacimientos',        path: '/category/Birth',    color: '#0F3460', border: '#D4AC0D' },
  { key: 'Marriage',       icon: '💍', en: 'Marriages',        es: 'Matrimonios',        path: '/category/Marriage', color: '#0F3460', border: '#D4AC0D' },
  { key: 'Death',          icon: '🕊️', en: 'Deaths',           es: 'Defunciones',        path: '/category/Death',    color: '#0F3460', border: '#D4AC0D' },
];

const CollectionCard = ({ col, count, lang, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? col.color : 'white',
        border: `2px solid ${col.border}`,
        borderRadius: '10px',
        padding: '20px 16px',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.25s ease',
        boxShadow: hovered ? '0 6px 20px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{col.icon}</div>
      <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '1rem', color: hovered ? 'white' : '#0F3460' }}>
        {lang === 'es' ? col.es : col.en}
      </p>
      <p style={{ margin: 0, fontSize: '0.82rem', color: hovered ? 'rgba(255,255,255,0.75)' : '#888' }}>
        {count} {lang === 'es' ? 'registros' : 'records'}
      </p>
    </div>
  );
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({});
  const [lang, setLang] = useState('en');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('i18nextLng') || 'en';
    setLang(saved.startsWith('es') ? 'es' : 'en');
  }, []);

  useEffect(() => {
    fetchAllRecords();
    fetchCounts();
  }, []);

  const fetchAllRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      setResults(res.data.items || []);
    } catch (e) {
      console.error('Error loading archive:', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await axios.get(API);
      const items = res.data.items || [];
      const c = {};
      COLLECTIONS.forEach(col => {
        c[col.key] = items.filter(r => r.category === col.key).length;
      });
      setCounts(c);
    } catch (e) { console.error(e); }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) { fetchAllRecords(); setShowSearch(false); return; }
    setLoading(true);
    setShowSearch(true);
    try {
      const res = await axios.get(`${API}?search=${query}`);
      setResults(res.data.items || []);
    } catch (e) {
      console.error('Search error:', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowSearch(false);
    fetchAllRecords();
  };

  return (
    <div style={{ backgroundColor: '#EAF0F7', minHeight: '100vh' }}>

      {/* ── HERO — full width ── */}
      <div style={{ width: '100%', padding: '24px 32px 0', boxSizing: 'border-box' }}>
        <TodayInHistory />
      </div>

      {/* ── INTRO SECTION ── */}
      <div style={{ width: '100%', padding: '40px 32px', boxSizing: 'border-box', background: 'linear-gradient(180deg, #EAF0F7 0%, #F8FBFF 100%)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>

          <p style={{ margin: '0 0 8px', fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AC0D', fontWeight: 'bold' }}>
            ── Recuerdos de Honduras ──
          </p>

          <h1 style={{ margin: '0 0 20px', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#0F3460', fontFamily: 'serif', fontWeight: 700, lineHeight: 1.2 }}>
            {lang === 'es' ? 'Preservando la Memoria Histórica de Honduras' : 'Preserving the Historical Memory of Honduras'}
          </h1>

          {/* Gold divider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{ height: '2px', width: '60px', background: 'linear-gradient(to right, transparent, #D4AC0D)' }} />
            <span style={{ color: '#D4AC0D', fontSize: '1rem' }}>✦</span>
            <div style={{ height: '2px', width: '60px', background: 'linear-gradient(to left, transparent, #D4AC0D)' }} />
          </div>

          {/* Bilingual intro */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', textAlign: 'left' }}>
            <div style={{ borderLeft: '3px solid #D4AC0D', paddingLeft: '16px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1A5276', fontWeight: 'bold' }}>English</p>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#2c3e50', lineHeight: 1.8 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            </div>
            <div style={{ borderLeft: '3px solid #4CAF50', paddingLeft: '16px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2E7D32', fontWeight: 'bold' }}>Español</p>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#2c3e50', lineHeight: 1.8 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── COLLECTION CARDS ── */}
      <div style={{ width: '100%', padding: '32px 32px 40px', boxSizing: 'border-box', backgroundColor: '#F8FBFF', borderTop: '1px solid rgba(15,52,96,0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          <p style={{ textAlign: 'center', margin: '0 0 24px', fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#1A5276', fontWeight: 'bold' }}>
            ── {lang === 'es' ? 'Colecciones del Archivo' : 'Archive Collections'} ──
          </p>

          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
            {COLLECTIONS.slice(0, 3).map(col => (
              <CollectionCard key={col.key} col={col} count={counts[col.key] || 0} lang={lang} onClick={() => navigate(col.path)} />
            ))}
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
            {COLLECTIONS.slice(3, 6).map(col => (
              <CollectionCard key={col.key} col={col} count={counts[col.key] || 0} lang={lang} onClick={() => navigate(col.path)} />
            ))}
          </div>

          {/* Row 3 — centered */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 'calc(33.33% - 8px)' }}>
              <CollectionCard col={COLLECTIONS[6]} count={counts[COLLECTIONS[6].key] || 0} lang={lang} onClick={() => navigate(COLLECTIONS[6].path)} />
            </div>
          </div>

        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div style={{ width: '100%', padding: '32px', boxSizing: 'border-box', backgroundColor: '#EAF0F7', borderTop: '2px solid rgba(15,52,96,0.1)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          <p style={{ textAlign: 'center', margin: '0 0 16px', fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#1A5276', fontWeight: 'bold' }}>
            ── {lang === 'es' ? 'Buscar en el Archivo' : 'Search the Archive'} ──
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder={lang === 'es' ? 'Buscar por nombre, lugar...' : 'Search by name, location...'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                padding: '14px 16px', flex: 1, borderRadius: '8px',
                border: '2px solid #1A5276', fontSize: '1rem',
                backgroundColor: 'white', color: '#0F3460', outline: 'none',
              }}
            />
            <button type="submit" style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #1A5276, #0F3460)',
              color: 'white', border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              {loading ? '⏳' : '🔍'} {lang === 'es' ? 'Buscar' : 'Search'}
            </button>
            {showSearch && (
              <button type="button" onClick={handleClear} style={{
                padding: '14px 20px', backgroundColor: 'white',
                color: '#1A5276', border: '2px solid #1A5276',
                borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
              }}>✕</button>
            )}
          </form>
        </div>
      </div>

      {/* ── SEARCH RESULTS ── */}
      {showSearch && (
        <div style={{ width: '100%', padding: '24px 32px 40px', boxSizing: 'border-box', backgroundColor: '#EAF0F7' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#1A5276', fontSize: '1.1rem' }}>
                ⏳ {lang === 'es' ? 'Buscando...' : 'Searching...'}
              </p>
            ) : results.length > 0 ? (
              <ResultList records={results} pageSize={20} onDeleteSuccess={fetchAllRecords} />
            ) : (
              <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1rem' }}>
                {lang === 'es' ? `No se encontraron registros para "${query}".` : `No records found for "${query}".`}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default SearchPage;