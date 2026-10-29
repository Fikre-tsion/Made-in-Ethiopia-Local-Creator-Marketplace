"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { hasSupabaseConfig } from "../lib/supabase/config";
import { placeholderImage, uploadImage, validateImage } from "../lib/supabase/images";
import "./creator-studio.css";

/* =========================================================================
   Settings you may need to change
   ========================================================================= */

// If your products table uses other column names, change them here.
const OWNER_COLUMN = "creator_id"; // column that stores the creator's user id
const FIELD = {
  name: "name",
  description: "description",
  category: "category",
  price: "price",
};

const LOW_STOCK_AT = 5; // this many or fewer in stock counts as "low"

// Match these to the options in your current category dropdown.
const CATEGORIES = [
  "Clothing and textiles",
  "Pottery and ceramics",
  "Jewelry and accessories",
  "Home decor",
  "Art and crafts",
  "Leather goods",
  "Food and spices",
];

const SAMPLE_PRODUCTS = [
  {
    name: "Handwoven cotton netela shawl",
    description: "Soft, light cotton shawl woven on a traditional loom with a hand-stitched tibeb border.",
    category: "Clothing and textiles",
    price: 1850,
    quantity: 14,
    status: "published",
  },
  {
    name: "Clay jebena coffee pot",
    description: "Hand-coiled and fired clay pot for the coffee ceremony. Comes with a woven grass stand.",
    category: "Pottery and ceramics",
    price: 950,
    quantity: 22,
    status: "published",
  },
  {
    name: "Silver cross pendant",
    description: "Hand-hammered silver pendant inspired by the crosses of Lalibela, on an adjustable cord.",
    category: "Jewelry and accessories",
    price: 2400,
    quantity: 4,
    status: "published",
  },
  {
    name: "Woven mesob basket",
    description: "Coiled grass basket traditionally used to serve injera, dyed with natural pigments.",
    category: "Home decor",
    price: 1300,
    quantity: 9,
    status: "published",
  },
  {
    name: "Leather messenger bag",
    description: "Vegetable-tanned leather bag with brass fittings, stitched by hand in Addis Ababa.",
    category: "Leather goods",
    price: 3200,
    quantity: 0,
    status: "published",
  },
  {
    name: "Painted cross wall art",
    description: "Hand-painted wooden cross panel finished with a protective natural varnish.",
    category: "Art and crafts",
    price: 1750,
    quantity: 7,
    status: "published",
  },
  {
    name: "Berbere spice blend, 250 g",
    description: "Slow-roasted chili and spice blend, ground and packed in small batches.",
    category: "Food and spices",
    price: 280,
    quantity: 40,
    status: "draft",
  },
  {
    name: "Embroidered habesha kemis",
    description: "Cotton dress with hand embroidery along the neckline, cuffs, and hem.",
    category: "Clothing and textiles",
    price: 4800,
    quantity: 3,
    status: "draft",
  },
];

/* =========================================================================
   Small helpers
   ========================================================================= */

