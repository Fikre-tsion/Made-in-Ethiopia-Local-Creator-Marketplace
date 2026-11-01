
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
    telebirrPhone: "",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function isValidEthiopianPhone(phone) {
    return /^(?:\+251|251|0)9\d{8}$/.test(phone.trim());
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!isValidEthiopianPhone(form.phone)) {
      alert("Please enter a valid Ethiopian delivery phone number.");
      return;
    }

    if (!isValidEthiopianPhone(form.telebirrPhone)) {
      alert("Please enter a valid Telebirr phone number.");
      return;
    }

    // Generate a demo transaction reference
    const reference =
      "MIE-TB-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    setTransactionRef(reference);
    setOrderPlaced(true);
    clearCart();
  }

  if (orderPlaced) {
    return (
      <main style={styles.container}>
        <div style={styles.success}>
          <div style={styles.successIcon}>✓</div>

          <h1>Payment Successful!</h1>

          <p>
            Thank you for shopping with Made in Ethiopia.
          </p>

          <p>
            Your demo Telebirr payment has been completed successfully.
          </p>

          <div style={styles.receipt}>
            <h3>Payment Receipt</h3>

            <div style={styles.row}>
              <span>Payment Method</span>
              <strong>Telebirr</strong>
            </div>

            <div style={styles.row}>
              <span>Amount Paid</span>
              <strong>{total.toLocaleString()} ETB</strong>
            </div>

            <div style={styles.row}>
              <span>Phone Number</span>
              <strong>{form.telebirrPhone}</strong>
            </div>

            <div style={styles.row}>
              <span>Transaction Reference</span>
              <strong>{transactionRef}</strong>
            </div>

            <div style={styles.row}>
              <span>Status</span>
              <strong style={{ color: "#245c43" }}>
                Demo Successful
              </strong>
            </div>
          </div>

          <p style={styles.note}>
            This was a simulated payment. No real money was transferred.
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

          <div style={styles.paymentSection}>
            <h2>Payment Method</h2>

            <div style={styles.telebirrCard}>
              <div style={styles.telebirrHeader}>
                <div style={styles.telebirrLogo}>T</div>

                <div>
                  <strong>Telebirr</strong>
                  <p>Mobile Money Payment</p>
                </div>

                <span style={styles.selected}>Selected ✓</span>
              </div>

              <label style={styles.label}>
                Telebirr Phone Number
                <input
                  name="telebirrPhone"
                  required
                  value={form.telebirrPhone}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="09XXXXXXXX"
                />
              </label>

              <p style={styles.demoNotice}>
                Demo payment only. No real money will be transferred.
              </p>
            </div>
          </div>

          <button type="submit" style={styles.button}>
            Pay {total.toLocaleString()} ETB with Telebirr
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
            no actual payment will be collected.
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

  paymentSection: {
    marginTop: "30px",
  },

  telebirrCard: {
    border: "1px solid #245c43",
    borderRadius: "10px",
    padding: "18px",
    marginBottom: "25px",
    background: "#fbfaf6",
  },

  telebirrHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "22px",
  },

  telebirrLogo: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "#245c43",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold",
  },

  selected: {
    marginLeft: "auto",
    color: "#245c43",
    fontSize: "12px",
    fontWeight: "bold",
  },

  demoNotice: {
    background: "#f0eadc",
    padding: "12px",
    borderRadius: "7px",
    fontSize: "12px",
    color: "#665b45",
    lineHeight: "1.6",
  },

  button: {
    display: "block",
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
    marginTop: "20px",
  },

  success: {
    textAlign: "center",
    background: "white",
    padding: "45px 25px",
    borderRadius: "14px",
    border: "1px solid #e9e0d2",
  },

  successIcon: {
    width: "65px",
    height: "65px",
    borderRadius: "50%",
    background: "#e5f2e9",
    color: "#245c43",
    fontSize: "38px",
    lineHeight: "65px",
    margin: "0 auto 20px",
  },

  receipt: {
    maxWidth: "500px",
    margin: "30px auto",
    padding: "20px",
    background: "#fbfaf6",
    border: "1px solid #e9e0d2",
    borderRadius: "10px",
    textAlign: "left",
  },
};
