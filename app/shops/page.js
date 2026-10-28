"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import shops from "../../data/shops";

export default function CreatorsPage() {
  const [category, setCategory] = useState("All crafts");
  const [search, setSearch] = useState("");
  const categories = ["All crafts", ...new Set(shops.map((shop) => shop.category))];

  const filteredShops = useMemo(() => {
    const query = search.trim().toLowerCase();
    return shops.filter((shop) => {
      const matchesCategory = category === "All crafts" || shop.category === category;
      const matchesSearch = !query || [shop.name, shop.category, shop.location, shop.description]
        .join(" ")
        .toLowerCase()
        .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  return (
    <main className="creators-page">
      <section className="creators-hero">
        <div>
          <p className="eyebrow">MEET THE MAKERS</p>
          <h1>Meet the hands behind the heritage.</h1>
          <p>Discover the people, studios, and small brands creating beautiful products made in Ethiopia.</p>
          <div className="creator-stats">
            <span><strong>{shops.length}+</strong> Active studios</span>
            <span><strong>6</strong> Regions represented</span>
            <span><strong>100%</strong> Local creativity</span>
          </div>
        </div>
      </section>

      <section className="creators-content">
        <div className="creator-filters">
          <div className="category-row" aria-label="Creator categories">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                className={category === item ? "category-chip is-selected" : "category-chip"}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search creator, region, or craft..."
            aria-label="Search creator, region, or craft"
          />
        </div>

        <p className="results-count">{filteredShops.length} creators found</p>
        {filteredShops.length === 0 ? (
          <section className="creator-empty">
            <h2>No creators match your search</h2>
            <p>Try clearing your search or choosing another craft category.</p>
            <button type="button" className="primary-button" onClick={() => { setSearch(""); setCategory("All crafts"); }}>
              Reset filters
            </button>
          </section>
        ) : (
          <div className="creator-directory-grid">
            {filteredShops.map((shop) => (
              <article className="creator-directory-card" key={shop.id}>
                <Link href={`/shops/${shop.id}`} className="creator-cover">
                  <img src={shop.image} alt="" />
                  <span>{shop.category}</span>
                  <small>Location: {shop.location}</small>
                </Link>
                <div className="creator-directory-body">
                  <div className="creator-avatar">{shop.name.charAt(0)}</div>
                  <p className="eyebrow">VERIFIED LOCAL CREATOR</p>
                  <h2>{shop.name}</h2>
                  <p className="creator-directory-description">{shop.description}</p>
                  <div className="creator-directory-footer">
                    <span>Independent studio</span>
                    <Link href={`/shops/${shop.id}`} className="text-link">View studio</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
