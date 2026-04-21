import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const COUPONS = { SLICE10: 10, PIZZA20: 20, FIRST50: 50 };

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [payment, setPayment] = useState('COD');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const discount = couponApplied ? Math.round((subtotal * couponApplied.discount) / 100) : 0;
  const deliveryFee = subtotal > 500 ? 0 : 49;
  const total = subtotal - discount + deliveryFee;

  const applyCoupon = async () => {
    try {
      const { data } = await axios.post('/api/orders/validate-coupon', { coupon });
      setCouponApplied(data);
      setCouponError('');
    } catch {
      setCouponError('Invalid or expired coupon');
      setCouponApplied(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) return setError('Delivery address is required');
    if (!phone.trim()) return setError('Phone number is required');
    setLoading(true);
    setError('');
    try {
      const orderItems = items.map(i => ({
        pizza: i.pizza,
        name: i.name,
        image: i.image,
        size: i.size,
        toppings: i.toppings,
        quantity: i.quantity,
        price: i.price,
      }));

      if (payment === 'Online') {
        const { data: rzpOrder } = await axios.post('/api/payment/razorpay-order', { amount: total });

        const options = {
          key: "rzp_test_SfsAzXSgwXCLlx", // Hardcoding front end key since this is a MERN tutorial scope
          amount: rzpOrder.amount,
          currency: "INR",
          name: "SliceStream Pizza",
          description: "Premium Pizza Delivery",
          order_id: rzpOrder.id,
          handler: async function (response) {
            try {
              // Verify payment on our backend
              await axios.post('/api/payment/verify', response);
              
              // Place the final 'Confirmed' order
              const { data } = await axios.post('/api/orders', {
                items: orderItems,
                deliveryAddress: address,
                phone,
                paymentMethod: payment,
                coupon: couponApplied?.code || '',
              });
              clearCart();
              navigate(`/track/${data._id}`, { state: { order: data } });
            } catch (err) {
              setLoading(false);
              setError(err.response?.data?.message || 'Payment Verification Failed');
            }
          },
          prefill: {
            name: user?.name || "Customer",
            email: user?.email || "customer@example.com",
            contact: phone
          },
          theme: {
            color: "#CA002C"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
          setLoading(false);
          setError(response.error.description);
        });
        rzp.open();
      } else {
        // Cash on Delivery
        const { data } = await axios.post('/api/orders', {
          items: orderItems,
          deliveryAddress: address,
          phone,
          paymentMethod: payment,
          coupon: couponApplied?.code || '',
        });
        clearCart();
        navigate(`/track/${data._id}`, { state: { order: data } });
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to place order');
    }
  };

  if (items.length === 0) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h2>Your cart is empty</h2>
          <button onClick={() => navigate('/menu')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, #fff8f0 0%, var(--surface) 60%)', padding: '3rem 0 2.5rem' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Checkout 🛒</h1>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>Almost there! Review your order below.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2.5rem', alignItems: 'start' }}>
          {/* Left — Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Delivery Details */}
            <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📍 Delivery Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Full Address *</label>
                  <textarea id="address-input" value={address} onChange={e => setAddress(e.target.value)} className="input" rows={3}
                    placeholder="House No., Street, Area, City, PIN" style={{ resize: 'vertical' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Phone Number *</label>
                  <input id="phone-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input"
                    placeholder="+91 XXXXX XXXXX" required />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>💳 Payment Method</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[['COD', '💵 Cash on Delivery', 'Pay when your pizza arrives'], ['Online', '🏦 Online Payment', 'UPI, Cards, Net Banking (Mock)']].map(([val, label, sub]) => (
                  <button key={val} type="button" onClick={() => setPayment(val)} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-lg)', border: '2px solid',
                    borderColor: payment === val ? 'var(--primary)' : 'var(--surface-container-high)',
                    background: payment === val ? 'rgba(202,0,44,0.04)' : 'var(--surface-container)',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      border: `2px solid ${payment === val ? 'var(--primary)' : 'var(--outline)'}`,
                      background: payment === val ? 'var(--primary)' : 'transparent',
                      flexShrink: 0, transition: 'all 0.2s',
                    }} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: '0.9375rem' }}>{label}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: '0.125rem' }}>{sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🎟️ Coupon Code</h2>
              {couponApplied ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'rgba(45,125,70,0.08)', borderRadius: 'var(--radius-lg)', border: '1.5px solid rgba(45,125,70,0.2)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--success)' }}>✓ {couponApplied.code} applied!</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>You save ₹{discount}</div>
                  </div>
                  <button type="button" onClick={() => { setCouponApplied(null); setCoupon(''); }} style={{ fontSize: '0.875rem', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input id="coupon-input" value={coupon} onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError(''); }} className="input" placeholder="Enter coupon code" style={{ flex: 1 }} />
                  <button type="button" onClick={applyCoupon} className="btn btn-secondary" disabled={!coupon}>Apply</button>
                </div>
              )}
              {couponError && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{couponError}</p>}
              <div style={{ marginTop: '0.875rem', fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
                Available: <code style={{ background: 'var(--surface-container)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>SLICE10</code>{' '}
                <code style={{ background: 'var(--surface-container)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>PIZZA20</code>{' '}
                <code style={{ background: 'var(--surface-container)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>FIRST50</code>
              </div>
            </div>

            {error && <div style={{ background: 'rgba(190,45,6,0.08)', border: '1px solid rgba(190,45,6,0.2)', borderRadius: 'var(--radius-lg)', padding: '1rem', color: 'var(--error)', fontWeight: 500 }}>{error}</div>}

            <button id="place-order-btn" type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  Placing Order…
                </span>
              ) : `Place Order — ₹${total}`}
            </button>
          </form>

          {/* Right — Summary */}
          <div style={{ position: 'sticky', top: '6rem' }}>
            <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Order Summary</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <img src={item.image} alt={item.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200'; }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                        {item.size} × {item.quantity}
                        {item.toppings?.length > 0 && <div>{item.toppings.map(t => t.name).join(', ')}</div>}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'Plus Jakarta Sans', flexShrink: 0 }}>₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: 'var(--surface-container-high)', margin: '1.25rem 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  ['Subtotal', `₹${subtotal}`],
                  ...(couponApplied ? [[`Discount (${couponApplied.code})`, `-₹${discount}`, 'var(--success)']] : []),
                  ['Delivery', deliveryFee === 0 ? 'FREE 🎉' : `₹${deliveryFee}`, deliveryFee === 0 ? 'var(--success)' : undefined],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-surface-variant)', fontSize: '0.9375rem' }}>
                    <span>{label}</span><span style={color ? { color } : {}}>{val}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'var(--surface-container-high)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontFamily: 'Plus Jakarta Sans', fontSize: '1.125rem' }}>
                  <span>Total</span><span style={{ color: 'var(--primary)' }}>₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
