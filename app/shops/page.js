"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import shops from "../../data/shops";

export default function CreatorsPage() {
  // STATES
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All crafts");
  const [region, setRegion] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");

  // CATEGORIES
  const categories = [
    "All crafts",
    ...new Set(shops.map((shop) => shop.category).filter(Boolean)),
  ];

  // REGIONS / LOCATIONS
  const regions = [
    "All",
    ...new Set(shops.map((shop) => shop.location).filter(Boolean)),
  ];

  // FILTER AND SORT CREATORS
  const filteredShops = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = shops.filter((shop) => {
      const matchesCategory =
        category === "All crafts" || shop.category === category;

      const matchesRegion =
        region === "All" || shop.location === region;

      const matchesSearch =
        !query ||
        [
          shop.name,
          shop.category,
          shop.location,
          shop.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesRegion && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "nameDesc") {
        return b.name.localeCompare(a.name);
      }

      return 0;
    });
  }, [search, category, region, sortBy]);

  // HANDLE SINGLE FILTER DROPDOWN
  const handleFilterChange = (event) => {
    const value = event.target.value;

    // BACK TO MAIN FILTERS
    if (value === "back") {
      setFilterType("");
      setFilterValue("");
      setCategory("All crafts");
      setRegion("All");
      setSortBy("default");
      return;
    }

    // CHOOSE FILTER TYPE
    if (value.startsWith("type:")) {
      const selectedType = value.split(":")[1];

      setFilterType(selectedType);
      setFilterValue("");

      // Reset previous filters
      setCategory("All crafts");
      setRegion("All");
      setSortBy("default");
      return;
    }

    // CHOOSE FILTER OPTION
    const [type, selectedValue] = value.split(":");

    setFilterValue(selectedValue);

    if (type === "category") {
      setCategory(selectedValue);
    }

    if (type === "region") {
      setRegion(selectedValue);
    }

    if (type === "sort") {
      setSortBy(selectedValue);
    }
  };

  // RESET FILTERS
  const resetFilters = () => {
    setSearch("");
    setCategory("All crafts");
    setRegion("All");
    setSortBy("default");
    setFilterType("");
    setFilterValue("");
  };

  const hasActiveFilters =
    search ||
    category !== "All crafts" ||
    region !== "All" ||
    sortBy !== "default";

  return (
    <main className="creators-page">

      {/* HERO SECTION */}
      <section className="creators-hero">
        <div>
          <p className="eyebrow">MEET THE MAKERS</p>

          <h1>Meet the hands behind the heritage.</h1>

          <p>
            Discover the people, studios, and small brands
            creating beautiful products made in Ethiopia.
          </p>

          <div className="creator-stats">
            <span>
              <strong>{shops.length}+</strong> Active studios
            </span>

            <span>
              <strong>6</strong> Regions represented
            </span>

            <span>
              <strong>100%</strong> Local creativity
            </span>
          </div>
        </div>
      </section>

      {/* CREATORS CONTENT */}
      <section className="creators-content">

        {/* SEARCH AND FILTER */}
        <div className="creator-filters">

          {/* SEARCH BAR */}
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search creator, region, or craft..."
            aria-label="Search creator, region, or craft"
          />

          {/* SINGLE FILTER DROPDOWN */}
          <select
            value={
              filterType
                ? `${filterType}:${filterValue}`
                : ""
            }
            onChange={handleFilterChange}
            aria-label="Filter creators"
          >
            {filterType === "" ? (
              <>
                <option value="">Filter By</option>
                <option value="type:category">Category</option>
                <option value="type:region">Region</option>
                <option value="type:sort">Sort By</option>
              </>
            ) : (
              <>
                {/* FILTER HEADING */}
                <option
                  value={`${filterType}:`}
                  disabled
                >
                  {filterType === "category"
                    ? "Category"
                    : filterType === "region"
                    ? "Region"
                    : "Sort By"}
                </option>

                {/* BACK OPTION */}
                <option value="back">
                  ← Back to Filters
                </option>

                {/* CATEGORY OPTIONS */}
                {filterType === "category" &&
                  categories.map((item) => (
                    <option
                      key={item}
                      value={`category:${item}`}
                    >
                      {item === "All crafts"
                        ? "All Crafts"
                        : item}
                    </option>
                  ))}

                {/* REGION OPTIONS */}
                {filterType === "region" &&
                  regions.map((item) => (
                    <option
                      key={item}
                      value={`region:${item}`}
                    >
                      {item === "All"
                        ? "All Regions"
                        : item}
                    </option>
                  ))}

                {/* SORT OPTIONS */}
                {filterType === "sort" && (
                  <>
                    <option value="sort:default">
                      Default
                    </option>

                    <option value="sort:name">
                      Name: A–Z
                    </option>

                    <option value="sort:nameDesc">
                      Name: Z–A
                    </option>
                  </>
                )}
              </>
            )}
          </select>
        </div>

        {/* CLEAR FILTERS */}
        {hasActiveFilters && (
          <button
            type="button"
            className="clear-filters"
            onClick={resetFilters}
          >
            Clear Filters
          </button>
        )}

        {/* RESULTS COUNT */}
        <p className="results-count">
          {filteredShops.length}{" "}
          {filteredShops.length === 1
            ? "creator"
            : "creators"}{" "}
          found
        </p>

        {/* EMPTY STATE */}
        {filteredShops.length === 0 ? (
          <section className="creator-empty">
            <h2>No creators match your search</h2>

            <p>
              Try clearing your search or choosing another filter.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          </section>
        ) : (
          /* CREATOR CARDS */
          <div className="creator-directory-grid">
            {filteredShops.map((shop) => (
              <article
                className="creator-directory-card"
                key={shop.id}
              >
                <Link
                  href={`/shops/${shop.id}`}
                  className="creator-cover"
                >
                  <img src={shop.image} alt={shop.name} />

                  <span>{shop.category}</span>

                  <small>
                    Location: {shop.location}
                  </small>
                </Link>

                <div className="creator-directory-body">
                  <div className="creator-avatar">
                    {shop.name.charAt(0)}
                  </div>

                  <p className="eyebrow">
                    VERIFIED LOCAL CREATOR
                  </p>

                  <h2>{shop.name}</h2>

                  <p className="creator-directory-description">
                    {shop.description}
                  </p>

                  <div className="creator-directory-footer">
                    <span>Independent studio</span>

                    <Link
                      href={`/shops/${shop.id}`}
                      className="text-link"
                    >
                      View studio
                    </Link>
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