const money = (value) =>
  `ETB ${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

function fromRow(row) {
  return {
    id: row.id,
    name: row[FIELD.name] ?? "",
    description: row[FIELD.description] ?? "",
    category: row[FIELD.category] ?? "",
    price: Number(row[FIELD.price] ?? 0),
    quantity: Number(row.quantity ?? 0),
    status: row.status === "published" ? "published" : "draft",
    image: row.image_url || "",
    createdAt: row.created_at || "",
  };
}

function toRow(form) {
  return {
    [FIELD.name]: String(form.name).trim(),
    [FIELD.description]: String(form.description).trim(),
    [FIELD.category]: form.category,
    [FIELD.price]: Number(form.price),
    quantity: Math.max(0, parseInt(form.quantity, 10) || 0),
    status: form.status === "published" ? "published" : "draft",
    image_url: form.image || null,
  };
}

function shopFrom(profile, user) {
  return {
    name: profile?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    contact: profile?.contact_email || "",
    image: profile?.image_url || "",
  };
}

function stockInfo(quantity) {
  if (quantity <= 0) return { label: "Out of stock", tone: "danger" };
  if (quantity <= LOW_STOCK_AT) return { label: `Only ${quantity} left`, tone: "warn" };
  return { label: `${quantity} in stock`, tone: "ok" };
}

// The greeting depends on the visitor's clock, so it is read on the client only.
const subscribeNever = () => () => {};
function currentGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

function wasSeeded(userId) {
  try {
    return window.localStorage.getItem(`mie-demo-seeded:${userId}`) === "1";
  } catch {
    return true;
  }
}

function markSeeded(userId) {
  try {
    window.localStorage.setItem(`mie-demo-seeded:${userId}`, "1");
  } catch {
    /* storage unavailable: nothing to remember */
  }
}

/* =========================================================================
   Icons and tiny presentational pieces
   ========================================================================= */

const ICONS = {
  home: (
    <>
      <path d="M3.5 11.5 12 4l8.5 7.5" />
      <path d="M5.5 10v9.5h13V10" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.6" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  store: (
    <>
      <path d="M4 9.5 5.5 4h13L20 9.5" />
      <path d="M4 9.5C4 11 5.1 12 6.5 12S9 11 9 9.5C9 11 10.1 12 11.5 12h1c1.4 0 2.5-1 2.5-2.5 0 1.5 1.1 2.5 2.5 2.5S20 11 20 9.5" />
      <path d="M5.5 12v8h13v-8" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.4M12 18.1v2.4M3.5 12h2.4M18.1 12h2.4M6 6l1.7 1.7M16.3 16.3 18 18M18 6l-1.7 1.7M7.7 16.3 6 18" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.6" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4 17 5-5 4 4 2.5-2.5L20 18" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10.5H4Z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </>
  ),
  trash: <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5" />,
  edit: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  external: (
    <>
      <path d="M9 5H5v14h14v-4" />
      <path d="M13 5h6v6M19 5l-8 8" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 3 19.5h18L12 4Z" />
      <path d="M12 10v4.5M12 17.2v.1" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M4 4l16 16" />
      <path d="M9.9 5.8A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.8M6.2 7.6A16 16 0 0 0 2.5 12S6 18.5 12 18.5c1.3 0 2.5-.3 3.6-.8" />
    </>
  ),
  box: (
    <>
      <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z" />
      <path d="M4 8l8 4.5L20 8M12 12.5v8" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
};

function Icon({ name, size = 18 }) {
  return (
    <svg
      className="cs-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

// One place for <img>: shop and product photos come from Supabase Storage
// or from the browser, so next/image is not needed here.
function Pic({ src, alt = "", className }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />;
}

function ProductPic({ product, className }) {
  const src = product.image || placeholderImage(product.name || "product");
  return <Pic src={src} alt={product.image ? product.name : ""} className={className} />;
}

function Avatar({ shop, size = 36, className = "" }) {
  const initial = (shop.name || "?").trim().charAt(0).toUpperCase();
  return (
    <span className={`cs-avatar ${className}`} style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {shop.image ? <Pic src={shop.image} alt="" className="cs-avatar-img" /> : initial}
    </span>
  );
}

function StatusPill({ status }) {
  return (
    <span className={`cs-pill cs-pill-${status}`}>{status === "published" ? "Published" : "Draft"}</span>
  );
}

function PageHeader({ title, subtitle, children }) {
  return (
    <div className="cs-page-head">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children ? <div className="cs-page-actions">{children}</div> : null}
    </div>
  );
}

/* =========================================================================
   Image upload field (used for product photos and the store photo)
   ========================================================================= */

function ImageField({ value, onChange, onBusyChange, getDb, userId, folder, shape = "wide", shop }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  async function handleFiles(fileList) {
    const file = fileList?.[0];
    if (!file) return;

    const problem = validateImage(file);
    if (problem) {
      setError(problem);
      return;
    }

    setError("");
    setBusy(true);
    onBusyChange?.(true);
    try {
      const url = await uploadImage(getDb(), file, { userId, folder });
      onChange(url);
    } catch (uploadError) {
      setError(uploadError.message || "The upload failed. Try again.");
    } finally {
      setBusy(false);
      onBusyChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      className="cs-file-input"
      onChange={(event) => handleFiles(event.target.files)}
      tabIndex={-1}
    />
  );

  if (shape === "round") {
    return (
      <div className="cs-avatar-field">
        <div className="cs-avatar-big">
          {value ? (
            <Pic src={value} alt="Store photo" className="cs-avatar-img" />
          ) : (
            <span>{(shop?.name || "?").trim().charAt(0).toUpperCase()}</span>
          )}
          {busy ? (
            <div className="cs-drop-busy">
              <span className="cs-spinner" />
            </div>
          ) : null}
        </div>
        <div className="cs-avatar-controls">
          <div className="cs-row">
            <button type="button" className="cs-btn cs-btn-light" onClick={() => inputRef.current?.click()} disabled={busy}>
              <Icon name="camera" size={16} />
              {value ? "Change photo" : "Upload photo"}
            </button>
            {value ? (
              <button type="button" className="cs-btn cs-btn-ghost" onClick={() => onChange("")} disabled={busy}>
                Remove
              </button>
            ) : null}
          </div>
          <p className="cs-hint">Shown on your shop page. A square photo works best. JPG, PNG, or WebP up to 5 MB.</p>
          {error ? (
            <p className="cs-field-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        {fileInput}
      </div>
    );
  }

  return (
    <div>
      <div
        className={`cs-drop${dragging ? " is-drag" : ""}${value ? " has-image" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
      >
        {value ? (
          <Pic src={value} alt="Product preview" className="cs-drop-img" />
        ) : (
          <div className="cs-drop-empty">
            <span className="cs-drop-icon">
              <Icon name="upload" size={22} />
            </span>
            <strong>Drag a photo here</strong>
            <span>or choose one from your device. JPG, PNG, or WebP up to 5 MB.</span>
          </div>
        )}

        {busy ? (
          <div className="cs-drop-busy">
            <span className="cs-spinner" />
            Uploading
          </div>
        ) : null}

        <div className="cs-drop-actions">
          <button type="button" className="cs-btn cs-btn-light" onClick={() => inputRef.current?.click()} disabled={busy}>
            <Icon name="image" size={16} />
            {value ? "Replace photo" : "Choose photo"}
          </button>
          {value ? (
            <button type="button" className="cs-btn cs-btn-light" onClick={() => onChange("")} disabled={busy}>
              Remove
            </button>
          ) : null}
        </div>
      </div>
      {error ? (
        <p className="cs-field-error" role="alert">
          {error}
        </p>
      ) : null}
      {fileInput}
    </div>
  );
}

