
import ProductCard from "../components/ProductCard";
import products from "../data/products";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">MADE WITH CULTURE. MADE IN ETHIOPIA.</p>

        <h1>
          Discover the beauty
          <br />
          of Ethiopian creativity.
        </h1>

        <p className="hero-description">
          Explore unique handmade products, support local creators,
          and bring a piece of Ethiopian culture into your life.
        </p>

        <a href="/marketplace" className="primary-button">
          Explore Marketplace →
        </a>
      </section>

      <section className="featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">HANDPICKED FOR YOU</p>
            <h2>Featured creations</h2>
          </div>

          <a href="/marketplace" className="text-link">
            View all products →
          </a>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="creator-banner">
        <div>
          <p className="eyebrow">ARE YOU A LOCAL CREATOR?</p>
          <h2>Your creativity deserves to be seen.</h2>
          <p>
            Showcase your work and help share Ethiopian craftsmanship
            with more people.
          </p>
        </div>

        <a href="/register" className="secondary-button">
          Join Our Community →
        </a>
      </section>
    </main>
  );
}
