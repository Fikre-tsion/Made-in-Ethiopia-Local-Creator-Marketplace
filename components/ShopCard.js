
export default function ShopCard({ shop }) {
  return (
    <article className="shop-card">
      <div className={`shop-art ${shop.color || "sand"}`}>
        <span>{shop.emoji || "🏪"}</span>
      </div>

      <div className="shop-info">
        <p className="product-category">{shop.category}</p>

        <h3>{shop.name}</h3>

        <p className="shop-location">
          📍 {shop.location}
        </p>

        <p className="shop-description">
          {shop.description}
        </p>

        <a
          href={`/shops/${shop.id}`}
          className="text-link"
        >
          Explore shop →
        </a>
      </div>
    </article>
  );
}
