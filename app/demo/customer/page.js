import Link from "next/link";

export const metadata = { title: "Customer Demo | Made in Ethiopia" };

export default function CustomerDemoPage() {
  return (
    <main className="dashboard-page demo-page">
      <section className="dashboard-card">
        <p className="eyebrow">DEMO PREVIEW · CUSTOMER</p>
        <h1>Customer space preview</h1>
        <p>This is a safe, read-only preview. It does not create an account, save a password, or place an order.</p>
        <div className="dashboard-empty">
          <span className="empty-mark">✦</span>
          <h3>Discover local makers</h3>
          <p>Browse products, explore creator studios, and build a basket in the marketplace.</p>
          <Link className="primary-button" href="/marketplace">Browse marketplace</Link>
        </div>
        <p><Link className="text-link" href="/register?role=customer">Create a real customer account</Link></p>
      </section>
    </main>
  );
}
