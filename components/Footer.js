import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <Link href="/" className="brand footer-brand">
            <span className="brand-mark" aria-hidden="true">
              ✦
            </span>
            <span>Made in Ethiopia</span>
          </Link>
          <p>Celebrating local makers, one beautiful creation at a time.</p>
        </div>

        <div className="footer-links">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/register">Become a creator</Link>
          <Link href="/login">Sign in</Link>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>Made in Ethiopia</span>
        <span>Made with care in Ethiopia</span>
      </div>
    </footer>
  );
}
