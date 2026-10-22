
export default function ProductCard({ product }) {
  return (
    <a
      href={`/marketplace?search=${encodeURIComponent(product.name)}`}
      className="product-card product-card-link"
    >
      <div className={`product-art ${product.color || "sand"}`}>
        <span>{product.emoji || "🛍️"}</span>
      </div>

      <div className="product-info">
        <p className="product-category">
          {product.category}
        </p>

        <h3>{product.name}</h3>

        <span className="text-link">
          Find shops →
        </span>
      </div>
    </a>
  );
}
