import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const STATUS_COLORS = {
  Placed: 'status-placed', Confirmed: 'status-confirmed', Preparing: 'status-preparing',
  'Out for Delivery': 'status-out', Delivered: 'status-delivered', Cancelled: 'status-cancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = () => {
      axios.get('/api/orders/my')
        .then(r => setOrders(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    fetchOrders();
    // Poll every 15 seconds so status changes from admin reflect automatically
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--on-surface-variant)' }}>Loading orders…</p>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, #fff8f0, var(--surface))', padding: '3rem 0 2.5rem' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>My Orders 📦</h1>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>Track and manage all your pizza orders.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📦</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>No orders yet</h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>Your order history will appear here.</p>
            <Link to="/menu" className="btn btn-primary btn-lg">Order Your First Pizza 🍕</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map(order => (
              <Link key={order._id} to={`/track/${order._id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '0.375rem' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} — {order.items?.map(i => i.name).join(', ').slice(0, 50)}{order.items?.map(i => i.name).join(', ').length > 50 ? '…' : ''}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <span style={{
                        padding: '0.375rem 1rem', borderRadius: '9999px',
                        fontSize: '0.8125rem', fontWeight: 700,
                        ...(STATUS_COLORS[order.status] ? {} : {}),
                      }} className={STATUS_COLORS[order.status]}>
                        {order.status}
                      </span>
                      <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1.125rem', color: 'var(--primary)' }}>
                        ₹{order.total}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.875rem', borderTop: '1px solid var(--surface-container-high)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                    <span>View Details & Track Order →</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
