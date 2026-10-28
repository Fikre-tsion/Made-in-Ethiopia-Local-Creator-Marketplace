
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import products from "../../data/products";
import shops from "../../data/shops";
import ProductCard from "../../components/ProductCard";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [favoritesOnly, setFavoritesOnly] = useState(searchParams.get("favorites") === "1");

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();
    const shop = shops.find((item) => item.id === product.shopId);
    return (searchText === "" ||
      product.name.toLowerCase().includes(searchText) ||
      product.description.toLowerCase().includes(searchText) ||
      shop?.name.toLowerCase().includes(searchText)) &&
      (category === "All" || product.category === category) &&
      (!favoritesOnly || (typeof window !== "undefined" && JSON.parse(window.localStorage.getItem("made-in-ethiopia-favorites") || "[]").includes(product.id)));
  });
  const sortedProducts = [...filteredProducts].sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : a.id - b.id);

  return (
    <main>
      <section className="marketplace-header">
        <p className="eyebrow">DISCOVER LOCAL CREATIVITY</p>
        <h1>Discover Ethiopian products</h1>
        <p>
          Explore handmade products from local creators and find something made in Ethiopia.
        </p>
      </section>

      <section className="marketplace-content">
        <div className="marketplace-controls">
          <input
            type="search"
            placeholder="Search products or creators..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search products or creators"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter products by category"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products">
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>
        <div className="category-row" aria-label="Product categories">
          {categories.map((item) => <button key={item} type="button" className={category === item ? "category-chip is-selected" : "category-chip"} onClick={() => setCategory(item)}>{item}</button>)}
          <button type="button" className={favoritesOnly ? "category-chip is-selected" : "category-chip"} onClick={() => setFavoritesOnly((value) => !value)}>Favorites</button>
          {(search || category !== "All" || sort !== "featured" || favoritesOnly) && <button type="button" className="clear-filters" onClick={() => { setSearch(""); setCategory("All"); setSort("featured"); setFavoritesOnly(false); }}>Clear filters</button>}
        </div>

        <p className="results-count">
          {sortedProducts.length} products found
        </p>

        {sortedProducts.length > 0 ? (
          <div className="product-grid">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="empty-state">
            No products match those filters. Clear your search or choose another category.
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