/* =========================================================================
   Overview
   ========================================================================= */

function StatStrip({ stats, loading }) {
  const cells = [
    { icon: "box", tone: "green", label: "Total products", value: stats.total, note: "Across your catalog" },
    {
      icon: "eye",
      tone: "gold",
      label: "Published listings",
      value: stats.published,
      note: stats.total ? `${Math.round((stats.published / stats.total) * 100)}% of your catalog` : "Nothing live yet",
    },
    { icon: "edit", tone: "sky", label: "Drafts", value: stats.drafts, note: stats.drafts ? "Ready for review" : "No drafts waiting" },
    {
      icon: "alert",
      tone: "clay",
      label: "Needs attention",
      value: stats.attention,
      note: stats.attention ? "Low or out of stock" : "Inventory looks healthy",
    },
  ];

  return (
    <section className="cs-stats" aria-label="Catalog summary">
      {cells.map((cell) => (
        <div className="cs-stat" key={cell.label}>
          <div className="cs-stat-top">
            <span className="cs-stat-label">{cell.label}</span>
            <span className={`cs-chip cs-chip-${cell.tone}`}>
              <Icon name={cell.icon} size={15} />
            </span>
          </div>
          {loading ? <span className="cs-skeleton cs-skeleton-num" /> : <span className="cs-stat-value">{cell.value}</span>}
          <span className="cs-stat-note">{cell.note}</span>
        </div>
      ))}
    </section>
  );
}

