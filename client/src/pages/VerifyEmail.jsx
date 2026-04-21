import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const { data } = await axios.get(`/api/auth/verify/${token}`);
        setStatus('success');
        setMessage(data.message);
        // Auto-login using the token returned by the server, then redirect
        if (data.token && data.user) {
          loginWithToken(data.user, data.token);
          setTimeout(() => navigate('/menu'), 2000);
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The token may be invalid or expired.');
      }
    };
    verifyToken();
  }, [token]);

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #fff8f0 0%, var(--surface) 50%, #fff0f2 100%)' }}>
      <div style={{ width: '100%', maxWidth: 460, padding: '0 1rem', animation: 'fadeInUp 0.4s ease', textAlign: 'center' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '2.25rem', boxShadow: 'var(--shadow-warm)', border: '1px solid var(--surface-container-high)' }}>

          {status === 'loading' && (
            <div>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Verifying your email...</h2>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#10b981' }}>✅</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Email Verified!</h2>
              <p style={{ color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>{message}</p>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Logging you in automatically…</p>
              <button onClick={() => navigate('/menu')} className="btn btn-primary" style={{ width: '100%' }}>Go to Menu</button>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--error)' }}>❌</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Verification Failed</h2>
              <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>{message}</p>
              <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ width: '100%' }}>Back to Login</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
