import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const STATUS_OPTIONS = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
const STATUS_COLORS = {
  Placed: '#b45309', Confirmed: '#1d4ed8', Preparing: '#7b4db4',
  'Out for Delivery': '#ca002c', Delivered: '#2d7d46', Cancelled: '#6b7280',
};

const CATEGORY_ICONS = { base: '🫓', sauce: '🍅', cheese: '🧀', veggies: '🥦', meat: '🥩' };
const CATEGORY_LABELS = { base: 'Pizza Base', sauce: 'Sauce', cheese: 'Cheese', veggies: 'Vegetables', meat: 'Meat' };

export default function Admin() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pizzas, setPizzas] = useState([]);
  const [users, setUsers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pizzaForm, setPizzaForm] = useState(null);
  const [userForm, setUserForm] = useState(null);
  const [restockForm, setRestockForm] = useState(null); // { item, amount }
  const [editQtyForm, setEditQtyForm] = useState(null); // { item, quantity, threshold }
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { if (!isAdmin) navigate('/'); }, [isAdmin]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, pizzasRes, usersRes, invRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/orders'),
        axios.get('/api/pizzas'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/inventory'),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setPizzas(pizzasRes.data);
      setUsers(usersRes.data);
      setInventory(invRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      showToast(`Order status updated to ${status}`);
    } catch { showToast('Failed to update status'); }
  };

  const handleDeletePizza = async (id) => {
    if (!confirm('Delete this pizza?')) return;
    await axios.delete(`/api/pizzas/${id}`);
    setPizzas(prev => prev.filter(p => p._id !== id));
    showToast('Pizza deleted');
  };

  const handleSavePizza = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (pizzaForm._id) {
        const { data } = await axios.put(`/api/pizzas/${pizzaForm._id}`, pizzaForm);
        setPizzas(prev => prev.map(p => p._id === data._id ? data : p));
      } else {
        const { data } = await axios.post('/api/pizzas', pizzaForm);
        setPizzas(prev => [...prev, data]);
      }
      setPizzaForm(null);
      showToast('Pizza saved successfully!');
    } catch (err) { showToast(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      showToast('User deleted successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post('/api/admin/users', userForm);
      setUsers(prev => [data, ...prev]);
      setUserForm(null);
      showToast('User created successfully!');
    } catch (err) { showToast(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  // ── Inventory handlers ────────────────────────────────────────────────────
  const handleRestock = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post(`/api/admin/inventory/${restockForm.item._id}/restock`, { amount: Number(restockForm.amount) });
      setInventory(prev => prev.map(i => i._id === data._id ? data : i));
      setRestockForm(null);
      showToast(`${data.name} restocked to ${data.quantity} ${data.unit}`);
    } catch (err) { showToast(err.response?.data?.message || 'Restock failed'); }
    finally { setSaving(false); }
  };

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put(`/api/admin/inventory/${editQtyForm.item._id}`, {
        quantity: Number(editQtyForm.quantity),
        threshold: Number(editQtyForm.threshold),
      });
      setInventory(prev => prev.map(i => i._id === data._id ? data : i));
      setEditQtyForm(null);
      showToast(`${data.name} updated`);
    } catch (err) { showToast(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  // Stock status helpers
  const stockStatus = (item) => {
    if (item.quantity < item.threshold) return 'critical';
    if (item.quantity < item.threshold * 1.5) return 'low';
    return 'ok';
  };
  const stockColor = { critical: '#ca002c', low: '#b45309', ok: '#2d7d46' };
  const stockBg = { critical: 'rgba(202,0,44,0.08)', low: 'rgba(180,83,9,0.08)', ok: 'rgba(45,125,70,0.08)' };
  const stockLabel = { critical: '🔴 Critical', low: '🟡 Low', ok: '🟢 OK' };

  const lowStockItems = inventory.filter(i => stockStatus(i) !== 'ok');

  const emptyPizza = {
    name: '', description: '', category: 'Veg', basePrice: 299,
    sizes: { S: 299, M: 399, L: 499 },
    image: '', isFeatured: false, isAvailable: true, toppings: [],
  };

  const emptyUser = { name: '', email: '', password: '', role: 'user', isVerified: true };

  const tabs = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'orders', icon: '📦', label: 'Orders' },
    { key: 'inventory', icon: '🏪', label: 'Inventory' },
    { key: 'pizzas', icon: '🍕', label: 'Pizzas' },
    { key: 'users', icon: '👥', label: 'Users' },
  ];

  const statCards = stats ? [
    { icon: '📦', label: 'Total Orders', value: stats.totalOrders, color: '#1d4ed8' },
    { icon: '💰', label: 'Total Revenue', value: `₹${stats.totalRevenue?.toLocaleString()}`, color: '#2d7d46' },
    { icon: '👥', label: 'Total Users', value: stats.totalUsers, color: '#7b4db4' },
    { icon: '🍕', label: 'Menu Items', value: stats.totalPizzas, color: 'var(--primary)' },
  ] : [];

  return (
    <div className="page" style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-container-low)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, background: 'var(--on-surface)',
        position: 'fixed', top: 72, bottom: 0, left: 0, zIndex: 100,
        display: 'flex', flexDirection: 'column', padding: '1.5rem 0.875rem',
        overflowY: 'auto',
      }}>
        <div style={{ marginBottom: '1.5rem', paddingLeft: '0.625rem' }}>
          <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#fefcf4', fontSize: '1rem' }}>Admin Panel</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(254,252,244,0.5)', marginTop: '0.125rem' }}>SliceStream Management</div>
        </div>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '0.375rem',
            background: tab === t.key ? 'rgba(202,0,44,0.25)' : 'transparent',
            border: 'none', cursor: 'pointer', textAlign: 'left',
            color: tab === t.key ? '#ff7577' : 'rgba(254,252,244,0.65)',
            fontWeight: tab === t.key ? 700 : 500, fontSize: '0.9375rem',
            transition: 'all 0.2s', position: 'relative',
          }}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.key === 'inventory' && lowStockItems.length > 0 && (
              <span style={{ marginLeft: 'auto', background: '#ca002c', color: '#fff', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.45rem', minWidth: 18, textAlign: 'center' }}>
                {lowStockItems.length}
              </span>
            )}
          </button>
        ))}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 240, padding: '2.5rem', minHeight: '100vh' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* ── DASHBOARD ────────────────────────────────────────────────── */}
            {tab === 'dashboard' && (
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>Dashboard</h1>
                <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>Overview of SliceStream operations</p>

                {/* Low stock banner */}
                {lowStockItems.length > 0 && (
                  <div onClick={() => setTab('inventory')} style={{
                    background: 'rgba(202,0,44,0.06)', border: '1.5px solid rgba(202,0,44,0.25)',
                    borderRadius: 'var(--radius-lg)', padding: '0.875rem 1.25rem',
                    marginBottom: '1.5rem', display: 'flex', alignItems: 'center',
                    gap: '0.75rem', cursor: 'pointer',
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>🚨</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {lowStockItems.length} ingredient{lowStockItems.length > 1 ? 's' : ''} running low:{' '}
                      {lowStockItems.map(i => i.name).join(', ')}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>
                      View Inventory →
                    </span>
                  </div>
                )}

                <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
                  {statCards.map(s => (
                    <div key={s.label} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{s.icon}</div>
                      <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1.75rem', color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {stats?.revenueByDay?.length > 0 && (
                  <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1.5rem' }}>Revenue — Last 7 Days</h2>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={stats.revenueByDay} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container-high)" vertical={false} />
                        <XAxis dataKey="_id" tick={{ fontSize: 12, fill: 'var(--on-surface-variant)' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: 'var(--on-surface-variant)' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                        <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />
                        <Bar dataKey="revenue" fill="url(#redGradient)" radius={[6, 6, 0, 0]} />
                        <defs>
                          <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ca002c" />
                            <stop offset="100%" stopColor="#ff7577" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
                  <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1.5rem' }}>Recent Orders</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {stats?.recentOrders?.map(o => (
                      <div key={o._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>#{o._id.slice(-8).toUpperCase()} — {o.user?.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '0.125rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, background: `${STATUS_COLORS[o.status]}18`, color: STATUS_COLORS[o.status] }}>{o.status}</span>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{o.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── ORDERS ───────────────────────────────────────────────────── */}
            {tab === 'orders' && (
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '2rem' }}>Orders Management</h1>
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-container)' }}>
                        {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Action'].map(h => (
                          <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.875rem', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, i) => (
                        <tr key={o._id} style={{ borderTop: '1px solid var(--surface-container-high)', background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-container-low)' }}>
                          <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>#{o._id.slice(-8).toUpperCase()}</td>
                          <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, fontSize: '0.9rem' }}>{o.user?.name || '—'}</td>
                          <td style={{ padding: '0.875rem 1.25rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</td>
                          <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: 'var(--primary)' }}>₹{o.total}</td>
                          <td style={{ padding: '0.875rem 1.25rem' }}>
                            <span style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, background: `${STATUS_COLORS[o.status]}18`, color: STATUS_COLORS[o.status] }}>{o.status}</span>
                          </td>
                          <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8rem', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                          <td style={{ padding: '0.875rem 1.25rem' }}>
                            <select value={o.status} onChange={e => updateOrderStatus(o._id, e.target.value)} style={{ padding: '0.375rem 0.625rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--surface-container-high)', background: 'var(--surface)', fontSize: '0.8125rem', cursor: 'pointer', color: 'var(--on-surface)' }}>
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── INVENTORY ────────────────────────────────────────────────── */}
            {tab === 'inventory' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.25rem' }}>Inventory Management</h1>
                    <p style={{ color: 'var(--on-surface-variant)' }}>Track ingredients and get alerted when stock is low</p>
                  </div>
                  <button onClick={loadData} className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>↻ Refresh</button>
                </div>

                {/* Stock cards grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                  {inventory.map(item => {
                    const status = stockStatus(item);
                    const pct = Math.min(100, (item.quantity / (item.threshold * 5)) * 100);
                    return (
                      <div key={item._id} style={{
                        background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
                        padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
                        border: status === 'critical' ? '1.5px solid rgba(202,0,44,0.3)' : status === 'low' ? '1.5px solid rgba(180,83,9,0.25)' : '1.5px solid var(--surface-container-high)',
                      }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>{CATEGORY_ICONS[item.category]}</span>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'capitalize' }}>{item.category}</div>
                            </div>
                          </div>
                          <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: stockBg[status], color: stockColor[status] }}>
                            {stockLabel[status]}
                          </span>
                        </div>

                        {/* Quantity display */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '2rem', color: stockColor[status] }}>{item.quantity.toLocaleString()}</span>
                          <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>{item.unit}</span>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: 6, borderRadius: 9999, background: 'var(--surface-container-high)', marginBottom: '0.5rem', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 9999, width: `${pct}%`, background: stockColor[status], transition: 'width 0.4s ease' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '1.25rem' }}>
                          <span>Threshold: {item.threshold} {item.unit}</span>
                          <span>Per pizza: -{item.deductPerPizza} {item.unit}</span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setRestockForm({ item, amount: '' })}
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1, fontSize: '0.8125rem' }}
                          >
                            + Restock
                          </button>
                          <button
                            onClick={() => setEditQtyForm({ item, quantity: item.quantity, threshold: item.threshold })}
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1, fontSize: '0.8125rem' }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Deduction legend */}
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Deduction Logic per Order</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: 'Pizza Base', note: 'All pizzas — 1 unit each', icon: '🫓' },
                      { label: 'Tomato Sauce', note: 'All pizzas — 150 ml each', icon: '🍅' },
                      { label: 'Cheese', note: 'All pizzas — 100 g each', icon: '🧀' },
                      { label: 'Vegetables', note: 'Veg & Specials — 80 g each', icon: '🥦' },
                      { label: 'Meat & Protein', note: 'Non-Veg only — 120 g each', icon: '🥩' },
                    ].map(r => (
                      <div key={r.label} style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.25rem' }}>{r.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.label}</div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--on-surface-variant)', marginTop: '0.125rem' }}>{r.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PIZZAS ───────────────────────────────────────────────────── */}
            {tab === 'pizzas' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Pizza Management</h1>
                  <button onClick={() => setPizzaForm({ ...emptyPizza })} className="btn btn-primary">+ Add Pizza</button>
                </div>
                <div className="pizza-grid">
                  {pizzas.map(p => (
                    <div key={p._id} className="card" style={{ position: 'relative' }}>
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: 160, objectFit: 'cover' }}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'; }} />
                      <div style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{p.name}</h3>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: p.isAvailable ? 'rgba(45,125,70,0.1)' : 'rgba(107,114,128,0.1)', color: p.isAvailable ? 'var(--success)' : 'var(--outline)' }}>{p.isAvailable ? 'Live' : 'Hidden'}</span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginBottom: '0.875rem' }}>{p.category} • ₹{p.basePrice}</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => setPizzaForm({ ...p })} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '0.8125rem' }}>Edit</button>
                          <button onClick={() => handleDeletePizza(p._id)} className="btn btn-sm" style={{ background: 'rgba(190,45,6,0.08)', color: 'var(--error)', flex: 1, fontSize: '0.8125rem', borderRadius: '9999px', padding: '0.5rem 1.25rem' }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── USERS ────────────────────────────────────────────────────── */}
            {tab === 'users' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>User Management</h1>
                  <button onClick={() => setUserForm({ ...emptyUser })} className="btn btn-primary">+ Add User</button>
                </div>
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-container)' }}>
                        {['Name', 'Email', 'Phone', 'Address', 'Joined', 'Action'].map(h => (
                          <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u._id} style={{ borderTop: '1px solid var(--surface-container-high)', background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-container-low)' }}>
                          <td style={{ padding: '1rem', borderBottom: '1px solid var(--surface-container-high)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>{u.name?.[0]?.toUpperCase()}</div>
                            {u.name}
                          </td>
                          <td style={{ padding: '0.875rem 1.25rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>{u.email}</td>
                          <td style={{ padding: '0.875rem 1.25rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>{u.phone || '—'}</td>
                          <td style={{ padding: '0.875rem 1.25rem', color: 'var(--on-surface-variant)', fontSize: '0.85rem', maxWidth: 200 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address || '—'}</div></td>
                          <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8rem', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                          <td style={{ padding: '0.875rem 1.25rem' }}>
                            <button onClick={() => handleDeleteUser(u._id)} style={{ background: 'rgba(190,45,6,0.08)', color: 'var(--error)', border: 'none', borderRadius: 'var(--radius-md)', padding: '0.375rem 0.625rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Pizza Form Modal ──────────────────────────────────────────────────── */}
      {pizzaForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPizzaForm(null)}>
          <div className="modal" style={{ maxWidth: 580, maxHeight: '92vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800 }}>{pizzaForm._id ? 'Edit Pizza' : 'Add New Pizza'}</h2>
              <button onClick={() => setPizzaForm(null)} style={{ fontSize: '1.375rem', color: 'var(--on-surface-variant)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleSavePizza} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name *</label>
                  <input className="input" value={pizzaForm.name} onChange={e => setPizzaForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category *</label>
                  <select className="input" value={pizzaForm.category} onChange={e => setPizzaForm(f => ({ ...f, category: e.target.value }))}>
                    {['Veg', 'Non-Veg', 'Specials'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Base Price (₹)</label>
                  <input className="input" type="number" value={pizzaForm.basePrice} onChange={e => setPizzaForm(f => ({ ...f, basePrice: +e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Small (₹)</label>
                  <input className="input" type="number" value={pizzaForm.sizes?.S} onChange={e => setPizzaForm(f => ({ ...f, sizes: { ...f.sizes, S: +e.target.value } }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Medium (₹)</label>
                  <input className="input" type="number" value={pizzaForm.sizes?.M} onChange={e => setPizzaForm(f => ({ ...f, sizes: { ...f.sizes, M: +e.target.value } }))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Large (₹)</label>
                  <input className="input" type="number" value={pizzaForm.sizes?.L} onChange={e => setPizzaForm(f => ({ ...f, sizes: { ...f.sizes, L: +e.target.value } }))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Description *</label>
                  <textarea className="input" rows={2} value={pizzaForm.description} onChange={e => setPizzaForm(f => ({ ...f, description: e.target.value }))} required style={{ resize: 'vertical' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Image URL</label>
                  <input className="input" value={pizzaForm.image} onChange={e => setPizzaForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="checkbox" id="featured" checked={pizzaForm.isFeatured} onChange={e => setPizzaForm(f => ({ ...f, isFeatured: e.target.checked }))} />
                  <label htmlFor="featured" style={{ fontWeight: 600, cursor: 'pointer' }}>Featured</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="checkbox" id="available" checked={pizzaForm.isAvailable} onChange={e => setPizzaForm(f => ({ ...f, isAvailable: e.target.checked }))} />
                  <label htmlFor="available" style={{ fontWeight: 600, cursor: 'pointer' }}>Available</label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setPizzaForm(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                  {saving ? 'Saving…' : (pizzaForm._id ? 'Update Pizza' : 'Add Pizza')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── User Form Modal ───────────────────────────────────────────────────── */}
      {userForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setUserForm(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Add New User</h2>
              <button onClick={() => setUserForm(null)} style={{ fontSize: '1.375rem', color: 'var(--on-surface-variant)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name *</label>
                <input className="input" value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email Address *</label>
                <input className="input" type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Temporary Password</label>
                <input className="input" type="text" placeholder="Defaults to 'user123'" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Role</label>
                <select className="input" value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                <input type="checkbox" id="userVerified" checked={userForm.isVerified} onChange={e => setUserForm(f => ({ ...f, isVerified: e.target.checked }))} />
                <label htmlFor="userVerified" style={{ fontWeight: 600, cursor: 'pointer' }}>Mark as instantly Verified</label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setUserForm(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                  {saving ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Restock Modal ─────────────────────────────────────────────────────── */}
      {restockForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setRestockForm(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Restock {restockForm.item.name}</h2>
              <button onClick={() => setRestockForm(null)} style={{ fontSize: '1.375rem', color: 'var(--on-surface-variant)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem', marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
              Current stock: <strong style={{ color: 'var(--on-surface)' }}>{restockForm.item.quantity} {restockForm.item.unit}</strong>
            </div>
            <form onSubmit={handleRestock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Amount to Add ({restockForm.item.unit}) *
                </label>
                <input
                  className="input" type="number" min="1" required
                  value={restockForm.amount}
                  onChange={e => setRestockForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder={`e.g. 100 ${restockForm.item.unit}`}
                  autoFocus
                />
              </div>
              {restockForm.amount > 0 && (
                <div style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>
                  New total: {Number(restockForm.item.quantity) + Number(restockForm.amount)} {restockForm.item.unit}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button type="button" onClick={() => setRestockForm(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                  {saving ? 'Restocking…' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Inventory Modal ──────────────────────────────────────────────── */}
      {editQtyForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditQtyForm(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Edit {editQtyForm.item.name}</h2>
              <button onClick={() => setEditQtyForm(null)} style={{ fontSize: '1.375rem', color: 'var(--on-surface-variant)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleUpdateInventory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Current Quantity ({editQtyForm.item.unit})
                </label>
                <input
                  className="input" type="number" min="0" required
                  value={editQtyForm.quantity}
                  onChange={e => setEditQtyForm(f => ({ ...f, quantity: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Low-Stock Threshold ({editQtyForm.item.unit})
                </label>
                <input
                  className="input" type="number" min="1" required
                  value={editQtyForm.threshold}
                  onChange={e => setEditQtyForm(f => ({ ...f, threshold: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button type="button" onClick={() => setEditQtyForm(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className="toast success">{toast}</div>
        </div>
      )}
    </div>
  );
}
