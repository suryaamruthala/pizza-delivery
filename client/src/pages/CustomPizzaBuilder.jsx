import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

/* ─── Data ──────────────────────────────────────────────────────────────── */
const SIZES = [
  { key: 'S', label: 'Small', inches: '8"',  basePrice: 199, emoji: '🍕',  desc: 'Perfect for 1' },
  { key: 'M', label: 'Medium', inches: '10"', basePrice: 299, emoji: '🍕',  desc: 'Great for 2' },
  { key: 'L', label: 'Large', inches: '12"',  basePrice: 399, emoji: '🍕',  desc: 'Feeds 3–4' },
];

const CRUSTS = [
  { name: 'Thin Crust',      price: 0,   icon: '🫓', desc: 'Light & crispy' },
  { name: 'Thick Crust',     price: 30,  icon: '🍞', desc: 'Doughy & soft' },
  { name: 'Stuffed Crust',   price: 60,  icon: '🧀', desc: 'Cheese-filled edge' },
  { name: 'Whole Wheat',     price: 20,  icon: '🌾', desc: 'Healthy choice' },
  { name: 'Gluten-Free',     price: 50,  icon: '🌿', desc: 'GF certified' },
];

const SAUCES = [
  { name: 'Classic Tomato',     price: 0,  icon: '🍅', desc: 'Rich & tangy' },
  { name: 'Basil Pesto',        price: 20, icon: '🌿', desc: 'Herby & fresh' },
  { name: 'Smoky BBQ',          price: 20, icon: '🍖', desc: 'Sweet & smoky' },
  { name: 'White Garlic',       price: 20, icon: '🧄', desc: 'Creamy & aromatic' },
  { name: 'Spicy Arrabiata',    price: 15, icon: '🌶️', desc: 'Fiery kick' },
  { name: 'Truffle Cream',      price: 40, icon: '🍄', desc: 'Luxurious & earthy' },
];

const CHEESES = [
  { name: 'Mozzarella',    price: 0,  icon: '🧀', desc: 'Classic stretch' },
  { name: 'Cheddar',       price: 20, icon: '🟡', desc: 'Sharp & rich' },
  { name: 'Gouda',         price: 30, icon: '🔶', desc: 'Smoky & mild' },
  { name: 'Four Cheese',   price: 50, icon: '🫕', desc: 'Ultimate blend' },
  { name: 'Vegan Cheese',  price: 40, icon: '🌱', desc: 'Plant-based' },
  { name: 'No Cheese',     price: 0,  icon: '❌', desc: 'Vegan-friendly' },
];

const TOPPINGS = {
  Veg: [
    { name: 'Bell Peppers',       price: 25, icon: '🫑' },
    { name: 'Mushrooms',          price: 30, icon: '🍄' },
    { name: 'Black Olives',       price: 25, icon: '⚫' },
    { name: 'Sweet Corn',         price: 20, icon: '🌽' },
    { name: 'Cherry Tomatoes',    price: 25, icon: '🍒' },
    { name: 'Red Onion',          price: 15, icon: '🧅' },
    { name: 'Jalapeños',          price: 20, icon: '🌶️' },
    { name: 'Sun-dried Tomatoes', price: 30, icon: '🍅' },
    { name: 'Artichoke',          price: 35, icon: '🥬' },
    { name: 'Baby Spinach',       price: 20, icon: '🥬' },
    { name: 'Paneer',             price: 50, icon: '🟪' },
    { name: 'Pineapple',          price: 25, icon: '🍍' },
  ],
  'Non-Veg': [
    { name: 'Grilled Chicken',   price: 70, icon: '🍗' },
    { name: 'Pepperoni',         price: 65, icon: '🔴' },
    { name: 'Bacon',             price: 70, icon: '🥓' },
    { name: 'Mutton Keema',      price: 80, icon: '🥩' },
    { name: 'Prawns',            price: 90, icon: '🦐' },
    { name: 'Chicken Tikka',     price: 75, icon: '🍢' },
    { name: 'Spicy Sausage',     price: 65, icon: '🌭' },
    { name: 'Smoked Salmon',     price: 95, icon: '🐟' },
  ],
};

