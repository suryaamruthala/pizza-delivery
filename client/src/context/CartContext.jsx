import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('slicestream_cart');
    return stored ? JSON.parse(stored) : [];
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('slicestream_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (pizza, size, toppings, quantity = 1) => {
    const toppingTotal = toppings.reduce((s, t) => s + t.price, 0);
    const isCustom = pizza._id === 'custom';
    const basePrice = isCustom ? pizza.basePrice : pizza.sizes[size];
    const price = basePrice + toppingTotal;
    const toppingKey = toppings.map(t => t.name).sort().join('-');
    const id = isCustom
      ? `custom-${size}-${toppingKey}-${Date.now()}`
      : `${pizza._id}-${size}-${toppingKey}`;

    setItems(prev => {
      if (!isCustom) {
        const existing = prev.find(i => i.id === id);
        if (existing) {
          return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + quantity } : i);
        }
      }
      return [...prev, {
        id,
        pizza: isCustom ? null : pizza._id,
        isCustom,
        name: pizza.name,
        image: pizza.image || '',
        customDetails: pizza.customDetails || null,
        size, toppings, quantity, price,
      }];
    });
    setIsOpen(true);
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) return removeItem(id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, subtotal, count, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
