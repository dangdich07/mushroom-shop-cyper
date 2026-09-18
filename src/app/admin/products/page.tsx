"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatePanel } from "@/components/admin/admin-state-panel";
import { AdminProductList } from "@/components/admin/products/admin-product-list";
import { AdminProductInventoryModal } from "@/components/admin/products/admin-product-inventory-modal";
import { AdminProductModal } from "@/components/admin/products/admin-product-modal";
import { AdminProductsToolbar } from "@/components/admin/products/admin-products-toolbar";
import { adjustVariantInventoryAdminAction, deleteProductAdminAction, saveProductAdminAction, setProductVariantsActiveAdminAction } from "./actions";
import { getAdminProducts } from "@/features/admin/products/admin-products.repository";
import type { AdminProduct, AdminProductFormData } from "@/features/admin/products/admin-products.types";
import { supabase } from "@/lib/supabaseClient";
import { useOverlayStore } from "@/store/useOverlayStore";

const EMPTY_FORM: AdminProductFormData = { name: "", slug: "", scientificName: "", category: "MEDICINAL", price: 0, compareAtPrice: 0, image: "", shortDescription: "", sku: "", tags: [] };

function toForm(product: AdminProduct): AdminProductFormData {
  return { name: product.name, slug: product.slug, scientificName: product.scientificName ?? "", category: product.category, price: product.price, compareAtPrice: product.compareAtPrice ?? 0, image: product.image, shortDescription: product.shortDescription, sku: product.sku, tags: product.tags };
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useOverlayStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [inventoryProduct, setInventoryProduct] = useState<AdminProduct | null>(null);
  const [formData, setFormData] = useState<AdminProductFormData>(EMPTY_FORM);
  const productsQuery = useQuery({ queryKey: ["admin-all-products"], queryFn: () => getAdminProducts(supabase) });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const result = await saveProductAdminAction(editingProduct?.id ?? null, formData);
      if (!result.success) throw new Error(result.error ?? "Không thể lưu sản phẩm lúc này.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-products"] });
      setEditingProduct(null);
      setCreating(false);
      addToast({ title: creating ? "ĐÃ TẠO SẢN PHẨM" : "ĐÃ LƯU SẢN PHẨM", description: creating ? "Sản phẩm và variant mặc định đã được tạo với tồn kho 0." : "Thông tin sản phẩm đã được cập nhật.", type: "SUCCESS" });
    },
    onError: (error: Error) => addToast({ title: "KHÔNG THỂ LƯU", description: error.message, type: "ERROR" }),
  });
  const toggleMutation = useMutation({
    mutationFn: async (product: AdminProduct) => {
      const result = await setProductVariantsActiveAdminAction(product.id, !product.variantsActive);
      if (!result.success) throw new Error(result.error ?? "Không thể cập nhật trạng thái kinh doanh.");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-all-products"] }),
    onError: (error: Error) => addToast({ title: "KHÔNG THỂ CẬP NHẬT", description: error.message, type: "ERROR" }),
  });
  const deleteMutation = useMutation({
    mutationFn: async (product: AdminProduct) => {
      const result = await deleteProductAdminAction(product.id);
      if (!result.success) throw new Error(result.error ?? "Không thể xóa sản phẩm.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-products"] });
      addToast({ title: "ĐÃ XÓA SẢN PHẨM", description: "Bản ghi sản phẩm đã được xóa.", type: "SUCCESS" });
    },
    onError: (error: Error) => addToast({ title: "KHÔNG THỂ XÓA", description: error.message, type: "ERROR" }),
  });
  const inventoryMutation = useMutation({
    mutationFn: async (adjustment: Parameters<typeof adjustVariantInventoryAdminAction>[0]) => {
      const result = await adjustVariantInventoryAdminAction(adjustment);
      if (!result.success) throw new Error(result.error ?? "Không thể điều chỉnh tồn kho.");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-products"] });
      setInventoryProduct(null);
      addToast({ title: "ĐÃ CẬP NHẬT TỒN KHO", description: "Số lượng kiểm kê đã được lưu và ghi vào nhật ký điều chỉnh.", type: "SUCCESS" });
    },
    onError: (error: Error) => addToast({ title: "KHÔNG THỂ CẬP NHẬT TỒN", description: error.message, type: "ERROR" }),
  });

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const displayProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => (category === "ALL" || product.category === category) && (!query || product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query)));
  }, [category, products, search]);
  const pending = saveMutation.isPending || toggleMutation.isPending || deleteMutation.isPending || inventoryMutation.isPending;

  function openEdit(product: AdminProduct) { setCreating(false); setEditingProduct(product); setFormData(toForm(product)); }
  function openCreate() { setEditingProduct(null); setCreating(true); setFormData(EMPTY_FORM); }
  function closeModal() { if (!saveMutation.isPending) { setEditingProduct(null); setCreating(false); } }
  function requestDelete(product: AdminProduct) { if (window.confirm(`Xác nhận xóa sản phẩm “${product.name}”? Thao tác có thể bị từ chối nếu sản phẩm đang được tham chiếu.`)) deleteMutation.mutate(product); }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!saveMutation.isPending) saveMutation.mutate(); }

  return <div className="flex min-w-0 flex-col gap-5"><AdminPageHeader title="Quản Trị Danh Mục Sản Phẩm" description="Cập nhật thông tin, trạng thái kinh doanh và tồn kho theo từng biến thể" /><AdminProductsToolbar category={category} count={displayProducts.length} search={search} onCategoryChange={setCategory} onCreate={openCreate} onSearchChange={setSearch} />{productsQuery.isLoading ? <AdminStatePanel kind="LOADING" message="Đang tải danh mục sản phẩm..." /> : productsQuery.isError ? <AdminStatePanel kind="ERROR" message="Không thể tải danh mục sản phẩm lúc này." action={<button type="button" onClick={() => productsQuery.refetch()} className="min-h-11 border border-current/30 px-4 font-mono text-xs font-bold uppercase focus-visible:bio-focus">Thử lại</button>} /> : displayProducts.length === 0 ? <AdminStatePanel kind="EMPTY" message="Không tìm thấy sản phẩm phù hợp." /> : <AdminProductList products={displayProducts} pending={pending} onEdit={openEdit} onToggle={(product) => toggleMutation.mutate(product)} onDelete={requestDelete} onInventory={setInventoryProduct} />}<AdminProductModal creating={creating} open={creating || Boolean(editingProduct)} data={formData} pending={saveMutation.isPending} onChange={setFormData} onClose={closeModal} onSubmit={submit} /><AdminProductInventoryModal key={inventoryProduct?.id ?? "inventory-closed"} product={inventoryProduct} pending={inventoryMutation.isPending} onClose={() => { if (!inventoryMutation.isPending) setInventoryProduct(null); }} onSave={(adjustment) => inventoryMutation.mutate(adjustment)} /></div>;
}
