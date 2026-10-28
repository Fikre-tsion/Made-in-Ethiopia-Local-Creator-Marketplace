"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("made-in-ethiopia-cart");
      if (saved) queueMicrotask(() => setItems(JSON.parse(saved)));
    } catch {
      window.localStorage.removeItem("made-in-ethiopia-cart");
    } finally {
      queueMicrotask(() => setHydrated(true));
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("made-in-ethiopia-cart", JSON.stringify(items));
  }, [hydrated, items]);

  function addToCart(product) {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(productId) {
    setItems((current) => current.filter((item) => item.id !== productId));
  }

  function updateQuantity(productId, change) {
    setItems((current) =>
      current.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      total: items.reduce(
        (sum, item) => sum + Number(item.price || 0) * item.quantity,
        0
      ),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
