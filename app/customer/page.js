import Link from "next/link";
import { requireRole } from "../../lib/auth/server";

export const metadata = { title: "Customer Dashboard | Made in Ethiopia" };
export const instant = false;

export default async function CustomerPage() {
  const { user, profile } = await requireRole("customer");
  const name = profile.display_name || user.user_metadata?.full_name || user.email;

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <p className="eyebrow">CUSTOMER SPACE</p>
        <h1>Welcome, {name}</h1>
        <p>Browse local products, save your favorites, and keep discovering Ethiopian creators.</p>
        <div className="dashboard-empty-actions">
          <Link className="primary-button" href="/marketplace">Browse marketplace</Link>
          <Link className="outline-button" href="/cart">View your basket</Link>
        </div>
      </section>
    </main>
  );
}
