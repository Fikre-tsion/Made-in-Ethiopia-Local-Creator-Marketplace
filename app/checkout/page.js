"use client";

import { useState } from "react";
import { useCart } from "../../lib/cart/CartProvider";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Addis Ababa",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!/^(?:\+251|0)9\d{8}$/.test(form.phone.trim())) {
      alert("Please enter a valid Ethiopian phone number.");
      return;
    }

    setOrderPlaced(true);
    clearCart();
  }

  if (orderPlaced) {
    return (
      <main style={styles.container}>
        <div style={styles.success}>
          <h1>🎉 Order Submitted!</h1>

          <p>
            Thank you for shopping with Made in Ethiopia.
          </p>

          <p>
            Your order details have been recorded for this demo.
          </p>

          <Link href="/marketplace" style={styles.button}>
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main style={styles.container}>
        <h1>Your cart is empty</h1>

        <Link href="/marketplace" style={styles.button}>
          Explore Marketplace
        </Link>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <p style={styles.eyebrow}>SECURE CHECKOUT</p>

      <h1 style={styles.title}>Complete Your Order</h1>

      <div style={styles.layout}>
        <form onSubmit={handleSubmit} style={styles.card}>
          <h2>Delivery Information</h2>

          <label style={styles.label}>
            Full Name
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your full name"
            />
          </label>

          <label style={styles.label}>
            Phone Number
            <input
              name="phone"
              required
              value={form.phone}
              onChange={handleChange}
              style={styles.input}
              placeholder="09XXXXXXXX"
            />
          </label>

          <label style={styles.label}>
            City
            <input
              name="city"
              required
              value={form.city}
              onChange={handleChange}
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Delivery Address
            <textarea
              name="address"
              required
              value={form.address}
              onChange={handleChange}
              style={styles.input}
              rows={4}
              placeholder="Sub-city, neighborhood, and nearby landmark"
            />
          </label>

          <h3>Payment Method</h3>

          <p style={styles.payment}>
            💵 Cash on Delivery (Demo)
          </p>

          <button type="submit" style={styles.button}>
            Place Order
          </button>
        </form>

        <aside style={styles.card}>
          <h2>Order Summary</h2>

          {items.map((item) => (
            <div key={item.id} style={styles.row}>
              <span>
                {item.name} × {item.quantity}
              </span>

              <strong>
                {(
                  Number(item.price) * item.quantity
                ).toLocaleString()} ETB
              </strong>
            </div>
          ))}

          <hr />

          <div style={styles.row}>
            <strong>Total</strong>
            <strong>{total.toLocaleString()} ETB</strong>
          </div>

          <p style={styles.note}>
            Delivery fees are not included. This is a demo checkout;
            no payment will be collected.
          </p>
        </aside>
      </div>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "auto",
    padding: "60px 24px",
  },

  eyebrow: {
    color: "#245c43",
    fontWeight: "700",
    letterSpacing: "2px",
    fontSize: "12px",
  },

  title: {
    fontFamily: "Playfair Display, serif",
    fontSize: "44px",
    color: "#183f2e",
  },

  layout: {
    display: "flex",
    flexWrap: "wrap",
    gap: "30px",
    alignItems: "flex-start",
  },

  card: {
    flex: "1 1 320px",
    minWidth: 0,
    background: "white",
    padding: "30px",
    borderRadius: "14px",
    border: "1px solid #e9e0d2",
    boxSizing: "border-box",
  },

  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
    fontWeight: "600",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "13px",
    border: "1px solid #ddd6c9",
    borderRadius: "7px",
    font: "inherit",
    boxSizing: "border-box",
  },

  payment: {
    padding: "15px",
    background: "#f0eadc",
    borderRadius: "8px",
    marginBottom: "25px",
  },

  button: {
    display: "inline-block",
    width: "100%",
    padding: "15px",
    background: "#245c43",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    padding: "15px 0",
    fontSize: "14px",
  },

  note: {
    color: "#72766f",
    fontSize: "13px",
    lineHeight: "1.7",
  },

  success: {
    textAlign: "center",
    background: "white",
    padding: "60px 25px",
    borderRadius: "14px",
  },
};