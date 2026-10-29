import Link from "next/link";
import products from "../../data/products";
import FeaturedCarousel from "../../components/FeaturedCarousel";

export default function Home() {
  return (
    <main>
      {/* HERO SECTION */}
      <section className="hero">
        <p className="eyebrow">
          MADE WITH CULTURE. MADE IN ETHIOPIA.
        </p>

        <h1>
          Discover the beauty
          <br />
          of Ethiopian creativity.
        </h1>

        <p className="hero-description">
          Explore unique handmade products, support local creators,
          and bring a piece of Ethiopian culture into your life.
        </p>

        <Link href="/marketplace" className="primary-button">
          Explore Marketplace →
        </Link>
      </section>

      {/* FEATURED CREATIONS */}
      <section className="featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">HANDPICKED FOR YOU</p>
            <h2>Featured creations</h2>
          </div>

          <Link href="/marketplace" className="text-link">
            View all products →
          </Link>
        </div>

        {/* AUTOMATIC PRODUCT CAROUSEL */}
        <FeaturedCarousel products={products} />
      </section>

      {/* CREATOR BANNER */}
      <section className="creator-banner">
        <div>
          <p className="eyebrow">
            ARE YOU A LOCAL CREATOR?
          </p>

          <h2>Your creativity deserves to be seen.</h2>

          <p>
            Showcase your work and help share Ethiopian craftsmanship
            with more people.
          </p>
        </div>

        <Link
          href="/register?role=creator"
          className="secondary-button"
        >
          Join Our Community →
        </Link>
      </section>
    </main>
  );
}