const STEPS = ['Size', 'Crust', 'Sauce', 'Cheese', 'Toppings', 'Review'];

/* ─── Pizza Visual Preview ───────────────────────────────────────────────── */
function PizzaPreview({ size, crust, sauce, cheese, toppings }) {
  const sizeScale = size === 'S' ? 0.75 : size === 'L' ? 1.05 : 0.9;
  const sauceColors = {
    'Classic Tomato': 'radial-gradient(circle at 50% 50%, #d32f2f 0%, #b71c1c 80%)',
    'Basil Pesto': 'radial-gradient(circle at 50% 50%, #388e3c 0%, #1b5e20 80%)',
    'Smoky BBQ': 'radial-gradient(circle at 50% 50%, #5d4037 0%, #3e2723 80%)',
    'White Garlic': 'radial-gradient(circle at 50% 50%, #f5f5f5 0%, #e0e0e0 80%)',
    'Spicy Arrabiata': 'radial-gradient(circle at 50% 50%, #e53935 0%, #c62828 80%)',
    'Truffle Cream': 'radial-gradient(circle at 50% 50%, #d7ccc8 0%, #a1887f 80%)',
  };
  const sauceBg = (sauce && sauceColors[sauce.name]) || sauceColors['Classic Tomato'];

  const crustColors = {
    'Thin Crust': 'radial-gradient(circle at 40% 40%, #e8c382 0%, #d49f4e 70%, #a66a28 100%)',
    'Thick Crust': 'radial-gradient(circle at 40% 40%, #f4d399 0%, #e0ad5c 70%, #bf7a30 100%)',
    'Stuffed Crust': 'radial-gradient(circle at 40% 40%, #fce4b5 0%, #e8b868 60%, #cca300 85%, #b57c2a 100%)',
    'Whole Wheat': 'radial-gradient(circle at 40% 40%, #c29b6e 0%, #a47644 70%, #7d5225 100%)',
    'Gluten-Free': 'radial-gradient(circle at 40% 40%, #e8d0a0 0%, #d6ad6b 70%, #b38240 100%)',
  };
  const crustBg = (crust && crustColors[crust.name]) || crustColors['Thin Crust'];
  
  const cheeseColors = {
    'Mozzarella': 'radial-gradient(circle at 30% 30%, #fffde7 0%, #fff9c4 70%, #fff176 100%)',
    'Cheddar': 'radial-gradient(circle at 30% 30%, #fff59d 0%, #ffca28 70%, #ff8f00 100%)',
    'Gouda': 'radial-gradient(circle at 30% 30%, #ffe082 0%, #ffb300 70%, #f57c00 100%)',
    'Four Cheese': 'radial-gradient(circle at 30% 30%, #fff8e1 0%, #ffe082 40%, #ffca28 70%, #ffb300 100%)',
    'Vegan Cheese': 'radial-gradient(circle at 30% 30%, #fcf3d9 0%, #f0e0a8 70%, #d4b86a 100%)',
  };
  const cheeseBg = (cheese && cheeseColors[cheese.name]) || cheeseColors['Mozzarella'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative' }}>
      <div style={{
        width: 220, height: 220,
        transform: `scale(${sizeScale})`,
        transformOrigin: 'center',
        transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        position: 'relative',
        filter: 'drop-shadow(0 15px 25px rgba(86,39,12,0.25))',
      }}>
        {/* Base crust ring */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: crustBg,
          boxShadow: 'inset 0 0 15px rgba(0,0,0,0.1), 0 8px 20px rgba(0,0,0,0.2)',
          border: crust?.name === 'Thick Crust' || crust?.name === 'Stuffed Crust' ? '8px solid rgba(138, 80, 25, 0.2)' : '3px solid rgba(138, 80, 25, 0.15)',
          transition: 'all 0.5s ease',
        }}>
          {crust?.name === 'Stuffed Crust' && (
             <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '4px dashed rgba(255, 215, 0, 0.4)' }} />
          )}
        </div>
        
        {/* Sauce layer */}
        <div style={{
          position: 'absolute', inset: crust?.name === 'Thin Crust' ? '6%' : '11%', borderRadius: '50%',
          background: sauceBg,
          opacity: 0.95,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
          transition: 'all 0.5s ease',
        }} />
        
        {/* Cheese layer */}
        {cheese && cheese.name !== 'No Cheese' && (
          <div style={{
            position: 'absolute', inset: crust?.name === 'Thin Crust' ? '8%' : '14%', borderRadius: '50%',
            background: cheeseBg,
            opacity: 0.95,
            boxShadow: 'inset 0 0 25px rgba(0,0,0,0.2), 0 2px 10px rgba(0,0,0,0.2)',
            transition: 'all 0.5s ease',
            backgroundImage: 'radial-gradient(circle at 20% 40%, rgba(255,255,255,0.4) 0%, transparent 20%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.3) 0%, transparent 15%)',
          }} />
        )}
        
        {/* Toppings (Scattered naturally) */}
        {toppings.map((t, i) => {
          // Generate 3-5 of each topping scattered around
          const numPieces = 5;
          const pieces = [];
          for (let p = 0; p < numPieces; p++) {
            // Pseudo-random distribution based on topping index and piece index
            const seed = (i * 7 + p * 13) % 100;
            const angle = (seed / 100) * 360;
            const rad = (angle * Math.PI) / 180;
            // Keep mostly within the cheese area (radius ~70 out of 110)
            const r = 15 + ((seed * 3) % 55); 
            const x = 110 + r * Math.cos(rad);
            const y = 110 + r * Math.sin(rad);
            const rot = (seed * 11) % 360;
            const scale = 0.8 + ((seed % 40) / 100); // 0.8 to 1.2
            
            pieces.push(
              <div key={`${t.name}-${p}`} style={{
                position: 'absolute', left: `${(x/220)*100}%`, top: `${(y/220)*100}%`,
                width: 28, height: 28, marginLeft: -14, marginTop: -14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                filter: 'drop-shadow(2px 4px 3px rgba(0,0,0,0.35))', // realistic shadow on toppings
                animation: 'bounceDrop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
                animationDelay: `${(i * 0.1) + (p * 0.04)}s`,
                zIndex: 10 + i,
                // store custom variables for the keyframe
                '--scale': scale,
                '--rot': `${rot}deg`
              }}>
                <div style={{ transform: `rotate(${rot}deg) scale(${scale})` }}>
                  {t.icon}
                </div>
              </div>
            );
          }
          return pieces;
        })}
        
        {/* Shine / Gloss */}
        <div style={{
          position: 'absolute', top: '15%', left: '20%', width: '35%', height: '22%',
          borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
          transform: 'rotate(-25deg)',
          pointerEvents: 'none',
          zIndex: 50,
        }} />
      </div>

      <style>{`
        @keyframes bounceDrop {
          0% { transform: translateY(-40px) scale(0.5); opacity: 0; }
          50% { transform: translateY(5px) scale(1.1); opacity: 1; }
          80% { transform: translateY(-3px) scale(0.95); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─── Option Card ─────────────────────────────────────────────────────────── */
function OptionCard({ item, selected, onClick, showPrice = true }) {
  const isSelected = selected?.name === item.name || selected?.key === item.key;
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
      padding: '1rem 0.75rem', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
      border: '2px solid', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
      borderColor: isSelected ? 'var(--primary)' : 'var(--surface-container-high)',
      background: isSelected ? 'rgba(202,0,44,0.05)' : 'var(--surface-container)',
      boxShadow: isSelected ? '0 0 0 3px rgba(202,0,44,0.12), 0 4px 16px rgba(202,0,44,0.12)' : 'none',
      transform: isSelected ? 'translateY(-2px)' : 'none',
      width: '100%', textAlign: 'center',
    }}>
      <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{item.icon || item.emoji}</span>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? 'var(--primary)' : 'var(--on-surface)' }}>
        {item.label || item.name}
      </div>
      {item.desc && <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', lineHeight: 1.3 }}>{item.desc}</div>}
      {item.inches && <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{item.inches}</div>}
      {showPrice && (
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: isSelected ? 'var(--primary)' : 'var(--on-surface-variant)', marginTop: '0.125rem' }}>
          {item.price !== undefined ? (item.price === 0 ? 'Free' : `+₹${item.price}`) : `₹${item.basePrice}`}
        </div>
      )}
      {isSelected && (
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>✓</div>
      )}
    </button>
  );
}

/* ─── Topping Toggle ─────────────────────────────────────────────────────── */
function ToppingToggle({ topping, selected, onToggle }) {
  const isSelected = selected.some(t => t.name === topping.name);
  return (
    <button onClick={() => onToggle(topping)} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
      border: '2px solid', transition: 'all 0.18s ease',
      borderColor: isSelected ? 'var(--primary)' : 'var(--surface-container-high)',
      background: isSelected ? 'rgba(202,0,44,0.05)' : 'var(--surface-container)',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--on-surface)', fontSize: '0.9rem' }}>
        <span style={{ fontSize: '1.125rem' }}>{topping.icon}</span>
        {topping.name}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
        +₹{topping.price}
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: isSelected ? 'var(--primary)' : 'var(--surface-container-high)', color: isSelected ? '#fff' : 'var(--outline)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.18s' }}>
          {isSelected ? '✓' : '+'}
        </span>
      </span>
    </button>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function CustomPizzaBuilder() {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [size, setSize] = useState(SIZES[1]);
  const [crust, setCrust] = useState(CRUSTS[0]);
  const [sauce, setSauce] = useState(SAUCES[0]);
  const [cheese, setCheese] = useState(CHEESES[0]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [toppingTab, setToppingTab] = useState('Veg');
  const [added, setAdded] = useState(false);

  const toggleTopping = (t) => {
    setSelectedToppings(prev =>
      prev.some(x => x.name === t.name) ? prev.filter(x => x.name !== t.name) : [...prev, t]
    );
  };

  const totalPrice =
    size.basePrice +
    (crust?.price || 0) +
    (sauce?.price || 0) +
    (cheese?.price || 0) +
    selectedToppings.reduce((s, t) => s + t.price, 0);

  const allIngredients = [
    { name: crust.name,  price: crust.price },
    { name: sauce.name,  price: sauce.price },
    { name: cheese.name, price: cheese.price },
    ...selectedToppings,
  ].filter(t => t.name !== 'No Cheese');

  const handleAddToCart = () => {
    if (!user) { navigate('/login'); return; }
    const pizzaObj = {
      _id: 'custom',
      name: 'My Custom Pizza',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      basePrice: size.basePrice,
      customDetails: {
        size: { label: size.label, inches: size.inches },
        crust: crust.name,
        sauce: sauce.name,
        cheese: cheese.name,
        toppings: selectedToppings.map(t => t.name),
      },
    };
    addItem(pizzaObj, size.key, allIngredients, 1);
    setAdded(true);
    setTimeout(() => navigate('/menu'), 1400);
  };

  const canNext = () => {
    if (step === 0) return !!size;
    if (step === 1) return !!crust;
    if (step === 2) return !!sauce;
    if (step === 3) return !!cheese;
    return true;
  };

  return (
    <div className="page" style={{ background: 'linear-gradient(135deg, #fff8f0 0%, var(--surface) 50%, #fff0f2 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #fff8f0, var(--surface))', padding: '2.5rem 0 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <button onClick={() => navigate('/menu')} style={{ background: 'var(--surface-container)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
            <h1 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Build Your <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Custom Pizza</span> 🍕
            </h1>
          </div>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem', marginLeft: '3rem' }}>
            Choose every ingredient — crafted exactly the way you love it.
          </p>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <button onClick={() => i < step && setStep(i)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                  padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-full)',
                  background: i === step ? 'var(--primary)' : i < step ? 'rgba(202,0,44,0.1)' : 'transparent',
                  border: 'none', cursor: i < step ? 'pointer' : 'default',
                  flexShrink: 0, transition: 'all 0.2s',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i === step ? 'rgba(255,255,255,0.2)' : i < step ? 'var(--primary)' : 'var(--surface-container-high)',
                    color: i <= step ? (i === step ? '#fff' : '#fff') : 'var(--on-surface-variant)',
                    fontWeight: 700, fontSize: '0.8rem',
                  }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: i === step ? '#fff' : i < step ? 'var(--primary)' : 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>{s}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < step ? 'var(--primary)' : 'var(--surface-container-high)', minWidth: 16, transition: 'background 0.3s', margin: '0 0.25rem', marginBottom: '1rem' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2.5rem', alignItems: 'start' }}>

          {/* Left — Step content */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-sm)', animation: 'fadeInUp 0.3s ease' }}>

            {/* Step 0 — Size */}
            {step === 0 && (
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.375rem' }}>Choose Your Size</h2>
                <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.75rem' }}>Pick the size that's right for you.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                  {SIZES.map(s => (
                    <OptionCard key={s.key} item={s} selected={size} onClick={() => setSize(s)} showPrice={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Step 1 — Crust */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.375rem' }}>Choose Your Crust</h2>
                <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.75rem' }}>The foundation of every great pizza.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '0.875rem' }}>
                  {CRUSTS.map(c => <OptionCard key={c.name} item={c} selected={crust} onClick={() => setCrust(c)} />)}
                </div>
              </div>
            )}

            {/* Step 2 — Sauce */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.375rem' }}>Choose Your Sauce</h2>
                <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.75rem' }}>The soul of your pizza — pick carefully.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '0.875rem' }}>
                  {SAUCES.map(s => <OptionCard key={s.name} item={s} selected={sauce} onClick={() => setSauce(s)} />)}
                </div>
              </div>
            )}

            {/* Step 3 — Cheese */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.375rem' }}>Choose Your Cheese</h2>
                <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.75rem' }}>Because everything's better with cheese.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '0.875rem' }}>
                  {CHEESES.map(c => <OptionCard key={c.name} item={c} selected={cheese} onClick={() => setCheese(c)} />)}
                </div>
              </div>
            )}

            {/* Step 4 — Toppings */}
            {step === 4 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <h2 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Add Toppings</h2>
                  {selectedToppings.length > 0 && (
                    <button onClick={() => setSelectedToppings([])} style={{ fontSize: '0.8125rem', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Clear all</button>
                  )}
                </div>
                <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.25rem' }}>
                  Select as many as you like{selectedToppings.length > 0 && ` (${selectedToppings.length} selected)`}.
                </p>

                {/* Veg / Non-Veg tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: 'var(--surface-container)', borderRadius: '9999px', padding: '0.25rem', width: 'fit-content' }}>
                  {['Veg', 'Non-Veg'].map(tab => (
                    <button key={tab} onClick={() => setToppingTab(tab)} style={{
                      padding: '0.5rem 1.25rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                      background: toppingTab === tab ? 'var(--primary)' : 'transparent',
                      color: toppingTab === tab ? '#fff' : 'var(--on-surface-variant)',
                      transition: 'all 0.2s',
                    }}>{tab === 'Veg' ? '🥦 Veg' : '🍗 Non-Veg'}</button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {TOPPINGS[toppingTab].map(t => (
                    <ToppingToggle key={t.name} topping={t} selected={selectedToppings} onToggle={toggleTopping} />
                  ))}
                </div>
              </div>
            )}

            {/* Step 5 — Review */}
            {step === 5 && (
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.375rem' }}>Review Your Pizza</h2>
                <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.75rem' }}>Here's everything you've chosen. Looks delicious! 🤤</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: 'Size', value: `${size.label} (${size.inches})`, price: size.basePrice, emoji: '📏' },
                    { label: 'Crust', value: crust.name, price: crust.price, emoji: crust.icon },
                    { label: 'Sauce', value: sauce.name, price: sauce.price, emoji: sauce.icon },
                    { label: 'Cheese', value: cheese.name, price: cheese.price, emoji: cheese.icon },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontWeight: 500 }}>
                        <span style={{ fontSize: '1.125rem' }}>{row.emoji}</span>
                        <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>{row.label}</span>
                        <span style={{ fontWeight: 600 }}>{row.value}</span>
                      </span>
                      <span style={{ fontWeight: 700, color: row.price === 0 ? 'var(--success)' : 'var(--primary)' }}>
                        {row.price === 0 ? (row.label === 'Size' ? `₹${row.price}` : 'Free') : (row.label === 'Size' ? `₹${row.price}` : `+₹${row.price}`)}
                      </span>
                    </div>
                  ))}

                  {selectedToppings.length > 0 && (
                    <div style={{ padding: '0.875rem 1rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🍕</span> Toppings ({selectedToppings.length})
                        <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--primary)' }}>+₹{selectedToppings.reduce((s, t) => s + t.price, 0)}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {selectedToppings.map(t => (
                          <span key={t.name} style={{ background: 'rgba(202,0,44,0.08)', color: 'var(--primary)', borderRadius: '9999px', padding: '0.25rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                            {t.icon} {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ height: 1, background: 'var(--surface-container-high)', margin: '0.25rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1.25rem' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--primary)' }}>₹{totalPrice}</span>
                  </div>
                </div>

                {added && (
                  <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(45,125,70,0.1)', border: '1px solid rgba(45,125,70,0.2)', borderRadius: 'var(--radius-lg)', color: 'var(--success)', fontWeight: 600, textAlign: 'center' }}>
                    🎉 Added to cart! Redirecting…
                  </div>
                )}
              </div>
            )}

            {/* Nav buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--surface-container-high)' }}>
              <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                className="btn btn-secondary" style={{ opacity: step === 0 ? 0.4 : 1 }}>
                ← Back
              </button>

              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} className="btn btn-primary" disabled={!canNext()}>
                  Next: {STEPS[step + 1]} →
                </button>
              ) : (
                <button onClick={handleAddToCart} className="btn btn-primary btn-lg" id="add-custom-btn" disabled={added}
                  style={{ background: added ? 'var(--success)' : undefined }}>
                  {added ? '✓ Added!' : `Add to Cart — ₹${totalPrice}`}
                </button>
              )}
            </div>
          </div>

          {/* Right — Live preview */}
          <div style={{ position: 'sticky', top: '6rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Pizza preview */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--on-surface-variant)' }}>Live Preview</div>
              <PizzaPreview size={size?.key} crust={crust} sauce={sauce} cheese={cheese} toppings={selectedToppings} />
              <div style={{ marginTop: '1.25rem', fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>
                ₹{totalPrice}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>
                {size.label} • {crust.name}
              </div>
            </div>

            {/* Current selections summary */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '1rem' }}>Your Selections</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: 'Size', value: size ? `${size.label} (${size.inches})` : '—' },
                  { label: 'Crust', value: crust?.name || '—' },
                  { label: 'Sauce', value: sauce?.name || '—' },
                  { label: 'Cheese', value: cheese?.name || '—' },
                  { label: 'Toppings', value: selectedToppings.length > 0 ? `${selectedToppings.length} selected` : 'None' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.375rem 0', borderBottom: '1px solid var(--surface-container-high)' }}>
                    <span style={{ color: 'var(--on-surface-variant)' }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: row.value === '—' ? 'var(--outline)' : 'var(--on-surface)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step hint */}
            {step < 5 && (
              <div style={{ background: 'rgba(202,0,44,0.05)', border: '1px solid rgba(202,0,44,0.12)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', fontSize: '0.875rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                💡 {[
                  'Larger pizzas give better value per slice!',
                  'Stuffed crust is our fan favourite — try it!',
                  'Pesto & White Garlic sauces work great with Veg toppings.',
                  'Four Cheese takes any pizza to the next level.',
                  'Mix Veg & Non-Veg toppings for the perfect combo.',
                ][step]}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
