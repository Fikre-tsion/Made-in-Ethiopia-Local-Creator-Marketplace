"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function SiteLayout({ children }) {
  const pathname = usePathname();

  const isWelcomePage = pathname === "/";

  if (isWelcomePage) {
    return (
      <div className="site-content">
        {children}
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="site-content">
        {children}
      </div>

      <Footer />
    </>
  );
}