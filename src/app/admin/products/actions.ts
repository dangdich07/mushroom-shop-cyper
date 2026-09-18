"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";
import type { AdminInventoryAdjustment, AdminProductFormData } from "@/features/admin/products/admin-products.types";

interface AdminProductResponse { success: boolean; error?: string }

function validateProduct(input: AdminProductFormData) {
  const categoryAllowed = ["MEDICINAL", "FOOD", "EQUIPMENT"].includes(input.category);
  return Boolean(
    input.name.trim() && input.name.length <= 200 &&
    input.slug.trim() && input.slug.length <= 200 &&
    input.sku.trim() && input.sku.length <= 100 &&
    input.image.trim() && input.image.length <= 2000 &&
    input.shortDescription.trim() && input.shortDescription.length <= 2000 &&
    Number.isFinite(input.price) && input.price >= 0 &&
    Number.isFinite(input.compareAtPrice) && input.compareAtPrice >= 0 &&
    categoryAllowed
  );
}

export async function saveProductAdminAction(productId: string | null, input: AdminProductFormData): Promise<AdminProductResponse> {
  try {
    await requireAdmin();
    if (!validateProduct(input)) return { success: false, error: "Thông tin sản phẩm không hợp lệ." };

    const payload = {
      name: input.name.trim(),
      slug: input.slug.toLowerCase().trim(),
      scientific_name: input.scientificName.trim() || null,
      category: input.category,
      price: input.price,
      compare_at_price: input.compareAtPrice || null,
      image: input.image.trim(),
      short_description: input.shortDescription.trim(),
      sku: input.sku.toUpperCase().trim(),
      tags: input.tags,
    };
    const mutation = productId
      ? supabaseServiceRole.from("products").update(payload).eq("id", productId)
      : supabaseServiceRole.from("products").insert({
          ...payload,
          stock_quantity: 0,
          reserved_quantity: 0,
          in_stock: false,
        });
    const { error } = await mutation;

    if (error) return { success: false, error: "Không thể lưu sản phẩm lúc này." };
    revalidatePath("/admin/products");
    revalidatePath(`/products/${input.slug.toLowerCase().trim()}`);
    return { success: true };
  } catch {
    return { success: false, error: "Không thể lưu sản phẩm lúc này." };
  }
}

export async function deleteProductAdminAction(productId: string): Promise<AdminProductResponse> {
  try {
    await requireAdmin();
    if (!productId.trim()) return { success: false, error: "Sản phẩm không hợp lệ." };
    const { error } = await supabaseServiceRole.from("products").delete().eq("id", productId);
    if (error) return { success: false, error: "Không thể xóa sản phẩm đang được liên kết với dữ liệu khác." };
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch {
    return { success: false, error: "Không thể xóa sản phẩm lúc này." };
  }
}

export async function setProductVariantsActiveAdminAction(productId: string, active: boolean): Promise<AdminProductResponse> {
  try {
    await requireAdmin();
    if (!productId.trim() || typeof active !== "boolean") return { success: false, error: "Trạng thái sản phẩm không hợp lệ." };
    const { error } = await supabaseServiceRole.from("product_variants").update({ is_active: active }).eq("product_id", productId);
    if (error) return { success: false, error: "Không thể cập nhật trạng thái kinh doanh lúc này." };
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch {
    return { success: false, error: "Không thể cập nhật trạng thái kinh doanh lúc này." };
  }
}

export async function adjustVariantInventoryAdminAction(input: AdminInventoryAdjustment): Promise<AdminProductResponse> {
  try {
    const actor = await requireAdmin();
    const reason = input.reason.trim();
    if (!input.variantId || !Number.isInteger(input.stockQuantity) || input.stockQuantity < 0 || reason.length < 3 || reason.length > 500) {
      return { success: false, error: "Thông tin điều chỉnh tồn kho không hợp lệ." };
    }

    const { data, error } = await supabaseServiceRole.rpc("adjust_product_variant_inventory", {
      p_variant_id: input.variantId,
      p_new_stock_quantity: input.stockQuantity,
      p_reason: reason,
      p_actor_id: actor.id,
    });
    const result = data as { success?: boolean; error_code?: string } | null;
    if (error || !result?.success) {
      return {
        success: false,
        error: result?.error_code === "STOCK_BELOW_RESERVED"
          ? "Tồn kho không được thấp hơn số lượng đang giữ cho đơn hàng."
          : "Không thể điều chỉnh tồn kho lúc này.",
      };
    }
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch {
    return { success: false, error: "Không thể điều chỉnh tồn kho lúc này." };
  }
}
