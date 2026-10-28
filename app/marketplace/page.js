"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import products from "../../data/products";
import shops from "../../data/shops";
import ProductCard from "../../components/ProductCard";

const FAVORITES_KEY = "made-in-ethiopia-favorites";

// Read saved favorite product IDs
function getSavedFavorites() {
  if (typeof window === "undefined") return [];

  try {
    const saved = JSON.parse(
      window.localStorage.getItem(FAVORITES_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function MarketplaceContent() {
  const searchParams = useSearchParams();

  // Check the URL directly
  const isFavoritesPage = searchParams.get("favorites") === "1";

  // STATES
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [sort, setSort] = useState("featured");

  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);

  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");

  // SYNC SEARCH WITH URL
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  // LOAD FAVORITES
  useEffect(() => {
    const loadFavorites = () => {
      setFavoriteIds(getSavedFavorites());
      setFavoritesLoaded(true);
    };

    loadFavorites();

    // Listen for favorites changed in this tab
    window.addEventListener("favoritesUpdated", loadFavorites);

    // Listen for favorites changed in another tab
    window.addEventListener("storage", loadFavorites);

    // Refresh favorites when returning to the page
    window.addEventListener("focus", loadFavorites);

    return () => {
      window.removeEventListener(
        "favoritesUpdated",
        loadFavorites
      );

      window.removeEventListener(
        "storage",
        loadFavorites
      );

      window.removeEventListener(
        "focus",
        loadFavorites
      );
    };
  }, []);

  // RESET FILTERS WHEN SWITCHING PAGES
  useEffect(() => {
    setCategory("All");
    setPriceRange("All");
    setSort("featured");
    setFilterType("");
    setFilterValue("");
  }, [isFavoritesPage]);

  // GET CATEGORIES
  const categories = [
    "All",
    ...new Set(
      products.map((product) => product.category).filter(Boolean)
    ),
  ];

  // CONVERT PRODUCT PRICE TO NUMBER
  const getPrice = (product) => {
    const price = Number(
      String(product.price ?? "").replace(/[^0-9.]/g, "")
    );

    return Number.isFinite(price) && price > 0
      ? price
      : null;
  };

  // FILTER PRODUCTS
  const filteredProducts = products.filter((product) => {
    const searchText = search.trim().toLowerCase();

    const shop = shops.find(
      (item) => item.id === product.shopId
    );

    // SEARCH
    const matchesSearch =
      searchText === "" ||
      product.name.toLowerCase().includes(searchText) ||
      (product.description || "")
        .toLowerCase()
        .includes(searchText) ||
      (shop?.name || "")
        .toLowerCase()
        .includes(searchText);

    // CATEGORY
    const matchesCategory =
      category === "All" ||
      product.category === category;

    // PRICE
    const price = getPrice(product);

    let matchesPrice = true;

    if (priceRange === "under1000") {
      matchesPrice = price !== null && price < 1000;
    } else if (priceRange === "1000to3000") {
      matchesPrice =
        price !== null &&
        price >= 1000 &&
        price <= 3000;
    } else if (priceRange === "above3000") {
      matchesPrice = price !== null && price > 3000;
    }

    // FAVORITES
    const isFavorite = favoriteIds.some(
      (id) => String(id) === String(product.id)
    );

    // Favorites page must ONLY show saved products
    const matchesFavorites =
      !isFavoritesPage || isFavorite;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPrice &&
      matchesFavorites
    );
  });

  // SORT PRODUCTS
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "price-low") {
      return (
        (getPrice(a) ?? Infinity) -
        (getPrice(b) ?? Infinity)
      );
    }

    if (sort === "price-high") {
      return (
        (getPrice(b) ?? -Infinity) -
        (getPrice(a) ?? -Infinity)
      );
    }

    if (sort === "name") {
      return a.name.localeCompare(b.name);
    }

    return Number(a.id) - Number(b.id);
  });

  // HANDLE SINGLE FILTER DROPDOWN
  const handleFilterChange = (event) => {
    const value = event.target.value;

    // BACK TO MAIN FILTERS
    if (value === "back") {
      setFilterType("");
      setFilterValue("");
      setCategory("All");
      setPriceRange("All");
      setSort("featured");
      return;
    }

    // SELECT FILTER TYPE
    if (value.startsWith("type:")) {
      const selectedType = value.split(":")[1];

      setFilterType(selectedType);
      setFilterValue("");

      // Reset previous filter
      setCategory("All");
      setPriceRange("All");
      setSort("featured");

      return;
    }

    // SELECT FILTER VALUE
    const [type, selectedValue] = value.split(":");

    setFilterValue(selectedValue);

    if (type === "category") {
      setCategory(selectedValue);
    }

    if (type === "price") {
      setPriceRange(selectedValue);
    }

    if (type === "sort") {
      setSort(selectedValue);
    }
  };

  // CLEAR FILTERS
  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setPriceRange("All");
    setSort("featured");
    setFilterType("");
    setFilterValue("");
  };

  const hasActiveFilters =
    search !== "" ||
    category !== "All" ||
    priceRange !== "All" ||
    sort !== "featured";

  return (
    <main>

      {/* MARKETPLACE HEADER */}
      <section className="marketplace-header">

        <p className="eyebrow">
          DISCOVER LOCAL CREATIVITY
        </p>

        <h1>
          {isFavoritesPage
            ? "My Favorite Products"
            : "Discover Ethiopian Products"}
        </h1>

        <p>
          {isFavoritesPage
            ? "Explore the Ethiopian products you've saved."
            : "Explore handmade products from local creators and find something made in Ethiopia."}
        </p>

      </section>

      {/* MARKETPLACE CONTENT */}
      <section className="marketplace-content">

        {/* SEARCH AND FILTER */}
        <div className="marketplace-controls">

          {/* SEARCH BAR */}
          <input
            type="search"
            placeholder="Search products or creators..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            aria-label="Search products or creators"
          />

          {/* SINGLE FILTER DROPDOWN */}
          <select
            value={
              filterType
                ? `${filterType}:${filterValue}`
                : ""
            }
            onChange={handleFilterChange}
            aria-label="Filter products"
          >

            {filterType === "" ? (
              <>
                <option value="">
                  Filter By
                </option>

                <option value="type:category">
                  Category
                </option>

                <option value="type:price">
                  Price
                </option>

                <option value="type:sort">
                  Sort By
                </option>
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
                    : filterType === "price"
                    ? "Price"
                    : "Sort By"}
                </option>

                {/* BACK TO FILTERS */}
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
                      {item === "All"
                        ? "All Categories"
                        : item}
                    </option>
                  ))}

                {/* PRICE OPTIONS */}
                {filterType === "price" && (
                  <>
                    <option value="price:All">
                      All Prices
                    </option>

                    <option value="price:under1000">
                      Under 1,000 ETB
                    </option>

                    <option value="price:1000to3000">
                      1,000–3,000 ETB
                    </option>

                    <option value="price:above3000">
                      Above 3,000 ETB
                    </option>
                  </>
                )}

                {/* SORT OPTIONS */}
                {filterType === "sort" && (
                  <>
                    <option value="sort:featured">
                      Featured
                    </option>

                    <option value="sort:name">
                      Name: A–Z
                    </option>

                    <option value="sort:price-low">
                      Price: Low to High
                    </option>

                    <option value="sort:price-high">
                      Price: High to Low
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
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        )}

        {/* RESULTS COUNT */}
        <p className="results-count">
          {favoritesLoaded ? sortedProducts.length : 0}{" "}
          {favoritesLoaded && sortedProducts.length === 1
            ? "product"
            : "products"}{" "}
          found
        </p>

        {/* PRODUCT GRID */}
        {!favoritesLoaded && isFavoritesPage ? (
          <p className="empty-state">
            Loading favorites...
          </p>
        ) : sortedProducts.length > 0 ? (
          <div className="product-grid">

            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>
        ) : (
          <div className="empty-state">

            {isFavoritesPage ? (
              <>
                <h2>No favorite products yet ❤️</h2>

                <p>
                  Browse the marketplace and tap the heart
                  on products you love.
                </p>
              </>
            ) : (
              <p>
                No products match your search or filter.
              </p>
            )}

          </div>
        )}

      </section>
    </main>
  );
}

// MAIN PAGE
export default function MarketplacePage() {
  return (
    <Suspense fallback={<p>Loading marketplace...</p>}>
      <MarketplaceContent />
    </Suspense>
  );
}