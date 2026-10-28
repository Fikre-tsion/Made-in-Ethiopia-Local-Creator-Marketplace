"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabase/client";

const LOW_STOCK_THRESHOLD = 5;
const categories = ["Clothing and textiles", "Footwear", "Leather goods", "Handmade crafts", "Artwork", "Home goods"];

function inventoryState(quantity) {
  if (quantity === 0) return "Out of stock";
  if (quantity <= LOW_STOCK_THRESHOLD) return "Low stock";
  return "In stock";
}

export default function DashboardClient({ user, profile }) {
  const [section, setSection] = useState("overview");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [form, setForm] = useState({ name: "", description: "", category: categories[0], price: "", quantity: "", publication: "draft" });
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    let active = true;
    createClient().from("products").select("id,name,description,category,price,quantity,image_url,status,updated_at").order("updated_at", { ascending: false }).then(({ data, error }) => {
      if (!active) return;
      if (error) setDataError("Products could not be loaded. Apply the dashboard migration and check Supabase RLS policies.");
      setProducts(data || []);
      setLoadingProducts(false);
    });
    return () => { active = false; };
  }, []);

  const filteredProducts = useMemo(() => products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()) && (status === "all" || product.status === status)), [products, query, status]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setFormError("");
  }

  function submitProduct(event) {
    event.preventDefault();
    const price = Number(form.price);
    const quantity = Number(form.quantity);
    if (!form.name.trim() || !form.description.trim()) return setFormError("Product name and description are required.");
    if (!Number.isFinite(price) || price < 0) return setFormError("Enter a valid non-negative ETB price.");
    if (!Number.isInteger(quantity) || quantity < 0) return setFormError("Available quantity must be a whole number of zero or more.");
    createClient().from("products").insert({ creator_id: user.id, name: form.name.trim(), description: form.description.trim(), category: form.category, price, quantity, status: form.publication }).select().single().then(({ data, error }) => {
      if (error) return setFormError(error.message);
      setProducts((current) => [data, ...current]);
      setForm({ name: "", description: "", category: categories[0], price: "", quantity: "", publication: "draft" });
      setNotice("Product saved as a draft.");
      setSection("products");
    });
  }

  return (
    <main className="dashboard-shell creator-dashboard">
      <aside className="dashboard-sidebar">
        <div className="creator-brand"><span className="brand-mark">M</span><span>Made in Ethiopia</span></div>
        <p className="eyebrow">CREATOR SPACE</p>
        <h1>Studio</h1>
        <p className="dashboard-account">{profile.display_name || user.email}</p>
        <nav aria-label="Creator navigation">
          {[["overview", "Overview"], ["products", "My products"], ["new", "Add product"], ["profile", "Store profile"], ["settings", "Settings"]].map(([value, label]) => (
            <button type="button" className={section === value ? "is-active" : ""} onClick={() => setSection(value)} key={value}>{label}</button>
          ))}
          <a href="/marketplace">View public marketplace</a>
        </nav>
        <div className="dashboard-sidebar-footer"><span className="status-dot" /> Connected account<small>{user.email}</small></div>
      </aside>

      <section className="dashboard-main">
        {section === "overview" && <Overview onAdd={() => setSection("new")} onProfile={() => setSection("profile")} user={user} products={products} />}
        {section === "products" && <Products query={query} setQuery={setQuery} status={status} setStatus={setStatus} products={filteredProducts} loading={loadingProducts} error={dataError} onAdd={() => setSection("new")} />}
        {section === "new" && <ProductEditor form={form} updateField={updateField} submitProduct={submitProduct} formError={formError} onCancel={() => setSection("overview")} />}
        {section === "profile" && <ProfileEditor user={user} setNotice={setNotice} />}
        {section === "settings" && <Unavailable title="Account settings" text="Account settings will be available through Supabase Auth configuration." />}
        {notice && <p className="dashboard-toast" role="status">{notice}</p>}
      </section>
    </main>
  );
}

