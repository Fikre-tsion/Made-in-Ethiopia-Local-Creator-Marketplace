"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);
const CART_KEY = "made-in-ethiopia-cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Load saved cart
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          // Cart restoration runs after hydration to avoid server/client markup differences.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Could not load cart:", error);
      localStorage.removeItem(CART_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  // Add product
  function addToCart(product) {
    setItems((current) => {
      const existing = current.find(
        (item) => String(item.id) === String(product.id)
      );

      if (existing) {
        return current.map((item) =>
          String(item.id) === String(product.id)
            ? {
                ...item,
                quantity: Number(item.quantity || 1) + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          price: Number(product.price) || 0,
          quantity: 1,
        },
      ];
    });
  }

  // Remove product
  function removeFromCart(productId) {
    setItems((current) =>
      current.filter(
        (item) => String(item.id) !== String(productId)
      )
    );
  }

  // Increase or decrease quantity
  function updateQuantity(productId, change) {
    setItems((current) =>
      current.map((item) => {
        if (String(item.id) !== String(productId)) {
          return item;
        }

        const currentQuantity = Number(item.quantity) || 1;

        return {
          ...item,
          quantity: Math.max(1, currentQuantity + change),
        };
      })
    );
  }

  // Clear cart
  function clearCart() {
    setItems([]);
  }

  // Calculate total number of items
  const itemCount = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  // Calculate subtotal automatically
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;

    return sum + price * quantity;
  }, 0);

  // Delivery calculation
  const freeShippingThreshold = 8000;

  const deliveryFee =
    subtotal === 0 || subtotal >= freeShippingThreshold
      ? 0
      : 0; // Delivery fee not configured yet

  // Final total
  const total = subtotal + deliveryFee;

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      deliveryFee,
      total,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [items, itemCount, subtotal, deliveryFee, total]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within CartProvider"
    );
  }

  return context;
}