import Link from "next/link";

export default function CustomerDashboardView({ name }) {
  return (
    <main className="customer-dashboard-page">
      <section className="customer-dashboard-container">
        <div className="customer-dashboard-header">
          <div>
            <p className="eyebrow">CUSTOMER SPACE</p>
            <h1>Welcome, {name}! 👋</h1>
            <p>Discover beautiful Ethiopian creations, support local makers, and explore products made with love.</p>
          </div>
          <Link href="/marketplace" className="primary-button">Explore Marketplace →</Link>
        </div>
        <div className="customer-dashboard-grid">
          <Link href="/marketplace" className="customer-dashboard-card">
            <span className="customer-dashboard-icon" aria-hidden="true">🛍️</span>
            <span className="customer-dashboard-kicker">DISCOVER</span>
            <h2>Explore Products</h2>
            <p>Browse unique handmade products from talented Ethiopian creators.</p>
            <span className="customer-dashboard-link">Browse Marketplace <span aria-hidden="true">→</span></span>
          </Link>
          <Link href="/favorites" className="customer-dashboard-card">
            <span className="customer-dashboard-icon" aria-hidden="true">❤️</span>
            <span className="customer-dashboard-kicker">YOUR COLLECTION</span>
            <h2>My Favorites</h2>
            <p>Keep your favorite creations and shops together in one place.</p>
            <span className="customer-dashboard-link">View Favorites <span aria-hidden="true">→</span></span>
          </Link>
          <Link href="/cart" className="customer-dashboard-card">
            <span className="customer-dashboard-icon" aria-hidden="true">🛒</span>
            <span className="customer-dashboard-kicker">READY TO SHOP</span>
            <h2>My Basket</h2>
            <p>Review the products you have added to your shopping basket.</p>
            <span className="customer-dashboard-link">View Basket <span aria-hidden="true">→</span></span>
          </Link>
        </div>
        <section className="customer-discover-section">
          <div>
            <p className="eyebrow">MADE WITH CULTURE</p>
            <h2>Every creation tells a story.</h2>
            <p>From traditional textiles to handmade crafts, discover the creativity and craftsmanship that make Ethiopia unique.</p>
            <Link href="/marketplace" className="secondary-button">Start Exploring →</Link>
          </div>
        </section>
      </section>
    </main>
  );
}
