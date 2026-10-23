"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import initialProducts from "@/data/products";

const CURRENT_CREATOR_ID = 1;

export default function CreatorDashboard() {
  const [products, setProducts] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("made_in_ethiopia_products");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (err) {
          console.error("Failed to load products from storage:", err);
        }
      }
    }
    return initialProducts;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Handwoven Crafts",
    price: "",
    emoji: "🛍️",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const creatorProducts = products.filter((p) => p.shopId === CURRENT_CREATOR_ID);

  useEffect(() => {
    localStorage.setItem("made_in_ethiopia_products", JSON.stringify(products));
  }, [products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required.";
    }
    if (!formData.price.trim()) {
      newErrors.price = "Price is required.";
    } else if (isNaN(formData.price.replace(/,/g, "").replace("ETB", "").trim())) {
      newErrors.price = "Please enter a valid numeric price.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ name: "", category: "Handwoven Crafts", price: "", emoji: "🛍️" });
    setIsEditing(false);
    setEditId(null);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const rawNumeric = formData.price.replace(/[^0-9]/g, "");
    const formattedPrice = `${Number(rawNumeric).toLocaleString()} ETB`;

    if (isEditing) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editId ? { ...item, ...formData, price: formattedPrice } : item
        )
      );
      notify("Product updated successfully!");
    } else {
      const newListing = {
        id: Date.now(),
        ...formData,
        price: formattedPrice,
        shopId: CURRENT_CREATOR_ID,
        color: "sand",
      };
      setProducts((prev) => [newListing, ...prev]);
      notify("New product published successfully!");
    }

    resetForm();
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setEditId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.replace("ETB", "").trim(),
      emoji: product.emoji || "🛍️",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product listing?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      notify("Product removed successfully.");
    }
  };

  const notify = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Creator Dashboard</h1>
          <p style={styles.subtitle}>Manage your public profile and product listings</p>
        </div>
        <Link href="/marketplace" style={styles.backLink}>
          &larr; Back to Marketplace
        </Link>
      </div>

      {successMessage && <div style={styles.successBanner}>{successMessage}</div>}

      {/* Main Layout */}
      <div style={styles.grid}>
        
        {/* Left Column: Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            {isEditing ? "Edit Product Listing" : "Add New Product"}
          </h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Handwoven Coffee Table Runner"
                style={styles.input}
              />
              {errors.name && <span style={styles.error}>{errors.name}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="Handwoven Crafts">Handwoven Crafts</option>
                <option value="Pottery">Pottery</option>
                <option value="Clothing & Textiles">Clothing & Textiles</option>
                <option value="Artwork & Accessories">Artwork & Accessories</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Price (in ETB)</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 1200"
                style={styles.input}
              />
              {errors.price && <span style={styles.error}>{errors.price}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Emoji Icon</label>
              <input
                type="text"
                name="emoji"
                value={formData.emoji}
                onChange={handleChange}
                maxLength={2}
                style={{ ...styles.input, width: "80px", textAlign: "center" }}
              />
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.primaryButton}>
                {isEditing ? "Update Product" : "Publish Product"}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} style={styles.secondaryButton}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Listings */}
        <div style={styles.card}>
          <div style={styles.listHeader}>
            <h2 style={styles.cardTitle}>My Published Listings</h2>
            <span style={styles.badge}>{creatorProducts.length} Items</span>
          </div>

          {creatorProducts.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📦</p>
              <h3 style={{ color: "#334155", marginBottom: "0.25rem" }}>
                You haven't listed any products yet
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                Use the form on the left to add your first creation to the marketplace.
              </p>
            </div>
          ) : (
            <div style={styles.productList}>
              {creatorProducts.map((product) => (
                <div key={product.id} style={styles.productItem}>
                  <div style={styles.productInfo}>
                    <span style={styles.productEmoji}>{product.emoji || "🛍️"}</span>
                    <div>
                      <h4 style={styles.productName}>{product.name}</h4>
                      <p style={styles.productMeta}>
                        {product.category} • <strong style={{ color: "#2563eb" }}>{product.price}</strong>
                      </p>
                    </div>
                  </div>
                  <div style={styles.productButtons}>
                    <button onClick={() => handleEdit(product)} style={styles.editButton}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(product.id)} style={styles.deleteButton}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2.5rem 1.5rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "1rem",
  },
  title: {
    fontSize: "1.85rem",
    fontWeight: "800",
    color: "#1e293b",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "0.95rem",
  },
  backLink: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  successBanner: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "0.85rem 1.25rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    fontWeight: "600",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "2rem",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
    border: "1px solid #e2e8f0",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    marginBottom: "1.25rem",
    color: "#1e293b",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    fontWeight: "600",
    fontSize: "0.85rem",
    color: "#475569",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.95rem",
    outline: "none",
  },
  error: {
    color: "#ef4444",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  formActions: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "0.5rem",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: "#e2e8f0",
    color: "#475569",
    border: "none",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  badge: {
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "700",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem 1rem",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "2px dashed #cbd5e1",
  },
  productList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxHeight: "500px",
    overflowY: "auto",
  },
  productItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    borderRadius: "8px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  productInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  productEmoji: {
    fontSize: "2rem",
    padding: "0.5rem",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  productName: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "0.1rem",
  },
  productMeta: {
    fontSize: "0.85rem",
    color: "#64748b",
  },
  productButtons: {
    display: "flex",
    gap: "0.5rem",
  },
  editButton: {
    backgroundColor: "#f1f5f9",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    padding: "0.4rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    padding: "0.4rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
  },
};