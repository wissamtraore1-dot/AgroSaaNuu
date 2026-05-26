// ============================================================
// AgroConnect — Cart Context
// src/context/CartContext.jsx
// ============================================================
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
const CART_KEY   = 'agroconnect_cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch { return []; }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  // ── Add item ──────────────────────────────────────────────
  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, {
        id:     product.id,
        name:   product.name,
        price:  product.price,
        image:  product.image,
        seller: product.seller_name,
        stock:  product.stock,
        qty,
      }];
    });
  };

  // ── Update quantity ───────────────────────────────────────
  const updateQty = (id, qty) => {
    if (qty <= 0) { removeItem(id); return; }
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, qty } : i)
    );
  };

  // ── Remove item ───────────────────────────────────────────
  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // ── Clear cart ────────────────────────────────────────────
  const clearCart = () => setItems([]);

  // ── Computed values ───────────────────────────────────────
  const totalItems  = items.reduce((s, i) => s + i.qty, 0);
  const totalAmount = items.reduce((s, i) => s + i.price * i.qty, 0);
  const isEmpty     = items.length === 0;

  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      totalAmount,
      isEmpty,
      addItem,
      updateQty,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used inside CartProvider');
  return ctx;
};