function Overview({ greeting, firstName, shop, products, stats, loading, go, onEdit }) {
  const recent = products.slice(0, 5);
  const pct = stats.total ? Math.round((stats.published / stats.total) * 100) : 0;

  const steps = [
    { done: Boolean(shop.image), label: "Add a store photo", view: "profile" },
    { done: Boolean(shop.bio), label: "Write your story", view: "profile" },
    { done: products.length > 0, label: "Add your first product", view: "form" },
    { done: products.length > 0 && products.every((p) => p.image), label: "Give every product a photo", view: "products" },
  ];
  const doneCount = steps.filter((step) => step.done).length;

  return (
    <>
      <section
        className={`cs-hero${shop.image ? " has-cover" : ""}`}
        style={shop.image ? { "--cs-cover-image": `url("${shop.image}")` } : undefined}
      >
        {shop.image ? <span className="cs-hero-cover" aria-hidden="true" /> : null}
        <span className="cs-weave" aria-hidden="true" />
        <div className="cs-hero-copy">
          <Avatar shop={shop} size={64} className="cs-hero-avatar" />
          <h1>
            {greeting}, {firstName}.
          </h1>
          <p>Here is what is happening in your studio today.</p>
        </div>
        <div className="cs-row">
          <button type="button" className="cs-btn cs-btn-light" onClick={() => go("profile")}>
            Edit store profile
          </button>
          <button type="button" className="cs-btn cs-btn-primary" onClick={() => go("form")}>
            <Icon name="plus" size={16} />
            Add product
          </button>
        </div>
      </section>

      <StatStrip stats={stats} loading={loading} />

      <div className="cs-grid-2">
        <section className="cs-panel">
          <div className="cs-panel-head">
            <h2>Recent products</h2>
            <button type="button" className="cs-link" onClick={() => go("products")}>
              See all products
            </button>
          </div>

          {loading ? (
            <div className="cs-list">
              {[0, 1, 2].map((i) => (
                <div className="cs-row-item" key={i}>
                  <span className="cs-skeleton cs-skeleton-thumb" />
                  <span className="cs-skeleton cs-skeleton-line" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="cs-empty-small">
              <p>No products yet. Add one and it will appear here.</p>
              <button type="button" className="cs-btn cs-btn-primary" onClick={() => go("form")}>
                Add your first product
              </button>
            </div>
          ) : (
            <ul className="cs-list">
              {recent.map((product) => {
                const stock = stockInfo(product.quantity);
                return (
                  <li key={product.id}>
                    <button type="button" className="cs-row-item" onClick={() => onEdit(product.id)}>
                      <ProductPic product={product} className="cs-thumb" />
                      <span className="cs-row-main">
                        <strong>{product.name}</strong>
                        <span className="cs-muted">{product.category}</span>
                      </span>
                      <StatusPill status={product.status} />
                      <span className="cs-row-price">{money(product.price)}</span>
                      <span className={`cs-stock cs-stock-${stock.tone}`}>{stock.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="cs-stack">
          <section className="cs-panel">
            <div className="cs-panel-head">
              <h2>Inventory health</h2>
              <button type="button" className="cs-link" onClick={() => go("products")}>
                View inventory
              </button>
            </div>
            <div className="cs-health">
              <div className="cs-donut" style={{ "--pct": pct }} role="img" aria-label={`${pct}% of products published`}>
                <div className="cs-donut-inner">
                  <strong>{pct}%</strong>
                  <span>published</span>
                </div>
              </div>
              <div className="cs-bars">
                {[
                  { label: "Published", value: stats.published, tone: "green" },
                  { label: "Drafts", value: stats.drafts, tone: "gold" },
                  { label: "Low stock", value: stats.attention, tone: "clay" },
                ].map((bar) => (
                  <div className="cs-bar-row" key={bar.label}>
                    <div className="cs-bar-label">
                      <span>{bar.label}</span>
                      <strong>{bar.value}</strong>
                    </div>
                    <div className="cs-bar">
                      <i className={`cs-tone-${bar.tone}`} style={{ width: `${stats.total ? (bar.value / stats.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="cs-panel-foot">
              Published stock on hand is worth <strong>{money(stats.stockValue)}</strong>.
            </p>
          </section>

          <section className="cs-panel">
            <div className="cs-panel-head">
              <h2>Finish your storefront</h2>
              <span className="cs-muted">
                {doneCount} of {steps.length} done
              </span>
            </div>
            <div className="cs-progress">
              <i style={{ width: `${(doneCount / steps.length) * 100}%` }} />
            </div>
            <ol className="cs-steps">
              {steps.map((step, index) => (
                <li key={step.label}>
                  <button type="button" className={`cs-step${step.done ? " is-done" : ""}`} onClick={() => go(step.view)}>
                    <span className="cs-step-mark">{step.done ? <Icon name="check" size={14} /> : index + 1}</span>
                    <span>{step.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}

/* =========================================================================
   Products list
   ========================================================================= */

function ProductsView({ products, loading, go, onEdit, onToggle, onDelete, onAddSamples, addingSamples }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const counts = useMemo(
    () => ({
      all: products.length,
      published: products.filter((p) => p.status === "published").length,
      draft: products.filter((p) => p.status === "draft").length,
      low: products.filter((p) => p.status === "published" && p.quantity <= LOW_STOCK_AT).length,
    }),
    [products]
  );

  const visible = products.filter((product) => {
    if (filter === "published" && product.status !== "published") return false;
    if (filter === "draft" && product.status !== "draft") return false;
    if (filter === "low" && !(product.status === "published" && product.quantity <= LOW_STOCK_AT)) return false;
    const text = query.trim().toLowerCase();
    return !text || `${product.name} ${product.category}`.toLowerCase().includes(text);
  });

  const filters = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Drafts" },
    { key: "low", label: "Low stock" },
  ];

  return (
    <>
      <PageHeader title="Products" subtitle="Everything you sell, in one place.">
        <button type="button" className="cs-btn cs-btn-primary" onClick={() => go("form")}>
          <Icon name="plus" size={16} />
          Add product
        </button>
      </PageHeader>

      {!loading && products.length === 0 ? (
        <section className="cs-panel cs-empty">
          <Pic src={placeholderImage("empty shelf")} alt="" className="cs-empty-art" />
          <h2>Your shelf is empty</h2>
          <p>Add a product with a photo, or fill the shelf with sample products to see how your store will look.</p>
          <div className="cs-row cs-center">
            <button type="button" className="cs-btn cs-btn-primary" onClick={() => go("form")}>
              Add your first product
            </button>
            <button type="button" className="cs-btn cs-btn-light" onClick={onAddSamples} disabled={addingSamples}>
              {addingSamples ? "Adding samples" : "Add sample products"}
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="cs-toolbar">
            <label className="cs-search">
              <Icon name="search" size={17} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or category"
                aria-label="Search products"
              />
            </label>
            <div className="cs-filters" role="group" aria-label="Filter products">
              {filters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`cs-filter${filter === item.key ? " is-active" : ""}`}
                  aria-pressed={filter === item.key}
                  onClick={() => setFilter(item.key)}
                >
                  {item.label}
                  <span>{counts[item.key]}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="cs-products">
              {[0, 1, 2, 3].map((i) => (
                <div className="cs-pcard" key={i}>
                  <span className="cs-skeleton cs-skeleton-media" />
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <section className="cs-panel cs-empty">
              <h2>No matches</h2>
              <p>Try a different search or filter.</p>
              <button
                type="button"
                className="cs-btn cs-btn-light"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Clear filters
              </button>
            </section>
          ) : (
            <div className="cs-products">
              {visible.map((product) => {
                const stock = stockInfo(product.quantity);
                return (
                  <article className="cs-pcard" key={product.id}>
                    <div className="cs-pcard-media">
                      <ProductPic product={product} />
                      <StatusPill status={product.status} />
                      <button
                        type="button"
                        className="cs-pcard-delete"
                        onClick={() => onDelete(product)}
                        aria-label={`Delete ${product.name}`}
                        title="Delete product"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                    <div className="cs-pcard-body">
                      <span className="cs-muted">{product.category}</span>
                      <h3>{product.name}</h3>
                      <div className="cs-pcard-meta">
                        <strong>{money(product.price)}</strong>
                        <span className={`cs-stock cs-stock-${stock.tone}`}>{stock.label}</span>
                      </div>
                    </div>
                    <div className="cs-pcard-actions">
                      <button type="button" className="cs-btn cs-btn-light cs-btn-sm" onClick={() => onEdit(product.id)}>
                        <Icon name="edit" size={15} />
                        Edit
                      </button>
                      <button type="button" className="cs-btn cs-btn-light cs-btn-sm" onClick={() => onToggle(product)}>
                        <Icon name={product.status === "published" ? "eyeOff" : "eye"} size={15} />
                        {product.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}

/* =========================================================================
   Add / edit product
   ========================================================================= */

function ProductForm({ initial, isEditing, onSubmit, onCancel, getDb, userId }) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          description: initial.description,
          category: initial.category || CATEGORIES[0],
          price: String(initial.price),
          quantity: String(initial.quantity),
          status: initial.status,
          image: initial.image,
        }
      : { name: "", description: "", category: CATEGORIES[0], price: "", quantity: "", status: "draft", image: "" }
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const categories = CATEGORIES.includes(form.category) || !form.category ? CATEGORIES : [form.category, ...CATEGORIES];
  const quantityNumber = form.quantity === "" ? null : parseInt(form.quantity, 10);
  const stock = quantityNumber === null || Number.isNaN(quantityNumber) ? null : stockInfo(quantityNumber);

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Give your product a name.";
    if (form.price === "" || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      next.price = "Enter a price of 0 or more.";
    }
    if (form.quantity === "" || !/^\d+$/.test(String(form.quantity))) {
      next.quantity = "Enter a whole number, 0 or more.";
    }
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setSubmitError("");
    try {
      await onSubmit(form);
    } catch (error) {
      setSubmitError(error.message || "This product could not be saved. Try again.");
      setSaving(false);
    }
  }

  const submitLabel = isEditing ? "Save changes" : form.status === "published" ? "Publish product" : "Save draft";

  return (
    <>
      <PageHeader
        title={isEditing ? "Edit product" : "Add a product"}
        subtitle={isEditing ? "Update the details customers see." : "Give customers a clear, compelling reason to choose your work."}
      >
        <button type="button" className="cs-btn cs-btn-light" onClick={onCancel}>
          Cancel
        </button>
      </PageHeader>

      <form className="cs-form-grid" onSubmit={handleSubmit} noValidate>
        <section className="cs-panel">
          <div className="cs-panel-head cs-panel-head-col">
            <h2>Product details</h2>
            <p className="cs-muted">Tell the story behind this piece.</p>
          </div>

          <div className={`cs-field${errors.name ? " has-error" : ""}`}>
            <label htmlFor="cs-name">Product name</label>
            <input id="cs-name" className="cs-input" value={form.name} onChange={set("name")} placeholder="e.g. Handwoven cotton scarf" maxLength={120} />
            {errors.name ? <p className="cs-field-error">{errors.name}</p> : null}
          </div>

          <div className="cs-field">
            <label htmlFor="cs-description">Description</label>
            <textarea
              id="cs-description"
              className="cs-input cs-textarea"
              value={form.description}
              onChange={set("description")}
              placeholder="What makes this product special?"
              rows={5}
              maxLength={800}
            />
            <p className="cs-hint cs-right">{form.description.length} / 800</p>
          </div>

          <div className="cs-field">
            <label htmlFor="cs-category">Category</label>
            <select id="cs-category" className="cs-input" value={form.category} onChange={set("category")}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="cs-field">
            <span className="cs-label">Product photo</span>
            <ImageField
              value={form.image}
              onChange={(url) => setForm((current) => ({ ...current, image: url }))}
              onBusyChange={setImageBusy}
              getDb={getDb}
              userId={userId}
              folder="products"
            />
          </div>
        </section>

        <div className="cs-stack">
          <section className="cs-panel">
            <div className="cs-panel-head cs-panel-head-col">
              <h2>Listing settings</h2>
              <p className="cs-muted">Set the details customers will see.</p>
            </div>

            <div className={`cs-field${errors.price ? " has-error" : ""}`}>
              <label htmlFor="cs-price">Price (ETB)</label>
              <input id="cs-price" className="cs-input" type="number" inputMode="decimal" min="0" step="0.01" value={form.price} onChange={set("price")} placeholder="0.00" />
              {errors.price ? <p className="cs-field-error">{errors.price}</p> : null}
            </div>

            <div className={`cs-field${errors.quantity ? " has-error" : ""}`}>
              <label htmlFor="cs-quantity">Available quantity</label>
              <input id="cs-quantity" className="cs-input" type="number" inputMode="numeric" min="0" step="1" value={form.quantity} onChange={set("quantity")} placeholder="0" />
              {errors.quantity ? <p className="cs-field-error">{errors.quantity}</p> : null}
            </div>

            <div className="cs-inventory-box">
              <span className="cs-muted">Inventory status</span>
              {stock ? <strong className={`cs-stock cs-stock-${stock.tone}`}>{stock.label}</strong> : <strong>Enter quantity</strong>}
            </div>

            <div className="cs-field">
              <span className="cs-label" id="cs-status-label">
                Publication status
              </span>
              <div className="cs-seg" role="radiogroup" aria-labelledby="cs-status-label">
                {[
                  { key: "draft", title: "Draft", text: "Only you can see it" },
                  { key: "published", title: "Published", text: "Live in the marketplace" },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={form.status === option.key}
                    className={`cs-seg-item${form.status === option.key ? " is-active" : ""}`}
                    onClick={() => setForm((current) => ({ ...current, status: option.key }))}
                  >
                    <strong>{option.title}</strong>
                    <span>{option.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {submitError ? (
              <p className="cs-form-error" role="alert">
                {submitError}
              </p>
            ) : null}

            <button type="submit" className="cs-btn cs-btn-primary cs-btn-block" disabled={saving || imageBusy}>
              {saving ? "Saving" : imageBusy ? "Uploading photo" : submitLabel}
            </button>
          </section>

          <section className="cs-panel cs-preview">
            <p className="cs-muted">How customers will see it</p>
            <div className="cs-pcard cs-pcard-static">
              <div className="cs-pcard-media">
                <ProductPic product={{ name: form.name || "New product", image: form.image }} />
              </div>
              <div className="cs-pcard-body">
                <span className="cs-muted">{form.category}</span>
                <h3>{form.name.trim() || "Your product name"}</h3>
                <div className="cs-pcard-meta">
                  <strong>{money(form.price)}</strong>
                </div>
              </div>
            </div>
          </section>
        </div>
      </form>
    </>
  );
}

/* =========================================================================
   Store profile
   ========================================================================= */

function ProfileView({ shop, productCount, onSave, getDb, userId }) {
  const [form, setForm] = useState(shop);
  const [saving, setSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Enter a public store name.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave(form);
    } catch (saveError) {
      setError(saveError.message || "The profile could not be saved. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Tell your story" subtitle="Shape the public profile customers see when they discover your work." />

      <div className="cs-form-grid cs-form-grid-profile">
        <form className="cs-panel" onSubmit={handleSubmit} noValidate>
          <div className="cs-field">
            <span className="cs-label">Store photo</span>
            <ImageField
              shape="round"
              shop={form}
              value={form.image}
              onChange={(url) => setForm((current) => ({ ...current, image: url }))}
              onBusyChange={setImageBusy}
              getDb={getDb}
              userId={userId}
              folder="profile"
            />
          </div>

          <div className="cs-field">
            <label htmlFor="cs-shop-name">Public store name</label>
            <input id="cs-shop-name" className="cs-input" value={form.name} onChange={set("name")} maxLength={80} />
          </div>

          <div className="cs-field">
            <label htmlFor="cs-shop-bio">Biography</label>
            <textarea id="cs-shop-bio" className="cs-input cs-textarea" rows={5} value={form.bio} onChange={set("bio")} placeholder="Share your story and what you make." maxLength={400} />
            <p className="cs-hint cs-right">{form.bio.length} / 400</p>
          </div>

          <div className="cs-two">
            <div className="cs-field">
              <label htmlFor="cs-shop-location">Location</label>
              <input id="cs-shop-location" className="cs-input" value={form.location} onChange={set("location")} placeholder="Addis Ababa, Ethiopia" maxLength={80} />
            </div>
            <div className="cs-field">
              <label htmlFor="cs-shop-contact">Public contact method</label>
              <input id="cs-shop-contact" className="cs-input" value={form.contact} onChange={set("contact")} placeholder="hello@example.com" maxLength={120} />
            </div>
          </div>

          {error ? (
            <p className="cs-form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="cs-btn cs-btn-primary cs-btn-block" disabled={saving || imageBusy}>
            {saving ? "Saving" : imageBusy ? "Uploading photo" : "Save profile"}
          </button>
        </form>

        <aside className="cs-panel cs-shopcard">
          <p className="cs-muted">How your shop appears</p>
          <div className="cs-shopcard-body">
            <span className="cs-weave" aria-hidden="true" />
            <Avatar shop={form} size={84} className="cs-avatar-ring" />
            <h3>{form.name.trim() || "Your store name"}</h3>
            {form.location ? <span className="cs-muted">{form.location}</span> : null}
            <p>{form.bio.trim() || "Your story will appear here. Tell customers who you are and what you make."}</p>
            <span className="cs-chip-text">
              {productCount} {productCount === 1 ? "product" : "products"}
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}

/* =========================================================================
   Settings
   ========================================================================= */

function SettingsView({ user }) {
  return (
    <>
      <PageHeader title="Settings" subtitle="Your account details." />
      <section className="cs-panel cs-settings">
        <dl>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Account type</dt>
            <dd>Creator</dd>
          </div>
        </dl>
        <p className="cs-muted">Password and sign-in settings are managed through Supabase Auth.</p>
        {!hasSupabaseConfig() ? (
          <p className="cs-notice">
            Demo mode is on. Your products and photos are saved in this browser only. Add your Supabase keys to store them online.
          </p>
        ) : null}
      </section>
    </>
  );
}

/* =========================================================================
   The dashboard
   ========================================================================= */

export default function DashboardClient({ user, profile }) {
  const clientRef = useRef(null);
  const getDb = useCallback(() => {
    if (!clientRef.current) clientRef.current = createClient();
    return clientRef.current;
  }, []);

  const [view, setView] = useState("overview");
  const [editingId, setEditingId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(() => shopFrom(profile, user));
  const greeting = useSyncExternalStore(subscribeNever, currentGreeting, () => "Welcome back");
  const [toast, setToast] = useState(null);
  const [addingSamples, setAddingSamples] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const notify = useCallback((message, tone = "ok") => setToast({ message, tone, id: Date.now() }), []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view, editingId]);

  async function insertSamples(userId) {
    const db = getDb();
    const created = [];
    for (let i = 0; i < SAMPLE_PRODUCTS.length; i += 1) {
      const sample = SAMPLE_PRODUCTS[i];
      const { data, error } = await db
        .from("products")
        .insert({
          ...toRow({ ...sample, price: String(sample.price), quantity: String(sample.quantity), image: "" }),
          [OWNER_COLUMN]: userId,
          created_at: new Date(Date.now() - i * 5 * 3600 * 1000).toISOString(),
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      created.push(fromRow(data));
    }
    return created;
  }

  useEffect(() => {
    let active = true;

    async function load() {
      const db = getDb();
      const [productResult, profileResult] = await Promise.all([
        db.from("products").select("*").eq(OWNER_COLUMN, user.id).order("created_at", { ascending: false }),
        db.from("profiles").select("*").eq("id", user.id).single(),
      ]);
      if (!active) return;

      if (profileResult.data) setShop(shopFrom(profileResult.data, user));

      let rows = (productResult.data || []).map(fromRow);
      if (productResult.error) {
        notify("Your products could not be loaded. Refresh to try again.", "error");
      } else if (rows.length === 0 && !hasSupabaseConfig() && !wasSeeded(user.id)) {
        // Demo mode only: fill the first visit with sample products.
        markSeeded(user.id);
        try {
          rows = await insertSamples(user.id);
        } catch {
          rows = [];
        }
      }

      if (!active) return;
      setProducts(rows);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const stats = useMemo(() => {
    const live = products.filter((p) => p.status === "published");
    return {
      total: products.length,
      published: live.length,
      drafts: products.length - live.length,
      attention: live.filter((p) => p.quantity <= LOW_STOCK_AT).length,
      stockValue: live.reduce((sum, p) => sum + p.price * p.quantity, 0),
    };
  }, [products]);

  function go(next) {
    setEditingId(null);
    setView(next);
  }

  function startEdit(id) {
    setEditingId(id);
    setView("form");
  }

  async function saveProduct(form) {
    const db = getDb();
    const values = toRow(form);

    if (editingId) {
      const { data, error } = await db
        .from("products")
        .update(values)
        .eq("id", editingId)
        .eq(OWNER_COLUMN, user.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      setProducts((list) => list.map((p) => (p.id === editingId ? fromRow(data) : p)));
      notify("Changes saved.");
    } else {
      const { data, error } = await db
        .from("products")
        .insert({ ...values, [OWNER_COLUMN]: user.id })
        .select()
        .single();
      if (error) throw new Error(error.message);
      setProducts((list) => [fromRow(data), ...list]);
      notify(values.status === "published" ? "Product published." : "Draft saved.");
    }

    setEditingId(null);
    setView("products");
  }

  async function toggleStatus(product) {
    const next = product.status === "published" ? "draft" : "published";
    const { data, error } = await getDb()
      .from("products")
      .update({ status: next })
      .eq("id", product.id)
      .eq(OWNER_COLUMN, user.id)
      .select()
      .single();
    if (error) {
      notify(error.message || "The status could not be changed.", "error");
      return;
    }
    setProducts((list) => list.map((p) => (p.id === product.id ? fromRow(data) : p)));
    notify(next === "published" ? "Product published." : "Product moved to drafts.");
  }

  async function deleteProduct(product) {
    const { error } = await getDb().from("products").delete().eq("id", product.id).eq(OWNER_COLUMN, user.id);
    if (error) {
      notify(error.message || "The product could not be deleted.", "error");
      return;
    }
    setProducts((list) => list.filter((p) => p.id !== product.id));
    setDeleteTarget(null);
    notify("Product deleted.");
  }

  async function addSamples() {
    setAddingSamples(true);
    try {
      const created = await insertSamples(user.id);
      setProducts((list) => [...created, ...list]);
      notify("Sample products added.");
    } catch (error) {
      notify(error.message || "The sample products could not be added.", "error");
    } finally {
      setAddingSamples(false);
    }
  }

  async function saveShop(values) {
    const clean = {
      name: values.name.trim(),
      bio: values.bio.trim(),
      location: values.location.trim(),
      contact: values.contact.trim(),
      image: values.image || "",
    };
    const { error } = await getDb()
      .from("profiles")
      .update({
        display_name: clean.name,
        bio: clean.bio || null,
        location: clean.location || null,
        contact_email: clean.contact || null,
        image_url: clean.image || null,
      })
      .eq("id", user.id);
    if (error) throw new Error(error.message);
    setShop(clean);
    notify("Store profile saved.");
  }

  const firstName = (user.user_metadata?.full_name || shop.name || "").trim().split(" ")[0] || "there";
  const editing = editingId ? products.find((p) => p.id === editingId) : null;
  const activeNav = view === "form" ? (editingId ? "products" : "form") : view;

  const nav = [
    { key: "overview", label: "Overview", icon: "home" },
    { key: "products", label: "Products", icon: "grid", count: products.length },
    { key: "form", label: "Add product", icon: "plus" },
    { key: "profile", label: "Store profile", icon: "store" },
    { key: "settings", label: "Settings", icon: "gear" },
  ];

  return (
    <div className="cs-root">
      <aside className="cs-side">
        <div className="cs-identity">
          <Avatar shop={shop} size={44} />
          <div>
            <strong>{shop.name || "Your store"}</strong>
            <span>Creator studio</span>
          </div>
        </div>

        <nav className="cs-nav" aria-label="Creator studio">
          {nav.map((item) => (
            <button
              key={item.key}
              type="button"
              className="cs-nav-item"
              aria-current={activeNav === item.key ? "page" : undefined}
              onClick={() => go(item.key)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.count ? <em>{item.count}</em> : null}
            </button>
          ))}
        </nav>

        <Link href="/marketplace" className="cs-side-link">
          View public marketplace
          <Icon name="external" size={14} />
        </Link>
      </aside>

      <div className="cs-main">
        <header className="cs-top">
          <span className="cs-online">
            <i />
            Store online
          </span>
          <Link href="/shops" className="cs-link">
            View storefront
          </Link>
          <Avatar shop={shop} size={38} />
        </header>

        <main className="cs-content">
          {view === "overview" ? (
            <Overview
              greeting={greeting}
              firstName={firstName}
              shop={shop}
              products={products}
              stats={stats}
              loading={loading}
              go={go}
              onEdit={startEdit}
            />
          ) : null}

          {view === "products" ? (
            <ProductsView
              products={products}
              loading={loading}
              go={go}
              onEdit={startEdit}
              onToggle={toggleStatus}
              onDelete={setDeleteTarget}
              onAddSamples={addSamples}
              addingSamples={addingSamples}
            />
          ) : null}

          {view === "form" ? (
            <ProductForm
              key={editingId || "new"}
              initial={editing}
              isEditing={Boolean(editing)}
              onSubmit={saveProduct}
              onCancel={() => go(editing ? "products" : "overview")}
              getDb={getDb}
              userId={user.id}
            />
          ) : null}

          {view === "profile" ? (
            <ProfileView key={shop.image + shop.name} shop={shop} productCount={products.length} onSave={saveShop} getDb={getDb} userId={user.id} />
          ) : null}

          {view === "settings" ? <SettingsView user={user} /> : null}
        </main>
      </div>

      {toast ? (
        <div className={`cs-toast cs-toast-${toast.tone}`} role="status" aria-live="polite" key={toast.id}>
          <Icon name={toast.tone === "error" ? "alert" : "check"} size={16} />
          {toast.message}
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="cs-dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDeleteTarget(null);
        }}>
          <section className="cs-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title">
            <div className="cs-dialog-icon"><Icon name="trash" size={18} /></div>
            <h2 id="delete-product-title">Delete this product?</h2>
            <p>
              “{deleteTarget.name}” will be permanently removed from your product list.
            </p>
            <div className="cs-dialog-actions">
              <button type="button" className="cs-btn cs-btn-light" onClick={() => setDeleteTarget(null)}>
                Keep product
              </button>
              <button type="button" className="cs-btn cs-btn-danger" onClick={() => deleteProduct(deleteTarget)}>
                Delete product
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}