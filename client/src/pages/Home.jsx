import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PizzaCard from '../components/PizzaCard';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/pizzas?featured=true').then(r => setFeatured(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { icon: '🕐', value: '40 min', label: 'Avg Delivery' },
    { icon: '⭐', value: '4.8', label: 'Avg Rating' },
    { icon: '🍕', value: '50+', label: 'Menu Items' },
    { icon: '😊', value: '10K+', label: 'Happy Customers' },
  ];

  const categories = [
    { icon: '🥦', label: 'Veg', color: '#2d7d46', bg: 'rgba(45,125,70,0.08)', desc: 'Fresh garden goodness' },
    { icon: '🍗', label: 'Non-Veg', color: '#ca002c', bg: 'rgba(202,0,44,0.08)', desc: 'Meaty indulgences' },
    { icon: '✨', label: 'Specials', color: '#7b4db4', bg: 'rgba(123,77,180,0.08)', desc: 'Chef\'s exclusive picks' },
  ];

  return (
    <div className="page">
      {/* Hero */}
      <section style={{
        minHeight: '92vh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg, #fff8f0 0%, var(--surface) 40%, #fff0f2 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '55%', height: '120%', borderRadius: '40% 0 0 40%', background: 'linear-gradient(135deg, rgba(202,0,44,0.04), rgba(255,117,119,0.08))', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(202,0,44,0.06), transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          {/* Left */}
          <div className="animate-fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(202,0,44,0.08)', border: '1px solid rgba(202,0,44,0.15)', borderRadius: '9999px', padding: '0.375rem 1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.875rem' }}>🔥</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Fresh & Hot — Delivered in 40 min</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
              Pizza That Hits<br />
              <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Different.</span>
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--on-surface-variant)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 460 }}>
              Artisan pizzas crafted with the finest ingredients. From our wood-fired oven to your door — hot, fresh, and irresistible.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/menu" className="btn btn-primary btn-lg" id="hero-order-btn">Order Now 🍕</Link>
              <Link to="/menu" className="btn btn-secondary btn-lg">Explore Menu</Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', flexWrap: 'wrap' }}>
              {stats.map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1.375rem', color: 'var(--on-surface)' }}>
                    {s.icon} {s.value}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: '0.125rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — rotating pizza image */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
              <div style={{
                borderRadius: '40%', overflow: 'hidden',
                boxShadow: '0 40px 100px rgba(86,39,12,0.15)',
                aspectRatio: '1', position: 'relative',
              }}>
                {HERO_IMAGES.map((src, i) => (
                  <img key={i} src={src} alt="Pizza" style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'cover',
                    opacity: heroIdx === i ? 1 : 0,
                    transition: 'opacity 0.8s ease',
                  }} />
                ))}
              </div>
              {/* Floating badge */}
              <div style={{
                position: 'absolute', bottom: '8%', left: '-8%',
                background: 'rgba(254,252,244,0.9)', backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: 'var(--radius-lg)', padding: '0.875rem 1.25rem',
                boxShadow: 'var(--shadow-warm)', animation: 'float 3s ease-in-out infinite',
              }}>
                <div style={{ fontWeight: 800, fontFamily: 'Plus Jakarta Sans', fontSize: '1.125rem', color: 'var(--primary)' }}>⭐ 4.9</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>512 reviews</div>
              </div>
              <div style={{
                position: 'absolute', top: '8%', right: '-8%',
                background: 'rgba(254,252,244,0.9)', backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: 'var(--radius-lg)', padding: '0.875rem 1.25rem',
                boxShadow: 'var(--shadow-warm)', animation: 'float 3s ease-in-out infinite 1.5s',
              }}>
                <div style={{ fontWeight: 800, fontFamily: 'Plus Jakarta Sans', fontSize: '1.125rem' }}>🚀 40 min</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>Avg delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" style={{ background: 'var(--surface-container-low)' }}>
        <div className="container">
          <h2 className="section-title text-center">Browse by Category</h2>
          <p className="section-subtitle text-center">Find your perfect slice</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
            {categories.map(cat => (
              <Link key={cat.label} to={`/menu?category=${cat.label}`} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                padding: '2rem 1.5rem', borderRadius: 'var(--radius-xl)',
                background: cat.bg, border: `1.5px solid ${cat.color}22`,
                textDecoration: 'none', transition: 'var(--transition)', cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${cat.color}20`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ fontSize: '3rem', lineHeight: 1 }}>{cat.icon}</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '1.125rem', color: cat.color }}>{cat.label}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>{cat.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pizzas */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="section-title">Our Top Picks 🔥</h2>
              <p style={{ color: 'var(--on-surface-variant)' }}>Handpicked favourites loved by thousands</p>
            </div>
            <Link to="/menu" className="btn btn-secondary">View All Menu →</Link>
          </div>
          {loading ? (
            <div className="pizza-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="skeleton" style={{ height: 18, width: '60%' }} />
                    <div className="skeleton" style={{ height: 14, width: '90%' }} />
                    <div className="skeleton" style={{ height: 14, width: '75%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pizza-grid">
              {featured.map(p => <PizzaCard key={p._id} pizza={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '5rem 0', background: 'var(--on-surface)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 50%, rgba(202,0,44,0.3), transparent 60%), radial-gradient(circle at 80% 50%, rgba(255,117,119,0.15), transparent 60%)', pointerEvents: 'none' }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: '#fefcf4', fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 800, marginBottom: '1rem' }}>
            First Order? Get 50% Off!
          </h2>
          <p style={{ color: 'rgba(254,252,244,0.7)', fontSize: '1.0625rem', marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
            Use code <strong style={{ color: '#ff7577', letterSpacing: '0.05em' }}>FIRST50</strong> at checkout and enjoy half off on your first order.
          </p>
          <Link to="/menu" className="btn btn-primary btn-lg" style={{ background: 'rgba(254,252,244,0.15)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(254,252,244,0.3)', color: '#fefcf4' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(254,252,244,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(254,252,244,0.15)'; }}>
            Claim Your Offer 🍕
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ background: 'var(--surface-container-low)' }}>
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <p className="section-subtitle text-center" style={{ marginBottom: '3rem' }}>Hot pizza, just 3 steps away</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', maxWidth: 900, margin: '0 auto' }}>
            {[
              { step: '01', icon: '🍕', title: 'Choose Your Pizza', desc: 'Browse our menu and pick your favourite' },
              { step: '02', icon: '⚙️', title: 'Customize It', desc: 'Or build your own from scratch!', link: '/build' },
              { step: '03', icon: '🚴', title: 'We Deliver', desc: 'Hot pizza arrives in 40 minutes' },
            ].map(item => (
              <div key={item.step} style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '2.5rem', color: 'rgba(202,0,44,0.12)', marginBottom: '0.5rem' }}>{item.step}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: item.link ? '1rem' : 0 }}>{item.desc}</p>
                {item.link && <Link to={item.link} className="btn btn-secondary btn-sm">Build Yours →</Link>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
