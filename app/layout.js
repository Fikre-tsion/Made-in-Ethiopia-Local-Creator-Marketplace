
import "./globals.css";

export const metadata = {
  title: "Made in Ethiopia",
  description: "Discover Ethiopian creators and locally made products.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
