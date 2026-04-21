import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { items, removeItem, updateQty, subtotal, count, isOpen, setIsOpen, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const deliveryFee = subtotal > 500 ? 0 : 49;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (!user) { setIsOpen(false); navigate('/login'); return; }
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div onClick={() => setIsOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(56,56,51,0.45)',
          backdropFilter: 'blur(4px)', zIndex: 990,
          animation: 'fadeIn 0.2s ease',
        }} />
      )}

      {/* Drawer */}
      <div id="cart-drawer" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 995,
        width: 'min(420px, 100vw)',
        background: 'var(--surface)',
        boxShadow: '-8px 0 48px rgba(56,56,51,0.12)',
        display: 'flex', flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--surface-container-high)',
          background: 'var(--surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '1.375rem' }}>🛒</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Your Cart</h2>
            {count > 0 && (
              <span style={{
                background: 'var(--primary-gradient)', color: '#fff',
                borderRadius: '9999px', padding: '0.125rem 0.625rem',
                fontSize: '0.8125rem', fontWeight: 700,
              }}>{count} items</span>
            )}
          </div>
          <button onClick={() => setIsOpen(false)} style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-container)',
            border: 'none', cursor: 'pointer', fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'var(--transition)',
          }}>×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {items.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--on-surface-variant)' }}>
              <div style={{ fontSize: '4rem' }}>🍕</div>
              <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>Your cart is empty</div>
              <p style={{ fontSize: '0.875rem', textAlign: 'center' }}>Add some delicious pizzas to get started!</p>
              <button onClick={() => { setIsOpen(false); navigate('/menu'); }} className="btn btn-primary">Browse Menu</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
                  background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)',
                  padding: '0.875rem',
                }}>
                  <img src={item.image} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'; }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: '0.125rem' }}>
                      Size: {item.size}
                      {item.isCustom && item.customDetails ? (
                        <div style={{ marginTop: '0.25rem', padding: '0.4rem', background: 'var(--surface-container)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                          <div style={{ fontStyle: 'italic' }}>{item.customDetails.crust} • {item.customDetails.sauce} • {item.customDetails.cheese}</div>
                          {item.toppings?.length > 0 && <div style={{ marginTop: '0.125rem' }}>+ {item.toppings.map(t => t.name).join(', ')}</div>}
                        </div>
                      ) : (
                        item.toppings?.length > 0 && ` • ${item.toppings.map(t => t.name).join(', ')}`
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.625rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'Plus Jakarta Sans' }}>₹{item.price * item.quantity}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--surface-container-high)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>−</button>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>+</button>
                        <button onClick={() => removeItem(item.id)} style={{ width: 26, height: 26, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '1.25rem', borderTop: '1px solid var(--surface-container-high)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-surface-variant)', fontSize: '0.9375rem' }}>
                <span>Subtotal</span><span>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-surface-variant)', fontSize: '0.9375rem' }}>
                <span>Delivery</span>
                <span style={{ color: deliveryFee === 0 ? 'var(--success)' : 'var(--on-surface-variant)' }}>
                  {deliveryFee === 0 ? 'FREE 🎉' : `₹${deliveryFee}`}
                </span>
              </div>
              {subtotal < 500 && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', background: 'var(--surface-container)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
                  Add ₹{500 - subtotal} more for free delivery!
                </div>
              )}
              <div style={{ height: 1, background: 'var(--surface-container-high)', margin: '0.25rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontFamily: 'Plus Jakarta Sans', fontSize: '1.125rem' }}>
                <span>Total</span><span style={{ color: 'var(--primary)' }}>₹{total}</span>
              </div>
            </div>
            <button onClick={handleCheckout} className="btn btn-primary w-full btn-lg" id="checkout-btn">
              Proceed to Checkout →
            </button>
            <button onClick={clearCart} style={{ width: '100%', marginTop: '0.625rem', padding: '0.5rem', color: 'var(--on-surface-variant)', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>Clear cart</button>
          </div>
        )}
      </div>
    </>
  );
}
