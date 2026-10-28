"use client";

import { useCart } from "../lib/cart/CartProvider";
import { useState } from "react";

export default function AddToCartButton({ product, className = "primary-button" }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function add() {
    addToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button type="button" className={className} onClick={add}>
      {added ? "✓ Added to basket" : "Add to basket"}
    </button>
  );
}
