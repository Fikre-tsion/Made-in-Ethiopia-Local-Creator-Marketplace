
import Link from "next/link";

export default function ShopCard({ shop }) {
  return (
    <article className="shop-card">
      <Link
        href={`/shops/${shop.id}`}
        className="shop-card-link"
        aria-label={`Explore ${shop.name}`}
      >
        <div className={`shop-art ${shop.color || "sand"}`}>
          {shop.image ? (
            <img
              src={shop.image}
              alt={shop.name}
              className="shop-image"
            />
          ) : (
            <span>{shop.emoji || "🏪"}</span>
          )}
        </div>

        <div className="shop-info">
          <span className="shop-category">
            {shop.category}
          </span>

          <h3 className="shop-name">{shop.name}</h3>

          <p className="shop-location">
            <span aria-hidden="true">📍</span>{" "}
            {shop.location}
          </p>

          <p className="shop-description">
            {shop.description}
          </p>

          <div className="shop-card-footer">
            <span className="shop-made-in">
              🇪🇹 Made in Ethiopia
            </span>

            <span className="shop-arrow" aria-hidden="true">
              →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
