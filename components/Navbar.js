"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import CartButton from "./CartButton";

const links = [
  { href: "/home", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/shops", label: "Creators" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const closeMenu = () => setMenuOpen(false);

  const isCreatorDashboard = pathname.startsWith("/dashboard");
  const isCustomerDashboard = pathname.startsWith("/customer");

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadUser(sessionUser) {
      if (!active) return;

      setUser(sessionUser || null);

      if (!sessionUser) {
        setUserRole(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sessionUser.id)
        .single();

      if (active) {
        setUserRole(data?.role || null);
      }
    }

    supabase.auth.getUser().then(({ data }) => {
      loadUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user || null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Logout failed: " + error.message);
      setLoggingOut(false);
      return;
    }

    setUser(null);
    setUserRole(null);
    closeMenu();

    router.replace("/");
    router.refresh();

    setLoggingOut(false);
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link
          href="/home"
          className="brand"
          onClick={closeMenu}
        >
          <span className="brand-mark" aria-hidden="true">
            M
          </span>
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
          <span aria-hidden="true" className="menu-icon">
            <i />
          </span>
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
              className={
                pathname === link.href ? "nav-active" : ""
              }
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/marketplace?favorites=1"
            onClick={closeMenu}
          >
            Favorites
          </Link>

          <CartButton />

          {userRole === "customer" && (
            <Link
              href="/customer"
              className={
                isCustomerDashboard ? "nav-active" : ""
              }
              onClick={closeMenu}
            >
              Customer Space
            </Link>
          )}

          {userRole === "creator" && (
            <Link
              href="/dashboard"
              className={
                isCreatorDashboard ? "nav-active" : ""
              }
              onClick={closeMenu}
            >
              Creator Space
            </Link>
          )}

          {user ? (
            <button
              type="button"
              className="nav-cta"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out..." : "Log Out"}
            </button>
          ) : (
            <Link
              href="/login"
              className="nav-cta"
              onClick={closeMenu}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}