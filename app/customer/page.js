import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { requireRole } from "../../lib/auth/server";

export const metadata = {
  title: "Customer Dashboard | Made in Ethiopia",
};

// Wait for an actual request before checking authentication
async function AuthenticatedCustomerDashboard() {
  await connection();

  const { user, profile } = await requireRole("customer");

  const name =
    profile?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Customer";

  return (
    <main className="customer-dashboard-page">
      <section className="customer-dashboard-container">

        {/* WELCOME SECTION */}
        <div className="customer-dashboard-header">
          <div>
            <p className="eyebrow">CUSTOMER SPACE</p>

            <h1>Welcome, {name}! 👋</h1>

            <p>
              Discover beautiful Ethiopian creations, support
              local makers, and explore products made with love.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="primary-button"
          >
            Explore Marketplace →
          </Link>
        </div>

        {/* QUICK ACCESS */}
        <div className="customer-dashboard-grid">

          {/* EXPLORE PRODUCTS */}
          <Link
            href="/marketplace"
            className="customer-dashboard-card"
          >
            <span className="customer-dashboard-icon">🛍️</span>

            <h2>Explore Products</h2>

            <p>
              Browse unique handmade products from talented
              Ethiopian creators.
            </p>

            <span className="customer-dashboard-link">
              Browse Marketplace →
            </span>
          </Link>

          {/* FAVORITES */}
          <Link
            href="/favorites"
            className="customer-dashboard-card"
          >
            <span className="customer-dashboard-icon">❤️</span>

            <h2>My Favorites</h2>

            <p>
              Keep your favorite creations and shops
              together in one place.
            </p>

            <span className="customer-dashboard-link">
              View Favorites →
            </span>
          </Link>

          {/* SHOPPING BASKET */}
          <Link
            href="/cart"
            className="customer-dashboard-card"
          >
            <span className="customer-dashboard-icon">🛒</span>

            <h2>My Basket</h2>

            <p>
              Review the products you have added
              to your shopping basket.
            </p>

            <span className="customer-dashboard-link">
              View Basket →
            </span>
          </Link>

        </div>

        {/* DISCOVER SECTION */}
        <section className="customer-discover-section">
          <div>
            <p className="eyebrow">MADE WITH CULTURE</p>

            <h2>Every creation tells a story.</h2>

            <p>
              From traditional textiles to handmade crafts,
              discover the creativity and craftsmanship
              that make Ethiopia unique.
            </p>

            <Link
              href="/marketplace"
              className="secondary-button"
            >
              Start Exploring →
            </Link>
          </div>
        </section>

      </section>
    </main>
  );
}

// Main page with Suspense boundary
export default function CustomerPage() {
  return (
    <Suspense
      fallback={
        <main className="customer-dashboard-page">
          <section className="customer-dashboard-container">
            <p>Loading your customer dashboard...</p>
          </section>
        </main>
      }
    >
      <AuthenticatedCustomerDashboard />
    </Suspense>
  );
}