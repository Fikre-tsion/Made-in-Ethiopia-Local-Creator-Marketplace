"use client";

import Link from "next/link";
import { useCart } from "../../lib/cart/CartProvider";
import products from "../../data/products";

export default function CartPage() {
  const {
    items,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const freeShippingThreshold = 8000;
  const shippingProgress = Math.min(
    100,
    Math.round((total / freeShippingThreshold) * 100)
  );

  const shippingMessage =
    total >= freeShippingThreshold
      ? "You qualify for free delivery!"
      : `Add ${(freeShippingThreshold - total).toLocaleString()} ETB for free delivery.`;

  function loadDemoCart() {
    clearCart();
    products.slice(0, 3).forEach((product) => addToCart(product));
  }

  return (
    <main className="cart-page" style={styles.page}>
      <div style={styles.header}>
        <div>
          <p className="eyebrow">ARTISAN CHECKOUT</p>
          <h1 style={styles.title}>Your Cart</h1>
          <p style={styles.subtitle}>
            Bring a little Ethiopian craftsmanship home.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDemoCart}
          style={styles.demoButton}
        >
          Load Demo Cart
        </button>
      </div>

      {items.length === 0 ? (
        <section style={styles.emptyCart}>
          <div style={{ fontSize: "55px" }}>🛍️</div>
          <h2>Your cart is empty</h2>
          <p style={styles.subtitle}>
            Discover beautiful handmade Ethiopian products.
          </p>

          <div style={styles.emptyActions}>
            <button
              type="button"
              onClick={loadDemoCart}
              style={styles.demoButton}
            >
              Preview Demo Cart
            </button>

            <Link href="/marketplace" style={styles.checkoutButton}>
              Explore Marketplace
            </Link>
          </div>
        </section>
      ) : (
        <section style={styles.layout}>
          <div style={styles.cartList}>
            {items.map((item) => (
              <article key={item.id} style={styles.cartItem}>
                <div style={styles.imageContainer}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={styles.image}
                    />
                  ) : (
                    <span style={{ fontSize: "35px" }}>🛍️</span>
                  )}
                </div>

                <div style={styles.productInfo}>
                  <h2 style={styles.productName}>{item.name}</h2>
                  <p style={styles.category}>{item.category}</p>
                  <strong style={styles.price}>
                    {Number(item.price).toLocaleString()} ETB
                  </strong>
                </div>

                <div style={styles.quantityContainer}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={item.quantity === 1}
                    style={styles.quantityButton}
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    −
                  </button>

                  <span style={styles.quantityNumber}>
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 1)}
                    style={styles.quantityButton}
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </article>
            ))}

            <div style={styles.clearContainer}>
              <button
                type="button"
                onClick={clearCart}
                style={styles.clearButton}
              >
                Clear Cart
              </button>
            </div>
          </div>

          <aside style={styles.summary}>
            <p className="eyebrow">ORDER SUMMARY</p>

            <div style={styles.progressBackground}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${shippingProgress}%`,
                }}
              />
            </div>

            <p style={styles.shippingMessage}>{shippingMessage}</p>

            <div style={styles.divider} />

            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <strong>{total.toLocaleString()} ETB</strong>
            </div>

            <div style={styles.summaryRow}>
              <span>Delivery</span>
              <strong style={styles.deliveryText}>
                {total >= freeShippingThreshold
                  ? "Free"
                  : "Calculated at checkout"}
              </strong>
            </div>

            <div style={styles.divider} />

            <div style={styles.totalRow}>
              <strong>Total</strong>
              <strong>{total.toLocaleString()} ETB</strong>
            </div>

            <Link href="/checkout" style={styles.checkoutButton}>
              Proceed to Checkout →
            </Link>

            <p style={styles.checkoutNote}>
              Demo checkout only. No real payment will be collected.
              Delivery fees are not yet calculated.
            </p>

            <Link href="/marketplace" style={styles.continueLink}>
              ← Continue Shopping
            </Link>
          </aside>
        </section>
      )}
    </main>
  );
}

const styles = {
  page: {
    width: "min(1200px, calc(100% - 40px))",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "50px 0 80px",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "45px",
  },

  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(36px, 5vw, 52px)",
    color: "#183f2e",
    margin: "12px 0",
  },

  subtitle: {
    color: "#72766f",
    fontSize: "15px",
    lineHeight: "1.7",
  },

  demoButton: {
    padding: "12px 20px",
    border: "1px solid #245c43",
    borderRadius: "8px",
    background: "transparent",
    color: "#245c43",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },

  layout: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: "30px",
  },

  cartList: {
    flex: "2 1 550px",
    minWidth: 0,
    background: "#fff",
    border: "1px solid #e9e0d2",
    borderRadius: "14px",
    overflow: "hidden",
  },

  cartItem: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "18px",
    padding: "24px",
    borderBottom: "1px solid #eee8dc",
  },

  imageContainer: {
    width: "90px",
    height: "90px",
    flexShrink: 0,
    borderRadius: "8px",
    overflow: "hidden",
    background: "#f0eadc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  productInfo: {
    flex: "1 1 140px",
    minWidth: 0,
  },

  productName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "19px",
    color: "#183f2e",
    margin: "0 0 8px",
    lineHeight: "1.3",
  },

  category: {
    fontSize: "13px",
    color: "#72766f",
    margin: "0 0 8px",
  },

  price: {
    fontSize: "15px",
    color: "#245c43",
  },

  quantityContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },

  quantityButton: {
    width: "32px",
    height: "32px",
    border: "1px solid #e0d8ca",
    borderRadius: "6px",
    background: "#faf7f0",
    color: "#245c43",
    fontSize: "18px",
    cursor: "pointer",
  },

  quantityNumber: {
    fontSize: "15px",
    minWidth: "18px",
    textAlign: "center",
  },

  removeButton: {
    border: "none",
    background: "transparent",
    color: "#a13d2d",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "8px 0",
  },

  clearContainer: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "18px 24px",
    background: "#fffdf8",
  },

  clearButton: {
    border: "none",
    background: "transparent",
    color: "#a13d2d",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
  },

  summary: {
    flex: "1 1 300px",
    minWidth: 0,
    padding: "30px",
    background: "#fff",
    border: "1px solid #e9e0d2",
    borderRadius: "14px",
    boxSizing: "border-box",
  },

  progressBackground: {
    width: "100%",
    height: "8px",
    background: "#e9e0d2",
    borderRadius: "20px",
    overflow: "hidden",
    marginTop: "25px",
  },

  progressFill: {
    height: "100%",
    background: "#245c43",
    borderRadius: "20px",
    transition: "width 0.3s ease",
  },

  shippingMessage: {
    fontSize: "13px",
    color: "#72766f",
    marginTop: "12px",
    lineHeight: "1.6",
  },

  divider: {
    height: "1px",
    background: "#e9e0d2",
    margin: "25px 0",
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "22px",
    fontSize: "15px",
  },

  deliveryText: {
    fontSize: "13px",
    textAlign: "right",
    maxWidth: "160px",
    lineHeight: "1.5",
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    fontSize: "20px",
    color: "#183f2e",
    marginBottom: "30px",
  },

  checkoutButton: {
    display: "block",
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "8px",
    background: "#245c43",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    textAlign: "center",
    textDecoration: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  },

  checkoutNote: {
    fontSize: "12px",
    color: "#72766f",
    lineHeight: "1.7",
    marginTop: "15px",
  },

  continueLink: {
    display: "block",
    marginTop: "25px",
    color: "#245c43",
    fontWeight: "600",
    fontSize: "14px",
    textDecoration: "none",
  },

  emptyCart: {
    textAlign: "center",
    padding: "70px 25px",
    background: "#fff",
    border: "1px solid #e9e0d2",
    borderRadius: "14px",
  },

  emptyActions: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginTop: "25px",
  },
};