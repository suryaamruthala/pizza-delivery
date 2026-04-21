import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const STATUS_STEPS = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
const STATUS_ICONS = { Placed: '📋', Confirmed: '✅', Preparing: '👨‍🍳', 'Out for Delivery': '🛵', Delivered: '🎉' };

export default function OrderTracking() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    const fetchOrder = () => {
      axios.get(`/api/orders/${id}`)
        .then(r => setOrder(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    if (!order) fetchOrder();
    // Poll every 15 seconds
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--on-surface-variant)' }}>Loading your order…</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
        <h2>Order not found</h2>
      </div>
    </div>
  );

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';

  const eta = order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, #fff8f0 0%, var(--surface) 60%)', padding: '3rem 0 2.5rem' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Order Tracking</h1>
              <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.25rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>#{order._id?.slice(-8).toUpperCase()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>Estimated Delivery</div>
              <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '1.5rem', color: 'var(--primary)' }}>{eta}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2.5rem', alignItems: 'start' }}>
          {/* Left — Status */}
          <div>
            {/* Current status banner */}
            <div style={{
              background: isCancelled ? 'rgba(107,114,128,0.08)' : 'linear-gradient(135deg, rgba(202,0,44,0.06), rgba(255,117,119,0.06))',
              border: `1.5px solid ${isCancelled ? 'rgba(107,114,128,0.2)' : 'rgba(202,0,44,0.15)'}`,
              borderRadius: 'var(--radius-xl)', padding: '2rem', marginBottom: '2rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>{STATUS_ICONS[order.status] || '📦'}</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: isCancelled ? '#6b7280' : 'var(--primary)', marginBottom: '0.25rem' }}>
                {order.status}
              </h2>
              {!isCancelled && order.status !== 'Delivered' && (
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9375rem' }}>
                  Your order is on its way! Estimated arrival by {eta}.
                </p>
              )}
              {order.status === 'Delivered' && (
                <p style={{ color: 'var(--success)', fontWeight: 600 }}>Enjoy your pizza! 🍕</p>
              )}
            </div>

            {/* Progress steps */}
            {!isCancelled && (
              <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '2rem', fontSize: '1.125rem' }}>Order Progress</h3>
                <div style={{ position: 'relative' }}>
                  {/* Progress line */}
                  <div style={{
                    position: 'absolute', left: 19, top: 24, bottom: 24, width: 2,
                    background: 'var(--surface-container-high)', zIndex: 0,
                  }} />
                  <div style={{
                    position: 'absolute', left: 19, top: 24,
                    width: 2, zIndex: 1,
                    height: currentStep > 0 ? `${Math.min(currentStep / (STATUS_STEPS.length - 1) * 100, 100)}%` : 0,
                    background: 'var(--primary-gradient)',
                    transition: 'height 0.5s ease',
                  }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'relative', zIndex: 2 }}>
                    {STATUS_STEPS.map((step, i) => {
                      const done = i <= currentStep;
                      const active = i === currentStep;
                      return (
                        <div key={step} style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                            background: done ? 'var(--primary-gradient)' : 'var(--surface-container-high)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.125rem',
                            boxShadow: active ? '0 0 0 4px rgba(202,0,44,0.15), 0 4px 12px rgba(202,0,44,0.25)' : 'none',
                            transition: 'all 0.3s',
                          }}>
                            {STATUS_ICONS[step]}
                          </div>
                          <div>
                            <div style={{ fontWeight: done ? 700 : 500, color: done ? 'var(--on-surface)' : 'var(--outline)', fontSize: '1rem', transition: 'color 0.3s' }}>{step}</div>
                            {order.statusHistory?.find(h => h.status === step) && (
                              <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: '0.125rem' }}>
                                {new Date(order.statusHistory.find(h => h.status === step).timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right — Order details */}
          <div style={{ position: 'sticky', top: '6rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1.0625rem' }}>Items Ordered</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {order.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    {item.image && (
                      <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                        onError={e => { e.target.style.display = 'none'; }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Size: {item.size} × {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'Plus Jakarta Sans' }}>₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.0625rem' }}>Bill Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  ['Subtotal', `₹${order.subtotal}`],
                  ...(order.discount > 0 ? [[`Discount`, `-₹${order.discount}`, 'var(--success)']] : []),
                  ['Delivery', order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
                    <span>{label}</span><span style={color ? { color } : {}}>{val}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'var(--surface-container-high)', margin: '0.25rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontFamily: 'Plus Jakarta Sans' }}>
                  <span>Total Paid</span><span style={{ color: 'var(--primary)' }}>₹{order.total}</span>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.0625rem' }}>Delivery Info</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>📍 {order.deliveryAddress}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginTop: '0.375rem' }}>📞 {order.phone}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginTop: '0.375rem' }}>💳 {order.paymentMethod}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
