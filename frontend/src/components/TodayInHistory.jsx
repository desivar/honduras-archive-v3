import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HISTORICAL_QUOTES = [
  { quote: "No puedes cambiar lo que otros te hacen a ti, pero puedes ensenar a tus hijos a vivir la ley de oro que incluye el perdon, el respeto y el amor.", author: "Desire Vargas", year: "2026" },
  { quote: "La patria no es un pedazo de tierra; es una abstracción, un espíritu, una idea.", author: "Ramón Rosa", year: "1876" },
  { quote: "Las sociedades viven, crecen y se perfeccionan bajo la influencia de las ideas.", author: "Ramón Rosa", year: "1876" },
  { quote: "El pueblo que no conoce su historia está condenado a repetirla.", author: "José Cecilio del Valle", year: "1821" },
  { quote: "La educación es el arma más poderosa para cambiar el mundo.", author: "José Trinidad Reyes", year: "1845" },
  { quote: "Haz de tu hogar un centro de instruccion, un centro de paz, un refugio de perdon, un refugio de amor.", author: "Desire Vargas", year: "2026" },
];

const getTodayLabel = () => {
  const now = new Date();
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
};

const getDailyIndex = (total) => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return seed % total;
};

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`;

export default function TodayInHistory() {
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fadeQuote, setFadeQuote] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await axios.get('https://honduras-archive-v3.onrender.com/api/archive');
        const items = res.data.items || [];
        if (items.length === 0) { setLoading(false); return; }
        setRecord(items[getDailyIndex(items.length)]);
      } catch (e) {
        console.error('Fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeQuote(false);
      setTimeout(() => {
        setQuoteIndex(i => (i + 1) % HISTORICAL_QUOTES.length);
        setFadeQuote(true);
      }, 600);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const q = HISTORICAL_QUOTES[quoteIndex];
  const displayName = record
    ? (record.names?.join(', ') || record.eventName || record.businessName || 'Registro Histórico')
    : '';

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }
        .tih-quote-fade { transition: opacity 0.6s ease; }
        .tih-record-card:hover {
          background: rgba(26,82,118,0.4) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
        }
        .tih-record-card { transition: all 0.25s ease; }
        .tih-dot:hover { opacity: 0.9; }
      `}</style>

      <div style={{
        width: '100%', marginBottom: '32px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease'
      }}>
        {/* Main card — deep blue gradient matching sidebar */}
        <div style={{
          position: 'relative', borderRadius: '12px', overflow: 'hidden',
          background: 'linear-gradient(160deg, #0F3460 0%, #1A5276 50%, #0D2137 100%)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,172,13,0.2)',
          border: '1px solid rgba(212,172,13,0.3)',
        }}>

          {/* Grain texture */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, backgroundImage: GRAIN_SVG, backgroundSize: '180px 180px', opacity: 0.4 }} />

          {/* Corner ornaments — gold */}
          {['top:12px;left:14px','top:12px;right:14px;transform:scaleX(-1)',
            'bottom:12px;left:14px;transform:scaleY(-1)','bottom:12px;right:14px;transform:scale(-1)'].map((s, i) => (
            <div key={i} style={{
              position: 'absolute', color: 'rgba(212,172,13,0.6)',
              fontSize: '1.4rem', fontFamily: 'serif', lineHeight: 1, zIndex: 2,
              ...Object.fromEntries(s.split(';').map(p => { const [k,v]=p.split(':'); return [k.trim(), v?.trim()]; }).filter(([k])=>k))
            }}>❧</div>
          ))}

          <div style={{ position: 'relative', zIndex: 3, padding: '28px 32px 24px' }}>

            {/* Header image */}
            <div style={{ width: '100%', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: '2px solid rgba(212,172,13,0.4)' }}>
              <img src="/blueher.png" alt="Archivo Histórico de Honduras"
                style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block', opacity: 0.9 }} />
            </div>

            {/* Date header */}
            <div style={{ textAlign: 'center', marginBottom: '20px', animation: 'fadeInDown 0.8s ease both' }}>
              <p style={{ margin: '0 0 4px', fontFamily: "'Cormorant Garamond', serif", fontSize: '0.7rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(212,172,13,0.8)' }}>
                ── Archivo de Honduras ──
              </p>
              <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700, color: '#F8FBFF', textShadow: '0 2px 12px rgba(0,0,0,0.5)', lineHeight: 1.1 }}>
                Registro del Día
              </h2>
              <p style={{ margin: '6px 0 0', fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(212,172,13,0.85)', letterSpacing: '0.04em' }}>
                {getTodayLabel()}
              </p>
              {/* Gold divider */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '14px' }}>
                <div style={{ height: '1px', width: '60px', background: 'linear-gradient(to right, transparent, rgba(212,172,13,0.7))' }} />
                <span style={{ color: 'rgba(212,172,13,0.8)', fontSize: '0.65rem' }}>✦</span>
                <div style={{ height: '1px', width: '60px', background: 'linear-gradient(to left, transparent, rgba(212,172,13,0.7))' }} />
              </div>
            </div>

            {/* Rotating quote */}
            <div style={{ textAlign: 'center', marginBottom: '24px', minHeight: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeInUp 1s ease 0.2s both' }}>
              <p className="tih-quote-fade" style={{ opacity: fadeQuote ? 1 : 0, margin: '0 0 10px', fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)', color: 'rgba(248,251,255,0.92)', lineHeight: 1.65, maxWidth: '540px', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
                "{q.quote}"
              </p>
              <p className="tih-quote-fade" style={{ opacity: fadeQuote ? 1 : 0, margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,172,13,0.75)' }}>
                — {q.author}, {q.year}
              </p>
              {/* Quote dots */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                {HISTORICAL_QUOTES.map((_, i) => (
                  <div key={i} className="tih-dot"
                    onClick={() => { setFadeQuote(false); setTimeout(() => { setQuoteIndex(i); setFadeQuote(true); }, 300); }}
                    style={{ width: i === quoteIndex ? '18px' : '6px', height: '6px', borderRadius: '3px', background: i === quoteIndex ? 'rgba(212,172,13,0.9)' : 'rgba(212,172,13,0.3)', cursor: 'pointer', transition: 'all 0.3s ease' }} />
                ))}
              </div>
            </div>

            {/* Daily record */}
            <div style={{ animation: 'fadeInUp 1s ease 0.5s both' }}>
              <p style={{ margin: '0 0 12px', fontFamily: "'Cormorant Garamond', serif", fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(212,172,13,0.7)', textAlign: 'center' }}>
                ✦ Registro Destacado de Hoy ✦
              </p>

              {loading && (
                <p style={{ textAlign: 'center', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(212,172,13,0.5)' }}>
                  Cargando registro...
                </p>
              )}

              {!loading && !record && (
                <p style={{ textAlign: 'center', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(212,172,13,0.5)' }}>
                  No hay registros en el archivo aún.
                </p>
              )}

              {!loading && record && (
                <div
                  className="tih-record-card"
                  onClick={() => navigate(`/record/${record._id}`)}
                  style={{
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(212,172,13,0.25)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  {/* Record image */}
                  {record.imageUrl && (
                    <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(212,172,13,0.2)', display: 'flex', justifyContent: 'center' }}>
                      <img src={record.imageUrl} alt={displayName}
                        style={{ width: '60%', height: 'auto', maxHeight: '160px', objectFit: 'contain', opacity: 0.88, display: 'block' }} />
                    </div>
                  )}

                  {/* Record info */}
                  <div style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        {/* Category badge — green accent */}
                        <span style={{
                          display: 'inline-block', marginBottom: '6px',
                          padding: '1px 8px', borderRadius: '999px',
                          background: 'rgba(46,126,50,0.25)',
                          border: '1px solid rgba(76,175,80,0.4)',
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: '0.7rem', letterSpacing: '0.15em',
                          textTransform: 'uppercase', color: '#a8e6a3',
                        }}>
                          {record.category}
                        </span>

                        {/* Name */}
                        <p style={{ margin: '0 0 4px', fontFamily: "'Playfair Display', serif", fontSize: '0.9rem', fontWeight: 700, color: '#F8FBFF', lineHeight: 1.3 }}>
                          {displayName}
                        </p>

                        {/* Date & location */}
                        <p style={{ margin: '0 0 6px', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.78rem', color: 'rgba(168,212,245,0.7)' }}>
                          {[record.eventDate || record.publicationDate, record.location, record.newspaperName].filter(Boolean).join(' · ')}
                        </p>

                        {/* Summary */}
                        {record.summary && (
                          <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '0.82rem', color: 'rgba(248,251,255,0.6)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {record.summary}
                          </p>
                        )}
                      </div>
                      <span style={{ color: 'rgba(212,172,13,0.6)', fontSize: '1.2rem', marginLeft: '12px', marginTop: '4px' }}>›</span>
                    </div>

                    {/* View link */}
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(212,172,13,0.15)', textAlign: 'right' }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,172,13,0.7)' }}>
                        Ver registro completo ›
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}