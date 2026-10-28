"use client";

import Link from "next/link";
import { useCart } from "../lib/cart/CartProvider";
import { useEffect, useState } from "react";
import shops from "../data/shops";

export default function ProductCard({
  product,
  showAddToCart = true,
}) {
  const { addToCart } = useCart();
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const shop = shops.find((item) => item.id === product.shopId);
  useEffect(() => {
    const saved = JSON.parse(window.localStorage.getItem("made-in-ethiopia-favorites") || "[]");
    queueMicrotask(() => setFavorite(saved.includes(product.id)));
  }, [product.id]);

  function handleAddToCart() {
    addToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  function toggleFavorite(event) {
    event.preventDefault();
    const saved = JSON.parse(window.localStorage.getItem("made-in-ethiopia-favorites") || "[]");
    const next = favorite ? saved.filter((id) => id !== product.id) : [...saved, product.id];
    window.localStorage.setItem("made-in-ethiopia-favorites", JSON.stringify(next));
    setFavorite(!favorite);
  }

  return (
    <article className="product-card">
      <div className="product-card-media">
        <Link href={`/products/${product.id}`} className="product-card-link" aria-label={`View ${product.name}`}>
        <div className={`product-art ${product.color || "sand"}`}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
          ) : (
            <span>{product.emoji || "🛍️"}</span>
          )}
        </div>
        </Link>
        <button type="button" className="favorite-button" onClick={toggleFavorite} aria-label={favorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}>{favorite ? "♥" : "♡"}</button>
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>

        <h3>{product.name}</h3>
        <p className="product-price">{Number(product.price).toLocaleString()} ETB</p>
        {shop && <p className="product-creator">{shop.name}</p>}

        {/* Show Add to Cart only when enabled */}
        {showAddToCart && (
          <button
            type="button"
            className="add-to-cart-button"
            onClick={handleAddToCart}
          >
            <span aria-hidden="true">{added ? "✓" : "+"}</span>
            {added ? "Added to basket" : "Add to basket"}
          </button>
        )}
      </div>
    </article>
  );
}