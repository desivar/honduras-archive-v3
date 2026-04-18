import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [role, setRole] = useState('visitor');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('https://honduras-archive-v3.onrender.com/api/auth/signup', {
        username, email, password, whatsapp, role
      });

      if (res.data.success) {
        if (res.data.pending) {
          // Genealogist pending approval — don't redirect, show message
          setSuccess(res.data.message);
        } else {
          alert(res.data.message);
          navigate('/login');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#EFE7DD', minHeight: '100vh',
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white', padding: '40px', borderRadius: '12px',
        border: '2px solid #737958', maxWidth: '440px', width: '100%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#737958', textAlign: 'center', marginBottom: '6px', fontSize: '1.8rem' }}>
          Recuerdos de Honduras
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '28px', fontSize: '0.95rem' }}>
          Create your account
        </p>

        {/* Success message for pending genealogists */}
        {success && (
          <div style={{
            backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '16px',
            borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem',
            border: '1px solid #a5d6a7', textAlign: 'center', lineHeight: '1.5'
          }}>
            ✅ {success}
            <div style={{ marginTop: '12px' }}>
              <Link to="/" style={{ color: '#737958', fontWeight: 'bold' }}>← Return to Archive</Link>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Account type selector */}
            <div style={{
              backgroundColor: '#f7f5ef', border: '1px solid #ACA37E',
              borderRadius: '8px', padding: '14px'
            }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '0.9rem', color: '#737958' }}>
                Account Type
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{
                  flex: 1, padding: '10px', borderRadius: '6px', cursor: 'pointer',
                  border: role === 'visitor' ? '2px solid #737958' : '2px solid #ddd',
                  backgroundColor: role === 'visitor' ? '#f0ede3' : 'white',
                  textAlign: 'center', fontSize: '0.9rem'
                }}>
                  <input type="radio" value="visitor" checked={role === 'visitor'}
                    onChange={() => setRole('visitor')} style={{ display: 'none' }} />
                  👤 <strong>Visitor</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#666' }}>
                    Browse the archive freely
                  </p>
                </label>
                <label style={{
                  flex: 1, padding: '10px', borderRadius: '6px', cursor: 'pointer',
                  border: role === 'genealogist' ? '2px solid #737958' : '2px solid #ddd',
                  backgroundColor: role === 'genealogist' ? '#f0ede3' : 'white',
                  textAlign: 'center', fontSize: '0.9rem'
                }}>
                  <input type="radio" value="genealogist" checked={role === 'genealogist'}
                    onChange={() => setRole('genealogist')} style={{ display: 'none' }} />
                  🔬 <strong>Genealogist</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#666' }}>
                    Bookmarks, notes & dashboard
                  </p>
                </label>
              </div>
              {role === 'genealogist' && (
                <p style={{ margin: '10px 0 0 0', fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>
                  ⏳ Genealogist accounts require admin approval before you can log in.
                </p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>WhatsApp <span style={{ color: '#999', fontWeight: 'normal' }}>(optional)</span></label>
              <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                placeholder="+504..." style={inputStyle} />
            </div>

            {error && (
              <div style={{
                backgroundColor: '#ffebee', color: '#c62828', padding: '12px',
                borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: '14px', backgroundColor: loading ? '#999' : '#737958',
              color: 'white', border: 'none', borderRadius: '6px',
              fontSize: '1rem', fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>Already have an account? </span>
          <Link to="/login" style={{ color: '#737958', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block', marginBottom: '4px',
  fontWeight: 'bold', fontSize: '0.9rem', color: '#444'
};
const inputStyle = {
  width: '100%', padding: '11px', border: '2px solid #ddd',
  borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box'
};

export default Register;