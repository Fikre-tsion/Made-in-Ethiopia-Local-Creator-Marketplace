"use client";

import Link from "next/link";
import { useCart } from "../../lib/cart/CartProvider";
import products from "../../data/products";

export default function CartPage() {
  const { items, total, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const freeShippingThreshold = 8000;
  const shippingProgress = Math.min(100, Math.round((total / freeShippingThreshold) * 100));
  const shippingMessage = total >= freeShippingThreshold
    ? "You qualify for free delivery."
    : `Add ${(freeShippingThreshold - total).toLocaleString()} ETB for free delivery.`;

  function loadDemoCart() {
    clearCart();
    products.slice(0, 3).forEach((product) => addToCart(product));
  }

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <p className="eyebrow">ARTISAN CHECKOUT</p>
          <h1>Your cart</h1>
          <p className="cart-intro">Bring a little Ethiopian craftsmanship home.</p>
        </div>
        <button type="button" className="outline-button" onClick={loadDemoCart}>Load demo cart</button>
      </div>
      {items.length === 0 ? (
        <section className="cart-empty">
          <p>Your cart is empty.</p>
          <p className="cart-muted">Load the demo cart to preview the shopping experience.</p>
          <button type="button" className="primary-button" onClick={loadDemoCart}>Preview demo cart</button>
          <Link href="/marketplace" className="primary-button">Explore marketplace</Link>
        </section>
      ) : (
        <section className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-art">{item.image ? <img src={item.image} alt="" /> : <span aria-hidden="true">🛍️</span>}</div>
                <div className="cart-item-details">
                  <h2>{item.name}</h2>
                  <p>{item.category}</p>
                  <strong>{Number(item.price).toLocaleString()} ETB</strong>
                </div>
                <div className="quantity-controls" aria-label={`Quantity for ${item.name}`}>
                  <button type="button" onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity === 1} aria-label={`Decrease ${item.name} quantity`}>−</button>
                  <span aria-live="polite">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, 1)} aria-label={`Increase ${item.name} quantity`}>+</button>
                </div>
                <button type="button" className="remove-button" onClick={() => removeFromCart(item.id)}>Remove</button>
              </article>
            ))}
            <button type="button" className="text-button cart-clear" onClick={clearCart}>Clear cart</button>
          </div>
          <aside className="cart-summary">
            <p className="eyebrow">ORDER SUMMARY</p>
            <div className="shipping-progress"><span style={{ width: `${shippingProgress}%` }} /></div>
            <p className="cart-muted">{shippingMessage}</p>
            <div className="cart-total"><span>Subtotal</span><strong>{total.toLocaleString()} ETB</strong></div>
            <div className="cart-total"><span>Delivery</span><strong>{total >= freeShippingThreshold ? "Free" : "Calculated at checkout"}</strong></div>
            <div className="cart-total cart-grand-total"><strong>Total</strong><strong>{total.toLocaleString()} ETB</strong></div>
            <button type="button" className="primary-button cart-checkout" disabled>Checkout coming soon</button>
            <p className="cart-muted">Payment and delivery processing will be connected before launch.</p>
          </aside>
        </section>
      )}
    </main>
  );
}
