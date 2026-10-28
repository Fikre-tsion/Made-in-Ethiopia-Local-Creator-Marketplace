
import "./globals.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { CartProvider } from "../lib/cart/CartProvider";

export const metadata = {
  title: "Made in Ethiopia",
  description: "Discover Ethiopian creators and locally made products.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <div className="site-content">{children}</div>
        </CartProvider>
        <Footer />
      </body>
    </html>
  );
}
