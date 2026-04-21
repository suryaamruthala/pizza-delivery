import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import PizzaCard from '../components/PizzaCard';

const CATEGORIES = ['All', 'Veg', 'Non-Veg', 'Specials'];

export default function Menu() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== 'All') params.category = category;
    if (debouncedSearch) params.search = debouncedSearch;
    axios.get('/api/pizzas', { params })
      .then(r => setPizzas(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, debouncedSearch]);

  const handleCategory = (cat) => {
    setCategory(cat);
    if (cat !== 'All') setSearchParams({ category: cat });
    else setSearchParams({});
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #fff8f0 0%, var(--surface) 60%, #fff0f2 100%)', padding: '3.5rem 0 2.5rem' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            Our <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Menu</span>
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.0625rem', marginBottom: '2rem' }}>
            Freshly crafted pizzas, made to order with premium ingredients.
          </p>

          {/* Search */}
          <div style={{ maxWidth: 520, marginBottom: '1.5rem' }}>
            <div className="input-group">
              <span className="input-icon">🔍</span>
              <input
                id="search-input"
                type="text"
                placeholder="Search pizzas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: '2.75rem' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', fontSize: '1.1rem' }}>×</button>
              )}
            </div>
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} id={`filter-${cat}`} onClick={() => handleCategory(cat)}
                className={`chip ${category === cat ? 'active' : ''}`}
                style={{ fontSize: '0.9375rem', padding: '0.5rem 1.25rem' }}>
                {cat === 'Veg' ? '🥦 ' : cat === 'Non-Veg' ? '🍗 ' : cat === 'Specials' ? '✨ ' : '🍕 '}{cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="section" style={{ paddingTop: '3rem' }}>
        <div className="container">
          {loading ? (
            <div className="pizza-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="skeleton" style={{ height: 18, width: '60%' }} />
                    <div className="skeleton" style={{ height: 14, width: '90%' }} />
                    <div className="skeleton" style={{ height: 40 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : pizzas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--on-surface-variant)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍕</div>
              <h3 style={{ fontSize: '1.375rem', marginBottom: '0.5rem' }}>No pizzas found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.5rem', color: 'var(--on-surface-variant)', fontSize: '0.9375rem' }}>
                Showing <strong>{pizzas.length}</strong> pizza{pizzas.length !== 1 ? 's' : ''}
                {category !== 'All' && <> in <strong>{category}</strong></>}
                {debouncedSearch && <> for "<strong>{debouncedSearch}</strong>"</>}
              </div>
              <div className="pizza-grid">
                {(category === 'All' || category === 'Specials') && !debouncedSearch && (
                  <div className="card" style={{
                    display: 'flex', flexDirection: 'column',
                    background: 'linear-gradient(135deg, var(--on-surface), #3e3e3a)',
                    color: '#fefcf4', padding: '1.5rem', borderRadius: 'var(--radius-xl)',
                    justifyContent: 'center', alignItems: 'center', textAlign: 'center',
                    gap: '1rem', border: 'none', minHeight: 320
                  }}>
                    <div style={{ fontSize: '3.5rem' }}>👨‍🍳</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Build Your Own</h3>
                    <p style={{ fontSize: '0.875rem', opacity: 0.8, lineHeight: 1.5 }}>
                      Can't find what you're looking for? Create your masterpiece from scratch!
                    </p>
                    <Link to="/build" className="btn btn-primary" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }}>
                      Start Building →
                    </Link>
                  </div>
                )}
                {pizzas.map(p => <PizzaCard key={p._id} pizza={p} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
