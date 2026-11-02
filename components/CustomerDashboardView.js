
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

function DashboardIcon({ name }) {
  const paths = {
    products: (
      <>
        <path d="M7 8.5 12 5l5 3.5v6L12 18l-5-3.5v-6Z" />
        <path d="m7.2 8.7 4.8 3.1 4.8-3.1M12 11.8V18" />
        <path d="M9.3 6.8 14 10" />
      </>
    ),
    favorites: (
      <path d="M12 19.2 4.9 12a4.25 4.25 0 0 1 6-6L12 7l1.1-1a4.25 4.25 0 0 1 6 6L12 19.2Z" />
    ),
    basket: (
      <>
        <path d="M5 9h14l-1 9H6L5 9Z" />
        <path d="m8 9 2-4m6 4-2-4M3.5 9h17" />
        <path d="M8.5 12.5h.01M12 12.5h.01M15.5 12.5h.01" />
      </>
    ),
    orders: (
      <>
        <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
        <path d="M14 3.5v4h4M9 12h6M9 16h6" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function CustomerDashboardView({ name }) {
  const searchParams = useSearchParams();
  const isVerified = searchParams.get("verified") === "1";

  return (
    <main className="customer-dashboard-page">
      <section className="customer-dashboard-container">

        {isVerified && (
          <div
            role="status"
            style={{
              background: "#e8f5ec",
              color: "#245c43",
              border: "1px solid #b9ddc5",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "24px",
            }}
          >
            <strong>✓ Email verified successfully!</strong>
            <p style={{ margin: "5px 0 0" }}>
              Your email has been verified. Welcome to Made in Ethiopia!
            </p>
          </div>
        )}

        <div className="customer-dashboard-header">
          <div>
            <p className="eyebrow">CUSTOMER SPACE</p>
            <h1>Welcome, {name}! 👋</h1>
            <p>
              Discover beautiful Ethiopian creations, support local makers,
              and explore products made with love.
            </p>
          </div>

          <Link href="/marketplace" className="primary-button">
            Explore Marketplace →
          </Link>
        </div>

        <div className="customer-dashboard-grid">
          <Link href="/marketplace" className="customer-dashboard-card">
            <span className="customer-dashboard-icon">
              <DashboardIcon name="products" />
            </span>
            <span className="customer-dashboard-kicker">DISCOVER</span>
            <h2>Explore Products</h2>
            <p>
              Browse unique handmade products from talented Ethiopian creators.
            </p>
            <span className="customer-dashboard-link">
              Browse Marketplace <span aria-hidden="true">→</span>
            </span>
          </Link>

          <Link href="/favorites" className="customer-dashboard-card">
            <span className="customer-dashboard-icon">
              <DashboardIcon name="favorites" />
            </span>
            <span className="customer-dashboard-kicker">YOUR COLLECTION</span>
            <h2>My Favorites</h2>
            <p>
              Keep your favorite creations and shops together in one place.
            </p>
            <span className="customer-dashboard-link">
              View Favorites <span aria-hidden="true">→</span>
            </span>
          </Link>

          <Link href="/cart" className="customer-dashboard-card">
            <span className="customer-dashboard-icon">
              <DashboardIcon name="basket" />
            </span>
            <span className="customer-dashboard-kicker">READY TO SHOP</span>
            <h2>My Basket</h2>
            <p>
              Review the products you have added to your shopping basket.
            </p>
            <span className="customer-dashboard-link">
              View Basket <span aria-hidden="true">→</span>
            </span>
          </Link>

          <Link href="/customer/orders" className="customer-dashboard-card">
            <span className="customer-dashboard-icon">
              <DashboardIcon name="orders" />
            </span>
            <span className="customer-dashboard-kicker">YOUR PURCHASES</span>
            <h2>My Orders</h2>
            <p>
              View your previous purchases, order details, and order status.
            </p>
            <span className="customer-dashboard-link">
              View Orders <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>

        <section className="customer-discover-section">
          <div>
            <p className="eyebrow">MADE WITH CULTURE</p>
            <h2>Every creation tells a story.</h2>
            <p>
              From traditional textiles to handmade crafts, discover the
              creativity and craftsmanship that make Ethiopia unique.
            </p>
            <Link href="/marketplace" className="secondary-button">
              Start Exploring →
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
