
import shops from "../../../data/shops";
import products from "../../../data/products";
import ProductCard from "../../../components/ProductCard";
import { notFound } from "next/navigation";

export default async function ShopProfilePage({ params }) {
  const { id } = await params;
  const shop = shops.find((item) => item.id === Number(id));

  if (!shop) {
    notFound();
  }

  const shopProducts = products.filter(
    (product) => product.shopId === shop.id
  );

  return (
    <main>
      <section className="marketplace-header">
        <div className={`shop-art ${shop.color || "sand"}`}>
          <span>{shop.emoji || "🏪"}</span>
        </div>

        <p className="eyebrow">{shop.category}</p>
        <h1>{shop.name}</h1>
        <p>{shop.description}</p>
        <p>📍 {shop.location}</p>
        <p>Contact: {shop.contact}</p>
      </section>

      <section className="marketplace-content">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FROM THIS CREATOR</p>
            <h2>Products from this shop</h2>
          </div>
          <a href="/marketplace" className="text-link">
            ← Back to shops
          </a>
        </div>

        {shopProducts.length > 0 ? (
          <div className="product-grid">
            {shopProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <p className="empty-state">
            This shop hasn't listed any products yet.
          </p>
        )}
      </section>
    </main>
  );
}
