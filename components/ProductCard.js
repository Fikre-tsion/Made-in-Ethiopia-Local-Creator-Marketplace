"use client";

import Link from "next/link";

export default function ProductCard({
  product,
  showAddToCart = true,
}) {
  function handleAddToCart() {
    console.log("Add to cart:", product.name);
  }

  return (
    <article className="product-card">
      <Link
        href={`/marketplace?search=${encodeURIComponent(product.name)}`}
        className="product-card-link"
      >
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

      <div className="product-info">
        <p className="product-category">{product.category}</p>

        <h3>{product.name}</h3>

        {/* Show Add to Cart only when enabled */}
        {showAddToCart && (
          <button
            type="button"
            className="add-to-cart-button"
            onClick={handleAddToCart}
          >
            <span aria-hidden="true">+</span>
            Add to Cart
          </button>
        )}
      </div>
    </article>
  );
}