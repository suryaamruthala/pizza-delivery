import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SIZE_LABELS = { S: 'Small', M: 'Medium', L: 'Large' };

export default function PizzaCard({ pizza }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [size, setSize] = useState('M');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [qty, setQty] = useState(1);

  const toggleTopping = (t) => {
    setSelectedToppings(prev =>
      prev.find(x => x.name === t.name) ? prev.filter(x => x.name !== t.name) : [...prev, t]
    );
  };

  const totalPrice = (pizza.sizes[size] + selectedToppings.reduce((s, t) => s + t.price, 0)) * qty;

  const handleAdd = () => {
    if (!user) { navigate('/login'); return; }
    addItem(pizza, size, selectedToppings, qty);
    setShowModal(false);
    setSize('M'); setSelectedToppings([]); setQty(1);
  };

  const categoryColor = pizza.category === 'Veg' ? 'chip-veg' : pizza.category === 'Non-Veg' ? 'chip-nonveg' : 'chip-special';

  return (
    <>
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Image */}
        <div style={{ position: 'relative', paddingTop: '65%', overflow: 'hidden', background: 'var(--surface-container)' }}>
          <img src={pizza.image} alt={pizza.name} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
          }} onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600'; }} />
          {pizza.isFeatured && (
            <div style={{
              position: 'absolute', top: '0.75rem', left: '0.75rem',
              background: 'var(--primary-gradient)', color: '#fff',
              padding: '0.25rem 0.75rem', borderRadius: '9999px',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em',
              boxShadow: '0 4px 12px rgba(202,0,44,0.35)',
            }}>⭐ FEATURED</div>
          )}
          <div style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            background: 'rgba(254,252,244,0.85)', backdropFilter: 'blur(8px)',
            padding: '0.25rem 0.625rem', borderRadius: '9999px',
            fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem',
          }}>
            ⭐ {pizza.rating}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className={`chip no-hover ${categoryColor}`}>{pizza.category}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
              {pizza.reviews} reviews
            </span>
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.3 }}>
            {pizza.name}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, flex: 1 }}>
            {pizza.description.length > 80 ? pizza.description.slice(0, 80) + '…' : pizza.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>from</span>
              <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)' }}>
                ₹{pizza.basePrice}
              </div>
            </div>
            <button
              id={`add-${pizza._id}`}
              onClick={() => setShowModal(true)}
              className="btn btn-primary btn-sm"
            >+ Add</button>
          </div>
        </div>
      </div>

      {/* Customize Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800 }}>{pizza.name}</h2>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{pizza.category}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ fontSize: '1.375rem', padding: '0.25rem', color: 'var(--on-surface-variant)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <img src={pizza.image} alt={pizza.name} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600'; }} />

            {/* Size */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'Plus Jakarta Sans' }}>Choose Size</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
                {Object.entries(pizza.sizes).map(([s, price]) => (
                  <button key={s} onClick={() => setSize(s)} style={{
                    padding: '0.875rem', borderRadius: 'var(--radius-lg)',
                    border: '2px solid', borderColor: size === s ? 'var(--primary)' : 'var(--surface-container-high)',
                    background: size === s ? 'rgba(202,0,44,0.05)' : 'var(--surface-container)',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: size === s ? 'var(--primary)' : 'var(--on-surface)' }}>{SIZE_LABELS[s]}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: '0.125rem' }}>₹{price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Toppings */}
            {pizza.toppings?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'Plus Jakarta Sans' }}>Extra Toppings <span style={{ fontWeight: 400, fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>(optional)</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {pizza.toppings.map(t => {
                    const selected = selectedToppings.find(x => x.name === t.name);
                    return (
                      <button key={t.name} onClick={() => toggleTopping(t)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                        border: '2px solid', borderColor: selected ? 'var(--primary)' : 'var(--surface-container-high)',
                        background: selected ? 'rgba(202,0,44,0.04)' : 'var(--surface-container)',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                        <span style={{ fontWeight: 500, color: 'var(--on-surface)' }}>{t.name}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selected ? 'var(--primary)' : 'var(--on-surface-variant)', fontWeight: 600 }}>
                          +₹{t.price}
                          {selected ? '✓' : '+'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: 700, fontFamily: 'Plus Jakarta Sans' }}>Quantity</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--surface-container)', borderRadius: '9999px', padding: '0.25rem' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 32, height: 32, borderRadius: '50%', background: qty > 1 ? 'var(--primary)' : 'var(--surface-container-high)', color: qty > 1 ? '#fff' : 'var(--outline)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1.125rem', transition: 'all 0.2s' }}>−</button>
                <span style={{ fontWeight: 700, fontSize: '1.125rem', minWidth: 24, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1.125rem', transition: 'all 0.2s' }}>+</button>
              </div>
            </div>

            <button onClick={handleAdd} className="btn btn-primary w-full btn-lg" id={`confirm-add-${pizza._id}`}>
              Add to Cart — ₹{totalPrice}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
