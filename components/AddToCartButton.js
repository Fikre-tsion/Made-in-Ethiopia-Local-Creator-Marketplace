"use client";

import Link from "next/link";
import { useCart } from "../lib/cart/CartProvider";

export default function AddToCartButton({
  product,
  className = "primary-button",
}) {
  const { items, addToCart } = useCart();

  const inCart = items.some(
    (item) => String(item.id) === String(product.id)
  );

  function add() {
    if (!inCart) {
      addToCart(product);
    }
  }

  return (
    <div className="cart-action-group">
      <button
        type="button"
        className={`${className} cart-action${inCart ? " is-in-cart" : ""}`}
        onClick={add}
        aria-pressed={inCart}
        disabled={inCart}
      >
        {inCart ? "✓ Added to Cart!" : "Add to Cart"}
      </button>

      {inCart && (
        <Link href="/cart" className="secondary-button cart-view-link">
          View Your Cart →
        </Link>
      )}
    </div>
  );
}