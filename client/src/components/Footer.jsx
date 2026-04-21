import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--on-surface)',
      color: 'rgba(254,252,244,0.75)',
      padding: '3.5rem 0 2rem',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.5rem' }}>🍕</div>
              <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1.25rem', color: '#fefcf4' }}>
                Slice<span style={{ color: 'var(--primary-container)' }}>Stream</span>
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 240 }}>
              Hot, fresh, and crafted with passion. Delivered to your door in 40 minutes or less.
            </p>
          </div>

          <div>
            <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#fefcf4', marginBottom: '1rem', fontSize: '1rem' }}>Quick Links</div>
            {[['/', 'Home'], ['/menu', 'Menu'], ['/orders', 'My Orders']].map(([to, label]) => (
              <Link key={to} to={to} style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(254,252,244,0.65)', fontSize: '0.9rem', transition: 'color 0.2s', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(254,252,244,0.65)'}>
                {label}
              </Link>
            ))}
          </div>

          <div>
            <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#fefcf4', marginBottom: '1rem', fontSize: '1rem' }}>Coupons</div>
            {[['SLICE10', '10% off'], ['PIZZA20', '20% off'], ['FIRST50', '50% off first order']].map(([code, desc]) => (
              <div key={code} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <code style={{ background: 'rgba(202,0,44,0.3)', color: 'var(--primary-container)', padding: '0.125rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.8125rem', fontWeight: 700 }}>{code}</code>
                <span style={{ fontSize: '0.85rem', color: 'rgba(254,252,244,0.65)' }}>{desc}</span>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#fefcf4', marginBottom: '1rem', fontSize: '1rem' }}>Contact</div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>📍 123 Pizza Lane, Mumbai</p>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>📞 +91 99999 99999</p>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>✉️ hello@slicestream.in</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(254,252,244,0.12)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.875rem' }}>© 2024 SliceStream. Made with ❤️ and 🍕</p>
        </div>
      </div>
    </footer>
  );
}
