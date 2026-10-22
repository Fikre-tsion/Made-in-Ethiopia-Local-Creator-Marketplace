
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ShopCard from "../../components/ShopCard";
import shops from "../../data/shops";
import products from "../../data/products";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const categories = [
    "All",
    ...new Set(shops.map((shop) => shop.category)),
  ];

  const filteredShops = shops.filter((shop) => {
    const searchText = search.toLowerCase();

    const matchesShop =
      shop.name.toLowerCase().includes(searchText) ||
      shop.category.toLowerCase().includes(searchText) ||
      shop.description.toLowerCase().includes(searchText);

    const matchesProduct = products.some(
      (product) =>
        product.shopId === shop.id &&
        product.name.toLowerCase().includes(searchText)
    );

    const matchesSearch =
      searchText === "" || matchesShop || matchesProduct;

    const matchesCategory =
      category === "All" || shop.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main>
      <section className="marketplace-header">
        <p className="eyebrow">DISCOVER LOCAL CREATIVITY</p>
        <h1>Discover Ethiopian Shops</h1>
        <p>
          Find local creators, explore their stories,
          and discover products made in Ethiopia.
        </p>
      </section>

      <section className="marketplace-content">
        <div className="marketplace-controls">
          <input
            type="search"
            placeholder="Search products or shops..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search products or shops"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter shops by category"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <p className="results-count">
          {filteredShops.length} shops found
        </p>

        {filteredShops.length > 0 ? (
          <div className="product-grid">
            {filteredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <p className="empty-state">
            No shops found. Try another search or category.
          </p>
        )}
      </section>
    </main>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<p>Loading marketplace...</p>}>
      <MarketplaceContent />
    </Suspense>
  );
}
