import { notFound } from "next/navigation";
import Link from "next/link";
import products from "../../../data/products";
import AddToCartButton from "../../../components/AddToCartButton";
import shops from "../../../data/shops";

export const instant = false;

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;
  const product = products.find((item) => item.id === Number(id));
  const shop = product && shops.find((item) => item.id === product.shopId);

  if (!product) {
    notFound();
  }

  return (
    <main className="product-details-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/marketplace">Marketplace</Link><span>/</span><span>{product.name}</span></nav>
      <section className="product-details">
        <div className={`product-details-art ${product.color || "sand"}`}>
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <span aria-hidden="true">{product.emoji || "🛍️"}</span>
          )}
        </div>
        <div className="product-details-info">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="product-details-price">
            {product.price?.toLocaleString()} ETB
          </p>
          <p className="product-details-description">
            {product.description}
          </p>
          {shop && <div className="creator-byline"><div className="creator-avatar">{shop.name.charAt(0)}</div><div><span>Made by</span><Link href={`/shops/${shop.id}`}>{shop.name}</Link></div></div>}
          <div className="detail-actions"><AddToCartButton product={product} />{shop?.contact?.includes("@") ? <a className="secondary-button" href={`mailto:${shop.contact}`}>Contact creator</a> : <span className="contact-unavailable">Creator contact details are not available yet.</span>}</div>
        </div>
      </section>
    </main>
  );
}
