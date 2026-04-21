import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count, setIsOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); setUserMenu(false); };

  return (
    <nav id="navbar" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900,
      background: scrolled ? 'rgba(254,252,244,0.9)' : 'rgba(254,252,244,0.6)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: scrolled ? '1px solid rgba(186,185,178,0.3)' : '1px solid transparent',
      boxShadow: scrolled ? '0 4px 24px rgba(56,56,51,0.06)' : 'none',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div className="container" style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--primary-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem', boxShadow: '0 4px 12px rgba(202,0,44,0.3)',
          }}>🍕</div>
          <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1.3rem', color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
            Slice<span style={{ color: 'var(--primary)' }}>Stream</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          {[['/', 'Home'], ['/menu', 'Menu'], ['/build', 'Build Pizza']].map(([path, label]) => (
            <Link key={path} to={path} style={{
              padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 500,
              fontSize: '0.9375rem', color: location.pathname === path ? 'var(--primary)' : 'var(--on-surface-variant)',
              background: location.pathname === path ? 'rgba(202,0,44,0.08)' : 'transparent',
              transition: 'all 0.2s', textDecoration: 'none',
            }}>{label}</Link>
          ))}
          {user && (
            <Link to="/orders" style={{
              padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 500,
              fontSize: '0.9375rem', color: location.pathname === '/orders' ? 'var(--primary)' : 'var(--on-surface-variant)',
              background: location.pathname === '/orders' ? 'rgba(202,0,44,0.08)' : 'transparent',
              transition: 'all 0.2s', textDecoration: 'none',
            }}>My Orders</Link>
          )}
          {isAdmin && (
            <Link to="/admin" style={{
              padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 500,
              fontSize: '0.9375rem', color: location.pathname.startsWith('/admin') ? 'var(--primary)' : 'var(--on-surface-variant)',
              background: location.pathname.startsWith('/admin') ? 'rgba(202,0,44,0.08)' : 'transparent',
              transition: 'all 0.2s', textDecoration: 'none',
            }}>Admin</Link>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Cart */}
          <button id="cart-btn" onClick={() => setIsOpen(true)} style={{
            position: 'relative', width: 42, height: 42, borderRadius: '50%',
            background: 'var(--surface-container)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', transition: 'var(--transition)',
          }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-high)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-container)'}>
            🛒
            {count > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: 'var(--primary-gradient)', color: '#fff',
                borderRadius: '50%', width: 20, height: 20,
                fontSize: '0.6875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(202,0,44,0.4)',
              }}>{count}</span>
            )}
          </button>

          {/* User */}
          {user ? (
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button id="user-menu-btn" onClick={() => setUserMenu(v => !v)} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.375rem 1rem 0.375rem 0.375rem',
                background: 'var(--surface-container)', borderRadius: '9999px',
                border: 'none', cursor: 'pointer', transition: 'var(--transition)',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--primary-gradient)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.875rem',
                }}>{user.name?.[0]?.toUpperCase() || 'U'}</div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                  {user.name?.split(' ')[0] || 'User'}
                </span>
              </button>
              {userMenu && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
                  background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)', border: '1px solid var(--surface-container-high)',
                  padding: '0.5rem', minWidth: 180, zIndex: 100,
                  animation: 'fadeInUp 0.2s ease',
                }}>
                  <Link to="/orders" onClick={() => setUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--on-surface)', transition: 'var(--transition)', textDecoration: 'none', fontSize: '0.9375rem' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    📦 My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--on-surface)', transition: 'var(--transition)', textDecoration: 'none', fontSize: '0.9375rem' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <div style={{ height: 1, background: 'var(--surface-container-high)', margin: '0.25rem 0' }} />
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--error)', width: '100%', fontWeight: 500, fontSize: '0.9375rem', transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(190,45,6,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
