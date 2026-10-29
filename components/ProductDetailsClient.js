"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import { createClient } from "../lib/supabase/client";
import shops from "../data/shops";

export default function ProductDetailsClient({ id }) {
  const [product, setProduct] = useState(null);
  const [creatorName, setCreatorName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      const client = createClient();
      const { data, error: productError } = await client
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!active) return;
      if (productError || !data) {
        setError("This product is no longer available.");
        return;
      }

      setProduct({
        ...data,
        name: data.name || data.title || data.product_name || "Untitled product",
        image: data.image_url || data.image || "",
        shopId: data.creator_id,
      });

      const { data: profile } = await client
        .from("profiles")
        .select("display_name")
        .eq("id", data.creator_id)
        .single();
      if (active) setCreatorName(profile?.display_name || "Local creator");
    }

    loadProduct();
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <main className="product-details-page">
        <p className="empty-state">{error}</p>
        <Link href="/marketplace" className="secondary-button">Back to marketplace</Link>
      </main>
    );
  }

  if (!product) {
    return <main className="product-details-page"><p className="empty-state">Loading product...</p></main>;
  }

  const shop = shops.find((item) => item.id === product.shopId);
  const description =
    product.description || product.details || "Handcrafted by a local creator.";

  return (
    <main className="product-details-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/marketplace">Marketplace</Link>
        <span>/</span><span>{product.name}</span>
      </nav>
      <section className="product-details">
        <div className={`product-details-art ${product.color || "sand"}`}>
          {product.image ? <img src={product.image} alt={product.name} /> : <span aria-hidden="true">🛍️</span>}
        </div>
        <div className="product-details-info">
          <p className="eyebrow">{product.category || "Handmade"}</p>
          <h1>{product.name}</h1>
          <p className="product-details-price">{Number(product.price || 0).toLocaleString()} ETB</p>
          <p className="product-details-description">{description}</p>
          <div className="creator-byline">
            <div className="creator-avatar">{(creatorName || shop?.name || "L").charAt(0)}</div>
            <div><span>Made by</span><span>{creatorName || shop?.name || "Local creator"}</span></div>
          </div>
          <div className="detail-actions"><AddToCartButton product={product} /></div>
        </div>
      </section>
    </main>
  );
}
