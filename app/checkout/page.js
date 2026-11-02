
"use client";

import { useState, useEffect } from "react";
import { useCart } from "../../lib/cart/CartProvider";
import { createClient } from "../../lib/supabase/client";
import { hasSupabaseConfig } from "../../lib/supabase/config";
import Link from "next/link";

const DEMO_CODE = "123456";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Addis Ababa",
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const [step, setStep] = useState("details");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderDetails, setOrderDetails] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Reset checkout when a new cart is started after a successful order.
  useEffect(() => {
    if (items.length > 0 && step === "success") {
      setStep("details");
      setPaymentMethod("");
      setVerificationCode("");
      setError("");
      setTransactionRef("");
      setOrderTotal(0);
      setOrderDetails([]);
      setForm({
        name: "",
        phone: "",
        address: "",
        city: "Addis Ababa",
      });
    }
  }, [items, step]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function isValidEthiopianPhone(phone) {
    return /^(?:\+251|251|0)9\d{8}$/.test(phone.trim());
  }

  function handleContinue(e) {
    e.preventDefault();

    if (!isValidEthiopianPhone(form.phone)) {
      setError("Please enter a valid Ethiopian phone number.");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    setError("");
    setStep("verification");
  }

  async function handleVerifyPayment(e) {
    e.preventDefault();

    if (isSaving) return;

    if (verificationCode !== DEMO_CODE) {
      setError("Incorrect verification code. Please try again.");
      return;
    }

    if (!hasSupabaseConfig()) {
      setError(
        "Supabase is not configured. Your order cannot be saved. Please try again when the database is available."
      );
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const supabase = createClient();

      // Get the currently logged-in customer.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Please log in to your customer account before placing an order."
        );
      }

      const reference =
        "MIE-" +
        Math.random().toString(36).substring(2, 10).toUpperCase();

      // Save a snapshot of the purchased items.
      const purchasedItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));

      const orderData = {
        customer_id: user.id,
        order_reference: reference,
        customer_name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        items: purchasedItems,
        total: Number(total),
        payment_method: paymentMethod,
      };

      // Save the order before clearing the cart.
      const { error: orderError } = await supabase
        .from("orders")
        .insert(orderData);

      if (orderError) {
        throw new Error(orderError.message);
      }

      // Update the receipt and show success only after saving.
      setTransactionRef(reference);
      setOrderTotal(Number(total));
      setOrderDetails(purchasedItems);
      setStep("success");

      clearCart();
    } catch (err) {
      console.error("Order saving error:", err);
      setError(
        err.message || "Something went wrong while saving your order."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (items.length === 0 && step !== "success") {
    return (
      <main style={styles.container}>
        <h1>Your cart is empty</h1>
        <Link href="/marketplace" style={styles.button}>
          Explore Marketplace
        </Link>
      </main>
    );
  }

  if (step === "success") {
    return (
      <main style={styles.container}>
        <div style={styles.success}>
          <div style={styles.successIcon}>✓</div>

          <h1>Order Confirmed!</h1>

          <p>Thank you for shopping with Made in Ethiopia.</p>
          <p>Your order has been successfully saved.</p>

          <div style={styles.receipt}>
            <h3>Order Receipt</h3>

            {orderDetails.map((item) => (
              <div key={item.id} style={styles.row}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <strong>
                  {(Number(item.price) * item.quantity).toLocaleString()} ETB
                </strong>
              </div>
            ))}

            <hr />

            <div style={styles.row}>
              <span>Payment Method</span>
              <strong>{paymentMethod}</strong>
            </div>

            <div style={styles.row}>
              <span>Amount</span>
              <strong>{orderTotal.toLocaleString()} ETB</strong>
            </div>

            <div style={styles.row}>
              <span>Phone Number</span>
              <strong>{form.phone}</strong>
            </div>

            <div style={styles.row}>
              <span>Order Reference</span>
              <strong>{transactionRef}</strong>
            </div>

            <div style={styles.row}>
              <span>Status</span>
              <strong style={{ color: "#245c43" }}>Confirmed</strong>
            </div>
          </div>

          <p style={styles.note}>
            Demo payment verification completed successfully.
            No real money was transferred.
          </p>

          <Link href="/customer/orders" style={styles.button}>
            View My Orders
          </Link>

          <Link
            href="/marketplace"
            style={{ ...styles.backButton, display: "block" }}
          >
            Continue Shopping →
          </Link>
        </div>
      </main>
    );
  }

  if (step === "verification") {
    return (
      <main style={styles.container}>
        <div style={styles.verificationCard}>
          <div style={styles.telebirrLogo}>
            {paymentMethod === "Telebirr" ? "T" : "C"}
          </div>

          <p style={styles.eyebrow}>PAYMENT VERIFICATION</p>

          <h1 style={styles.verificationTitle}>Verify Your Payment</h1>

          <p style={styles.verificationText}>
            Enter the six-digit verification code to confirm your{" "}
            {paymentMethod} payment.
          </p>

          <div style={styles.paymentDetails}>
            <div style={styles.row}>
              <span>Payment Method</span>
              <strong>{paymentMethod}</strong>
            </div>

            <div style={styles.row}>
              <span>Phone Number</span>
              <strong>{form.phone}</strong>
            </div>

            <div style={styles.row}>
              <span>Amount</span>
              <strong>{total.toLocaleString()} ETB</strong>
            </div>
          </div>

          <form onSubmit={handleVerifyPayment}>
            <label style={styles.label}>
              Verification Code
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  );
                  setError("");
                }}
                style={styles.codeInput}
                placeholder="Enter 6-digit code"
              />
            </label>

            {error && <p style={styles.error}>{error}</p>}

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: isSaving || verificationCode.length !== 6 ? 0.6 : 1,
              }}
              disabled={isSaving || verificationCode.length !== 6}
            >
              {isSaving ? "Saving Your Order..." : "Confirm Payment"}
            </button>
          </form>

          <button
            type="button"
            style={styles.backButton}
            disabled={isSaving}
            onClick={() => {
              setStep("details");
              setVerificationCode("");
              setError("");
            }}
          >
            ← Back to Checkout
          </button>

          <p style={styles.demoHint}>
            Demo verification code: <strong>123456</strong>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <p style={styles.eyebrow}>SECURE CHECKOUT</p>

      <h1 style={styles.title}>Complete Your Order</h1>

      <div style={styles.layout}>
        <form onSubmit={handleContinue} style={styles.card}>
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
              type="tel"
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
            <h2>Choose Payment Method</h2>

            <div style={styles.paymentOptions}>
              <button
                type="button"
                style={{
                  ...styles.paymentOption,
                  ...(paymentMethod === "Telebirr"
                    ? styles.paymentOptionSelected
                    : {}),
                }}
                onClick={() => {
                  setPaymentMethod("Telebirr");
                  setError("");
                }}
              >
                <div style={styles.paymentIcon}>T</div>
                <div style={styles.paymentOptionText}>
                  <strong>Telebirr</strong>
                  <span>Mobile Money</span>
                </div>
                <span style={styles.radioCircle}>
                  {paymentMethod === "Telebirr" ? "✓" : ""}
                </span>
              </button>

              <button
                type="button"
                style={{
                  ...styles.paymentOption,
                  ...(paymentMethod === "Chapa"
                    ? styles.paymentOptionSelected
                    : {}),
                }}
                onClick={() => {
                  setPaymentMethod("Chapa");
                  setError("");
                }}
              >
                <div
                  style={{
                    ...styles.paymentIcon,
                    background: "#e9f0ff",
                    color: "#2854a6",
                  }}
                >
                  C
                </div>
                <div style={styles.paymentOptionText}>
                  <strong>Chapa</strong>
                  <span>Online Payment</span>
                </div>
                <span style={styles.radioCircle}>
                  {paymentMethod === "Chapa" ? "✓" : ""}
                </span>
              </button>
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button}>
            Continue to Payment
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
                {(Number(item.price) * item.quantity).toLocaleString()} ETB
              </strong>
            </div>
          ))}

          <hr />

          <div style={styles.row}>
            <strong>Total</strong>
            <strong>{total.toLocaleString()} ETB</strong>
          </div>

          <p style={styles.note}>Delivery fees are not included.</p>
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
    marginBottom: "25px",
  },

  paymentOptions: {
    display: "grid",
    gap: "12px",
    marginTop: "18px",
  },

  paymentOption: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    width: "100%",
    padding: "16px",
    border: "1px solid #ddd6c9",
    borderRadius: "10px",
    background: "#fff",
    textAlign: "left",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  paymentOptionSelected: {
    border: "2px solid #245c43",
    background: "#f3f8f4",
  },

  paymentIcon: {
    width: "42px",
    height: "42px",
    flexShrink: 0,
    borderRadius: "10px",
    background: "#245c43",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "bold",
  },

  paymentOptionText: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
    color: "#183f2e",
  },

  radioCircle: {
    width: "23px",
    height: "23px",
    border: "1px solid #245c43",
    borderRadius: "50%",
    color: "#245c43",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
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
    overflowWrap: "anywhere",
  },

  note: {
    color: "#72766f",
    fontSize: "13px",
    lineHeight: "1.7",
    marginTop: "20px",
  },

  verificationCard: {
    maxWidth: "520px",
    margin: "auto",
    padding: "35px 25px",
    background: "white",
    border: "1px solid #e9e0d2",
    borderRadius: "14px",
    textAlign: "center",
  },

  verificationTitle: {
    color: "#183f2e",
    fontFamily: "Playfair Display, serif",
    fontSize: "32px",
  },

  verificationText: {
    color: "#72766f",
    lineHeight: "1.7",
  },

  telebirrLogo: {
    width: "55px",
    height: "55px",
    borderRadius: "13px",
    background: "#245c43",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontSize: "28px",
    fontWeight: "bold",
    margin: "0 auto 20px",
  },

  paymentDetails: {
    background: "#fbfaf6",
    padding: "10px 18px",
    borderRadius: "10px",
    margin: "25px 0",
    textAlign: "left",
  },

  codeInput: {
    width: "100%",
    padding: "16px",
    border: "1px solid #ddd6c9",
    borderRadius: "8px",
    boxSizing: "border-box",
    fontSize: "24px",
    textAlign: "center",
    letterSpacing: "10px",
  },

  error: {
    color: "#c0392b",
    background: "#fff0ed",
    padding: "12px",
    borderRadius: "7px",
    fontSize: "13px",
    marginBottom: "15px",
    overflowWrap: "anywhere",
  },

  backButton: {
    marginTop: "18px",
    padding: "10px",
    background: "transparent",
    border: "none",
    color: "#245c43",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
  },

  demoHint: {
    marginTop: "20px",
    color: "#777",
    fontSize: "12px",
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
