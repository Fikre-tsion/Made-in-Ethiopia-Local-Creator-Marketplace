import "./globals.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { CartProvider } from "../lib/cart/CartProvider";
import SiteLayout from "../components/SiteLayout";

export const metadata = {
  title: "Made in Ethiopia",
  description: "Discover Ethiopian creators and locally made products.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <CartProvider>
          <SiteLayout>
            {children}
          </SiteLayout>
        </CartProvider>
      </body>
    </html>
  );
}