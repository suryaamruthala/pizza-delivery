import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords don't match");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true); setError(''); setMessage('');
    try {
      const { data } = await axios.put(`/api/auth/resetpassword/${token}`, { password });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #fff8f0 0%, var(--surface) 50%, #fff0f2 100%)' }}>
      <div style={{ width: '100%', maxWidth: 460, padding: '0 1rem', animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>
            Create New Password
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>Secure your account</p>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '2.25rem', boxShadow: 'var(--shadow-warm)', border: '1px solid var(--surface-container-high)' }}>
          {message ? (
             <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#10b981' }}>✅</div>
               <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>All Set!</h2>
               <p style={{ color: 'var(--on-surface-variant)' }}>{message}</p>
               <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>Go to Login</button>
             </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9375rem' }}>New Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="input" placeholder="Min. 6 characters" required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  className="input" placeholder="Repeat password" required />
              </div>
              {error && (
                <div style={{ background: 'rgba(190,45,6,0.08)', border: '1px solid rgba(190,45,6,0.2)', borderRadius: 'var(--radius-md)', padding: '0.875rem', color: 'var(--error)', fontSize: '0.9rem', fontWeight: 500 }}>
                  {error}
                </div>
              )}
              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
