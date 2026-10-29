import Link from "next/link";

export const metadata = {
  title: "Customer Demo | Made in Ethiopia",
};

export default function CustomerDemoPage() {
  return (
    <main className="dashboard-page demo-page">
      <section className="dashboard-card">
        <p className="eyebrow">DEMO PREVIEW · CUSTOMER</p>

        <h1>Customer Space Preview</h1>

        <p className="demo-description">
          Discover Ethiopian craftsmanship, explore local creators,
          and experience the marketplace before creating an account.
        </p>

        <div className="customer-demo-content">
          <div className="customer-demo-icon">✦</div>

          <h2>Discover Local Makers</h2>

          <p>
            Explore beautiful handmade products, discover talented
            Ethiopian creators, and find something truly unique.
          </p>

          <div className="customer-demo-features">
            <div>
              <span>🛍️</span>
              <h3>Explore Products</h3>
              <p>Discover authentic Ethiopian creations.</p>
            </div>

            <div>
              <span>❤️</span>
              <h3>Save Favorites</h3>
              <p>Keep track of products and shops you love.</p>
            </div>

            <div>
              <span>🎨</span>
              <h3>Support Creators</h3>
              <p>Connect with talented local makers.</p>
            </div>
          </div>

          <div className="demo-actions customer-demo-actions">
            <Link
              href="/marketplace"
              className="primary-button"
            >
              Explore Marketplace →
            </Link>

            <Link
              href="/register?role=customer"
              className="demo-outline-button"
            >
              Create Customer Account →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}