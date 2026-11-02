
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";
import { hasSupabaseConfig } from "../../../lib/supabase/config";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        if (!hasSupabaseConfig()) {
          setError("Order history is unavailable in demo mode.");
          return;
        }

        const supabase = createClient();

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("Please log in to view your orders.");
          return;
        }

        const { data, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false });

        if (ordersError) {
          throw ordersError;
        }

        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("We couldn't load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-ET", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <main className="customer-orders-page">
      <div className="customer-orders-container">
        <Link href="/customer" className="orders-back-link">
          ← Customer Dashboard
        </Link>

        <p className="orders-eyebrow">YOUR PURCHASES</p>
        <h1>My Orders</h1>
        <p className="orders-intro">
          Keep track of your purchases and revisit the creations
          you've ordered from Ethiopian makers.
        </p>

        {loading ? (
          <div className="orders-message">
            Loading your orders...
          </div>
        ) : error ? (
          <div className="orders-message orders-error">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>
              Your purchases will appear here after you complete
              checkout.
            </p>
            <Link href="/marketplace" className="orders-shop-button">
              Explore Marketplace →
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-card-header">
                  <div>
                    <span className="order-label">ORDER REFERENCE</span>
                    <h2>{order.order_reference}</h2>
                    <p>{formatDate(order.created_at)}</p>
                  </div>

                  <span className="order-status">
                    {order.status}
                  </span>
                </div>

                <div className="order-items">
                  {Array.isArray(order.items) &&
                    order.items.map((item, index) => (
                      <div
                        className="order-item"
                        key={`${item.id}-${index}`}
                      >
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <strong>
                          {(
                            Number(item.price) *
                            Number(item.quantity)
                          ).toLocaleString()} ETB
                        </strong>
                      </div>
                    ))}
                </div>

                <div className="order-card-footer">
                  <div>
                    <span>Payment Method</span>
                    <strong>{order.payment_method}</strong>
                  </div>

                  <div>
                    <span>Total</span>
                    <strong>
                      {Number(order.total).toLocaleString()} ETB
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .customer-orders-page {
          min-height: 70vh;
          padding: 55px 24px 80px;
          background: #faf7f0;
        }

        .customer-orders-container {
          max-width: 950px;
          margin: 0 auto;
        }

        .orders-back-link {
          display: inline-block;
          margin-bottom: 35px;
          color: #245c43;
          text-decoration: none;
          font-weight: 600;
        }

        .orders-eyebrow {
          color: #c99445;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        h1 {
          color: #183f2e;
          font-family: "Playfair Display", serif;
          font-size: 42px;
          margin: 10px 0;
        }

        .orders-intro {
          color: #72766f;
          line-height: 1.7;
          margin-bottom: 35px;
        }

        .orders-message,
        .orders-empty {
          padding: 45px 25px;
          background: white;
          border: 1px solid #e9e0d2;
          border-radius: 14px;
          text-align: center;
        }

        .orders-error {
          color: #b42318;
        }

        .orders-empty-icon {
          font-size: 42px;
          margin-bottom: 12px;
        }

        .orders-empty h2 {
          color: #183f2e;
          margin-bottom: 10px;
        }

        .orders-empty p {
          color: #72766f;
          margin-bottom: 25px;
        }

        .orders-shop-button {
          display: inline-block;
          padding: 13px 22px;
          background: #245c43;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
        }

        .orders-list {
          display: grid;
          gap: 22px;
        }

        .order-card {
          background: white;
          border: 1px solid #e9e0d2;
          border-radius: 14px;
          padding: 25px;
        }

        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee8de;
        }

        .order-label {
          color: #999;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .order-card-header h2 {
          color: #183f2e;
          font-size: 18px;
          margin: 7px 0;
          overflow-wrap: anywhere;
        }

        .order-card-header p {
          color: #777;
          font-size: 13px;
          margin: 0;
        }

        .order-status {
          background: #e5f2e9;
          color: #245c43;
          padding: 7px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .order-items {
          padding: 12px 0;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 10px 0;
          color: #555;
          font-size: 14px;
        }

        .order-item strong {
          color: #183f2e;
          white-space: nowrap;
        }

        .order-card-footer {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          border-top: 1px solid #eee8de;
          padding-top: 18px;
        }

        .order-card-footer div {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .order-card-footer span {
          color: #888;
          font-size: 12px;
        }

        .order-card-footer strong {
          color: #183f2e;
          font-size: 15px;
        }

        @media (max-width: 600px) {
          .customer-orders-page {
            padding: 35px 16px 60px;
          }

          h1 {
            font-size: 34px;
          }

          .order-card {
            padding: 18px;
          }

          .order-card-header {
            flex-direction: column;
          }

          .order-card-footer {
            flex-wrap: wrap;
          }

          .order-item {
            font-size: 13px;
          }
        }
      `}</style>
    </main>
  );
}
