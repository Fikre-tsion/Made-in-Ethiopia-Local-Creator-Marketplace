import Link from "next/link";

export const metadata = { title: "Creator Demo | Made in Ethiopia" };

export default function CreatorDemoPage() {
  return (
    <main className="dashboard-page demo-page">
      <section className="dashboard-card">
        <p className="eyebrow">DEMO PREVIEW · CREATOR</p>
        <h1>Creator studio preview</h1>
        <p>This is a safe, read-only preview. It does not create an account, save a password, or change marketplace data.</p>
        <div className="dashboard-stats dashboard-metrics">
          <div><span>Total products</span><strong>12</strong><small>Demo data</small></div>
          <div><span>Published</span><strong>8</strong><small>Demo data</small></div>
          <div><span>Drafts</span><strong>4</strong><small>Demo data</small></div>
        </div>
        <div className="dashboard-empty-actions">
          <Link className="primary-button" href="/register">Create a real creator account</Link>
          <Link className="outline-button" href="/marketplace">View marketplace</Link>
        </div>
      </section>
    </main>
  );
}
