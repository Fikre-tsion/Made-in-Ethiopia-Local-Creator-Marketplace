import Link from "next/link";

export const metadata = {
  title: "Creator Demo | Made in Ethiopia",
};

export default function CreatorDemoPage() {
  return (
    <main className="dashboard-page demo-page">
      <section className="dashboard-card">
        <p className="eyebrow">DEMO PREVIEW · CREATOR</p>

        <h1>Creator Studio Preview</h1>

        <p className="demo-description">
          Explore what your creator dashboard looks like.
          This is a read-only preview using sample data.
        </p>

        <div className="demo-stats">
          <div className="demo-stat-card">
            <span>Total Products</span>
            <strong>12</strong>
            <small>Demo data</small>
          </div>

          <div className="demo-stat-card">
            <span>Published</span>
            <strong>8</strong>
            <small>Demo data</small>
          </div>

          <div className="demo-stat-card">
            <span>Drafts</span>
            <strong>4</strong>
            <small>Demo data</small>
          </div>
        </div>

        <div className="demo-actions">
          <Link
            href="/register?role=creator"
            className="primary-button"
          >
            Create a Creator Account →
          </Link>

          <Link
            href="/marketplace"
            className="demo-outline-button"
          >
            Explore Marketplace →
          </Link>
        </div>
      </section>
    </main>
  );
}