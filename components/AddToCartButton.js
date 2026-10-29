"use client";

import { useCart } from "../lib/cart/CartProvider";

export default function AddToCartButton({ product, className = "primary-button" }) {
  const { items, addToCart, removeFromCart } = useCart();
  const inCart = items.some(
    (item) => String(item.id) === String(product.id)
  );

  function add() {
    if (inCart) {
      removeFromCart(product.id);
    } else {
      addToCart(product);
    }
  }

  return (
    <button
      type="button"
      className={`${className} cart-action${inCart ? " is-in-cart" : ""}`}
      onClick={add}
      aria-pressed={inCart}
    >
      {inCart ? "✓ In basket" : "Add to basket"}
    </button>
  );
}
