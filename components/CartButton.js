"use client";

import Link from "next/link";
import { useCart } from "../lib/cart/CartProvider";

export default function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className="cart-button" aria-label={`Cart (${itemCount} items)`}>
      <span className="cart-label">Cart</span>
      {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
    </Link>
  );
}
