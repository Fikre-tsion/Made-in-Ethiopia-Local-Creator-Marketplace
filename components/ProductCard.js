"use client";

import Link from "next/link";
import { useCart } from "../lib/cart/CartProvider";
import { useEffect, useState } from "react";
import shops from "../data/shops";

const FAVORITES_KEY = "made-in-ethiopia-favorites";

function getSavedFavorites() {
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(FAVORITES_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function ProductCard({
  product,
  showAddToCart = true,
}) {
  const { addToCart } = useCart();

  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);

  const shop = shops.find(
    (item) => item.id === product.shopId
  );

  // Check whether this product is already saved
  useEffect(() => {
    const updateFavorite = () => {
      const saved = getSavedFavorites();

      setFavorite(
        saved.some(
          (id) => String(id) === String(product.id)
        )
      );
    };

    updateFavorite();

    window.addEventListener("favoritesUpdated", updateFavorite);
    window.addEventListener("storage", updateFavorite);

    return () => {
      window.removeEventListener(
        "favoritesUpdated",
        updateFavorite
      );

      window.removeEventListener(
        "storage",
        updateFavorite
      );
    };
  }, [product.id]);

  // ADD TO CART
  function handleAddToCart() {
    addToCart(product);

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1600);
  }

  // ADD OR REMOVE FAVORITE
  function toggleFavorite(event) {
    event.preventDefault();

    const saved = getSavedFavorites();

    const alreadySaved = saved.some(
      (id) => String(id) === String(product.id)
    );

    const next = alreadySaved
      ? saved.filter(
          (id) => String(id) !== String(product.id)
        )
      : [...saved, product.id];

    window.localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(next)
    );

    setFavorite(!alreadySaved);

    // Notify other components
    window.dispatchEvent(
      new Event("favoritesUpdated")
    );
  }

  return (
    <article className="product-card">

      {/* PRODUCT IMAGE */}
      <div className="product-card-media">
        <Link
          href={`/products/${product.id}`}
          className="product-card-link"
          aria-label={`View ${product.name}`}
        >
          <div
            className={`product-art ${product.color || "sand"}`}
          >
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

        {/* FAVORITE BUTTON */}
        <button
          type="button"
          className="favorite-button"
          onClick={toggleFavorite}
          aria-label={
            favorite
              ? `Remove ${product.name} from favorites`
              : `Add ${product.name} to favorites`
          }
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      {/* PRODUCT INFORMATION */}
      <div className="product-info">
        <p className="product-category">
          {product.category}
        </p>

        <h3>{product.name}</h3>

        <p className="product-price">
          {Number(product.price).toLocaleString()} ETB
        </p>

        {shop && (
          <p className="product-creator">
            {shop.name}
          </p>
        )}

        {/* ADD TO CART */}
        {showAddToCart && (
          <button
            type="button"
            className="add-to-cart-button"
            onClick={handleAddToCart}
          >
            <span aria-hidden="true">
              {added ? "✓" : "+"}
            </span>

            {added
              ? "Added to basket"
              : "Add to basket"}
          </button>
        )}
      </div>
    </article>
  );
}