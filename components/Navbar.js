"use client";

import Link from "next/link";
import { useState } from "react";
import CartButton from "./CartButton";

const links = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/shops", label: "Creators" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">M</span>
          <span>Made in Ethiopia</span>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">Toggle navigation</span>
          <span aria-hidden="true" className="menu-icon"><i /></span>
        </button>

        <nav
          id="primary-navigation"
          className={`primary-navigation${menuOpen ? " is-open" : ""}`}
          aria-label="Primary navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/marketplace?favorites=1" onClick={() => setMenuOpen(false)}>Favorites</Link>
          <CartButton />
          <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Creator space</Link>
          <Link
            href="/login"
            className="nav-cta"
            onClick={() => setMenuOpen(false)}
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
