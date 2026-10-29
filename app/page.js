import Link from "next/link";

export default function Home() {
  return (
    <main className="welcome-page">
      <section className="welcome-hero">
        <div className="welcome-content">
          <p className="eyebrow">SUPPORT • SHOP • CELEBRATE</p>

          <h1>
            Discover Ethiopia&apos;s
            <br />
            Creativity
          </h1>

          <p className="welcome-description">
            A marketplace connecting talented Ethiopian creators
            with people who appreciate locally made products.
          </p>

          <h2 className="welcome-question">
            How would you like to join us?
          </h2>

          <div className="welcome-cards">

            {/* CREATOR */}
            <div className="welcome-card creator-choice">
              <div className="welcome-card-image creator-image" />

              <div className="welcome-card-content">
                <span className="welcome-icon">🎨</span>

                <h2>I&apos;m a Creator</h2>

                <p>
                  Showcase your handmade products, reach more
                  customers, and grow your creative business.
                </p>

                <ul>
                  <li>✓ Create and manage your shop</li>
                  <li>✓ List and sell your products</li>
                  <li>✓ Connect with customers</li>
                </ul>

                <Link
                  href="/login?role=creator"
                  className="welcome-button creator-button"
                >
                  Continue as Creator →
                </Link>
              </div>
            </div>

            {/* CUSTOMER */}
            <div className="welcome-card customer-choice">
              <div className="welcome-card-image customer-image" />

              <div className="welcome-card-content">
                <span className="welcome-icon">🛍️</span>

                <h2>I&apos;m a Customer</h2>

                <p>
                  Discover authentic Ethiopian products,
                  support local creators, and bring a piece
                  of Ethiopia home.
                </p>

                <ul>
                  <li>✓ Explore unique handmade products</li>
                  <li>✓ Support Ethiopian creators</li>
                  <li>✓ Save favorites and shop easily</li>
                </ul>

                <Link
                  href="/login?role=customer"
                  className="welcome-button customer-button"
                >
                  Continue as Customer →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="welcome-benefits">
        <div>
          <span>🌿</span>
          <h3>Support Local Talent</h3>
          <p>Empower Ethiopian creators and their communities.</p>
        </div>

        <div>
          <span>💎</span>
          <h3>Authentic Products</h3>
          <p>Discover unique, high-quality handmade items.</p>
        </div>

        <div>
          <span>🤝</span>
          <h3>Stronger Communities</h3>
          <p>Help preserve Ethiopian culture and traditions.</p>
        </div>

        <div>
          <span>❤️</span>
          <h3>A Brighter Future</h3>
          <p>Together, we create more opportunities for local creators.</p>
        </div>
      </section>
    </main>
  );
}