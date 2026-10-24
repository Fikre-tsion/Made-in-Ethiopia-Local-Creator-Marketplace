"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

export async function createProduct(formData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must log in before adding a product." };
  }

  const name = String(formData.get("name") || "").trim();
  const shopId = String(formData.get("shop_id") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const imageUrl = String(formData.get("image_url") || "").trim();

  if (!name || !shopId) {
    return { error: "Product name and shop are required." };
  }

  
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id")
    .eq("id", shopId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (shopError || !shop) {
    return { error: "You cannot add a product to this shop." };
  }

 
  const { error } = await supabase.from("products").insert({
    shop_id: shop.id,
    creator_id: user.id,
    name,
    description: description || null,
    category: category || null,
    image_url: imageUrl || null,
  });

  if (error) {
    return { error: "Could not save the product. Check the form and database policies." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
