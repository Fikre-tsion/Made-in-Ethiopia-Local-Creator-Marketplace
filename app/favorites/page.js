import { redirect } from "next/navigation";

export default function FavoritesPage() {
  redirect("/marketplace?favorites=1");
}