function Overview({ onAdd, onProfile, user, products }) {
  const metrics = [products.length, products.filter((product) => product.status === "published").length, products.filter((product) => product.status === "draft").length, products.filter((product) => product.quantity > 0 && product.quantity <= LOW_STOCK_THRESHOLD).length, products.filter((product) => product.quantity === 0).length];
  return <><div className="dashboard-heading"><div><p className="eyebrow">OVERVIEW</p><h2>Your store</h2><p className="dashboard-intro">Welcome back, {user.user_metadata?.full_name || "creator"}. Manage your catalog and public presence from one place.</p></div><button className="primary-button" type="button" onClick={onAdd}>Add product</button></div><div className="dashboard-stats dashboard-metrics">{["Total products", "Published", "Drafts", "Low stock", "Out of stock"].map((item, index) => <div key={item}><span>{item}</span><strong>{metrics[index]}</strong><small>From your product records</small></div>)}</div><section className="dashboard-empty"><span className="empty-mark">+</span><p className="eyebrow">FIRST STEPS</p><h3>{products.length ? "Keep building your catalog" : "Build your storefront"}</h3><p>Complete your store profile, then add a product with a photo, ETB price, and available quantity. Nothing is published until you choose to publish it.</p><div className="dashboard-empty-actions"><button className="secondary-button" type="button" onClick={onProfile}>Complete store profile</button><button className="outline-button" type="button" onClick={onAdd}>Add your first product</button></div></section></>;
}

function Products({ query, setQuery, status, setStatus, onAdd, products, loading, error }) {
  return <><div className="dashboard-heading"><div><p className="eyebrow">CATALOG</p><h2>My products</h2><p className="dashboard-intro">Only listings owned by your authenticated account will appear here.</p></div><button className="primary-button" type="button" onClick={onAdd}>Add product</button></div><div className="dashboard-filters"><input type="search" placeholder="Search products" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search products" /><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by publication status"><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select></div>{error && <p className="form-message form-error">{error}</p>}{loading ? <p className="empty-state">Loading your products...</p> : products.length === 0 && <section className="dashboard-empty compact-empty"><span className="empty-mark">—</span><h3>No products found</h3><p>When you create listings, they will appear here with inventory, publication status, and edit actions.</p><button className="secondary-button" type="button" onClick={onAdd}>Create a product</button></section>}{products.length > 0 && <div className="product-management-list">{products.map((product) => <article key={product.id}><div><strong>{product.name}</strong><span>{product.category} · {Number(product.price).toLocaleString()} ETB · {product.quantity} available</span></div><span className={`status-label ${product.status}`}>{product.status}</span></article>)}</div>}</>;
}

function ProductEditor({ form, updateField, submitProduct, formError, onCancel }) {
  return <><div className="dashboard-heading"><div><p className="eyebrow">CATALOG</p><h2>Add product</h2><p className="dashboard-intro">Save a draft while you prepare the listing, or publish when all details are ready.</p></div><button className="outline-button" type="button" onClick={onCancel}>Cancel</button></div><form className="product-editor" onSubmit={submitProduct}><div className="editor-main"><label>Product name<input name="name" value={form.name} onChange={updateField} placeholder="e.g. Handwoven cotton scarf" /></label><label>Description<textarea name="description" rows="7" value={form.description} onChange={updateField} placeholder="Tell customers what makes this product special." /></label><label>Category<select name="category" value={form.category} onChange={updateField}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><div className="image-upload"><span className="form-label">Product image</span><div className="upload-placeholder"><span className="upload-mark">+</span><strong>Image upload is not connected</strong><small>JPG, PNG, or WebP up to 5 MB. Supabase Storage configuration is required.</small></div></div></div><aside className="editor-side"><label>Price (ETB)<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={updateField} placeholder="0.00" /></label><label>Available quantity<input name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={updateField} placeholder="0" /></label><div className="inventory-preview"><span>Inventory preview</span><strong>{form.quantity === "" ? "Enter quantity" : inventoryState(Number(form.quantity))}</strong></div><label>Publication status<select name="publication" value={form.publication} onChange={updateField}><option value="draft">Draft</option><option value="published">Published</option></select></label>{formError && <p className="form-message form-error">{formError}</p>}<button className="primary-button" type="submit">Save draft</button><p className="form-help">Saving and publishing require the connected products table and ownership policies.</p></aside></form></>;
}

function ProfileEditor({ user, setNotice }) {
  return <><div className="dashboard-heading"><div><p className="eyebrow">STORE PROFILE</p><h2>Tell your story</h2><p className="dashboard-intro">This information will be shown publicly when you choose to publish your store.</p></div></div><form className="profile-form" onSubmit={(event) => { event.preventDefault(); setNotice("Profile saving is unavailable until the Supabase profiles table is connected."); }}><label>Public store name<input defaultValue={user.user_metadata?.full_name || ""} placeholder="Your studio or shop name" /></label><label>Biography<textarea rows="6" placeholder="Share your story and what you make." /></label><label>Location<input placeholder="Addis Ababa, Ethiopia" /></label><label>Public contact method<input type="email" placeholder="hello@example.com" /></label><button className="primary-button">Save profile</button></form></>;
}

function Unavailable({ title, text }) {
  return <section className="dashboard-empty"><span className="empty-mark">—</span><h3>{title}</h3><p>{text}</p></section>;
}
