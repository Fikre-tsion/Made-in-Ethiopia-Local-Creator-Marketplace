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
  const { items, addToCart, removeFromCart } = useCart();

  const [favorite, setFavorite] = useState(false);

  const shop = shops.find((item) => item.id === product.shopId);
  const productName =
    product.name || product.title || product.product_name || "Untitled product";
  const productDescription =
    product.description || product.details || "Handcrafted by a local creator.";
  const inCart = items.some(
    (item) => String(item.id) === String(product.id)
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
    if (inCart) {
      removeFromCart(product.id);
    } else {
      addToCart(product);
    }
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
          aria-label={`View ${productName}`}
        >
          <div
            className={`product-art ${product.color || "sand"}`}
          >
            {product.image ? (
              <img
                src={product.image}
                alt={productName}
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
          className={`favorite-button${favorite ? " is-favorite" : ""}`}
          onClick={toggleFavorite}
          aria-label={
            favorite
                  ? `Remove ${productName} from favorites`
                  : `Add ${productName} to favorites`
          }
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      {/* PRODUCT INFORMATION */}
      <div className="product-info">
        <p className="product-category">
          {product.category || "Handmade"}
        </p>

        <Link href={`/products/${product.id}`} className="product-card-title">
          <h3>{productName}</h3>
          <p className="product-description">{productDescription}</p>
        </Link>

        <p className="product-price">
          {Number(product.price).toLocaleString()} ETB
        </p>

        {(shop || product.shopName) && (
          <p className="product-creator">
            {product.shopName || shop.name}
          </p>
        )}

        {/* ADD TO CART */}
        {showAddToCart && (
          <button
            type="button"
            className={`add-to-cart-button${inCart ? " is-in-cart" : ""}`}
            onClick={handleAddToCart}
            aria-pressed={inCart}
          >
            <span aria-hidden="true">
              {inCart ? "✓" : "+"}
            </span>

            {inCart ? "In basket" : "Add to basket"}
          </button>
        )}
      </div>
    </article>
  );
}