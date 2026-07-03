"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Product, MushroomCategory } from "@/types/product.types";
import { formatVND } from "@/lib/utils";
import { 
  Package, Plus, Search, Edit2, Trash2, 
  Activity, ToggleLeft, ToggleRight, X, Save, AlertTriangle 
} from "lucide-react";

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // MÀNG TRẠNG THÁI BIỂU MẪU ĐỘNG (FORM STATE)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    scientificName: "",
    category: "MEDICINAL" as MushroomCategory,
    price: 0,
    compareAtPrice: 0,
    image: "",
    shortDescription: "",
    sku: "",
    tags: [] as string[],
  });

  // 1. TRUY QUẾT TOÀN BỘ KHO SINH KHỐI TỪ DATABASE THẬT
  const { data: products, isLoading, isError, error } = useQuery<Product[]>({
    queryKey: ["admin-all-products"],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (err) throw err;
      
      return (data || []).map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        scientificName: p.scientific_name || undefined,
        category: p.category,
        price: Number(p.price),
        compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
        rating: Number(p.rating),
        totalReviews: p.total_reviews,
        image: p.image,
        shortDescription: p.short_description,
        sku: p.sku,
        tags: p.tags || [],
        inStock: p.in_stock
      }));
    }
  });

  // 2. MUTATION: CẬP NHẬT NHANH TRẠNG THÁI LƯU KHO (FAST TOGGLE IN_STOCK)
  const toggleStockMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: boolean }) => {
      const { error: err } = await supabase
        .from("products")
        .update({ in_stock: !currentStatus })
        .eq("id", id);
      if (err) throw err;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-products"] });
    }
  });

  // 3. MUTATION: THỰC THI LỆNH XOÁ ĐỘT BIẾN KHỎI HỆ THỐNG CƠ SỞ DỮ LIỆU
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error: err } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      if (err) throw err;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-products"] });
    }
  });

  // 4. MUTATION: LƯU TRỮ HOẶC CẬP NHẬT BIẾN THỂ GEN SẢN PHẨM MỚI
  const saveProductMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: formData.name,
        slug: formData.slug.toLowerCase().trim(),
        scientific_name: formData.scientificName || null,
        category: formData.category,
        price: formData.price,
        compare_at_price: formData.compareAtPrice || null,
        image: formData.image,
        short_description: formData.shortDescription,
        sku: formData.sku.toUpperCase().trim(),
        tags: formData.tags
      };

      if (editingProduct) {
        // Thực thi lệnh cập nhật dòng dữ liệu cũ
        const { error: err } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);
        if (err) throw err;
      } else {
        // Thực thi lệnh chèn bản ghi mới hoàn toàn vào lõi
        const { error: err } = await supabase
          .from("products")
          .insert([payload]);
        if (err) throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-products"] });
      setIsModalOpen(false);
      setEditingProduct(null);
    }
  });

  // ĐIỀU HỢP BIỂU MẪU KHI ẤN SỬA
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      scientificName: product.scientificName || "",
      category: product.category,
      price: product.price,
      compareAtPrice: product.compareAtPrice || 0,
      image: product.image,
      shortDescription: product.shortDescription,
      sku: product.sku,
      tags: product.tags,
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      scientificName: "",
      category: "MEDICINAL",
      price: 0,
      compareAtPrice: 0,
      image: "",
      shortDescription: "",
      sku: "",
      tags: [],
    });
    setIsModalOpen(true);
  };

  const displayProducts = (products || []).filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full text-xs font-mono">
      
      {/* TIÊU ĐỀ PHÂN KHU */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-base font-heading font-black uppercase text-text-pure tracking-widest flex items-center gap-2">
            <Package className="w-4 h-4 text-primary-cyan" /> BAN QUẢN TRỊ KHO SINH KHỐI MÔ NẤM
          </h1>
          <p className="text-[10px] text-text-dark uppercase tracking-wider">Khởi tạo bản ghi cấu trúc gen vật phẩm và cấu hình lưu trữ phân phối</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="h-10 bg-primary-neon text-background-deep font-bold px-4 flex items-center gap-1.5 uppercase tracking-wider hover:bg-primary-cyan transition-all cursor-pointer shadow-neon-cyan/10"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> CẤY CHỦNG LOẠI MỚI
        </button>
      </div>

      {/* THANH TÌM KIẾM TRA CỨU */}
      <div className="relative w-full bg-black/20 border border-white/5 p-3 flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Dò mã gen nấm, tìm kiếm mã định danh SKU..." 
            className="w-full bg-background-dark border border-white/10 p-2 pl-9 text-text-pure outline-none focus:border-primary-neon uppercase text-xs"
          />
          <Search className="w-4 h-4 text-text-dark absolute left-3 top-2.5" />
        </div>
        <div className="text-text-dark text-[10px] uppercase ml-auto">
          Mật độ: <strong className="text-text-pure">{displayProducts.length}</strong> chủng loại hiển thị
        </div>
      </div>

      {/* LEDGER DATA TABLE LISTING */}
      <div className="glass-premium p-4 border-white/5 w-full">
        {isLoading ? (
          <div className="text-primary-cyan flex items-center justify-center py-12"><Activity className="w-4 h-4 animate-spin mr-2" /> ĐANG QUÉT DANH MỤC LƯU KHO CLOUD...</div>
        ) : isError ? (
          <div className="border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-2 text-red-400 w-full"><AlertTriangle className="w-4 h-4" /> LỖI PHÂN RÃ CỔNG DỮ LIỆU: {error instanceof Error ? error.message : "Xung đột"}</div>
        ) : displayProducts.length === 0 ? (
          <p className="text-center text-text-dark uppercase py-8">Chưa ghi nhận bản ghi cấu trúc nấm khả dụng.</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-black/40 text-text-dark text-[10px] uppercase border-b border-white/5">
                  <th className="p-3 w-16">Mẫu vật</th>
                  <th className="p-3">Thông số phôi</th>
                  <th className="p-3">Hệ sinh học</th>
                  <th className="p-3 text-right">Đơn giá</th>
                  <th className="p-3 text-center">Khả dụng kho</th>
                  <th className="p-3 text-center">Thao tác lệnh</th>
                </tr>
              </thead>
              <tbody>
                {displayProducts.map((prod) => (
                  <tr key={prod.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="p-3">
                      <div className="w-10 h-10 border border-white/10 overflow-hidden bg-black/40">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover opacity-70" />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-text-dark font-bold uppercase tracking-wide">SKU: {prod.sku}</span>
                        <h4 className="font-heading font-bold text-text-pure uppercase text-[12px]">{prod.name}</h4>
                        {prod.scientificName && <span className="text-[10px] text-primary-cyan italic">🔬 {prod.scientificName}</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-text-muted text-[10px] font-bold uppercase">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-text-pure">
                      {formatVND(prod.price)}
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        type="button"
                        disabled={toggleStockMutation.isPending}
                        onClick={() => toggleStockMutation.mutate({ id: prod.id, currentStatus: prod.inStock })}
                        className="cursor-pointer text-text-dark hover:text-text-pure transition-all inline-flex"
                        title="Chuyển đổi trạng thái kho nhanh"
                      >
                        {prod.inStock ? (
                          <ToggleRight className="w-6 h-6 text-primary-neon" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-text-dark/40" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => openEditModal(prod)} className="p-1 border border-white/10 hover:border-primary-cyan text-text-dark hover:text-primary-cyan transition-colors cursor-pointer" title="Sửa mã gen">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => { if (confirm("Xác nhận tiêu hủy vĩnh viễn cấu trúc nấm này khỏi hệ thống lõi?")) deleteProductMutation.mutate(prod.id); }}
                          className="p-1 border border-white/10 hover:border-red-500 text-text-dark hover:text-red-400 transition-colors cursor-pointer" 
                          title="Tiêu hủy bản ghi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FULL CRUD MODAL INTERFACE COIL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#090d16] border border-white/10 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto relative shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-text-dark hover:text-text-pure transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-white/5 pb-2">
              <h3 className="text-sm font-heading font-black uppercase text-text-pure tracking-widest">
                {editingProduct ? "CẬP NHẬT BIẾN THỂ VẬT PHẨM" : "KHỞI TẠO CẤU TRÚC PHÔI NẤM MỚI"}
              </h3>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveProductMutation.mutate(); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
              
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-text-dark uppercase">Tên thương phẩm chủng nấm</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-text-dark uppercase">Mã định danh SKU (Duy nhất)</label>
                <input required type="text" disabled={!!editingProduct} value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} placeholder="MUSH-XXXX" className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon disabled:opacity-40 uppercase" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-text-dark uppercase">Đường dẫn tĩnh Slug (Duy nhất)</label>
                <input required type="text" disabled={!!editingProduct} value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="nam-dong-trung- premium" className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon disabled:opacity-40" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-text-dark uppercase">Danh pháp khoa học (Scientific Name)</label>
                <input type="text" value={formData.scientificName} onChange={(e) => setFormData({...formData, scientificName: e.target.value})} placeholder="Cordyceps militaris" className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon italic" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-text-dark uppercase">Phân hệ sinh học phân thùy</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as MushroomCategory})} className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon font-bold uppercase">
                  <option value="MEDICINAL">MEDICINAL — Dược liệu lõi</option>
                  <option value="FOOD">FOOD — Thực phẩm sinh khối</option>
                  <option value="EQUIPMENT">EQUIPMENT — Thiết bị / Phôi nấm</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-text-dark uppercase">Giá trị quyết toán công khai (VND)</label>
                <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon font-bold text-primary-cyan" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-text-dark uppercase">Đường dẫn ảnh cấu trúc sợi (URL)</label>
                <input required type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} placeholder="https://images.unsplash.com/..." className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon" />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-text-dark uppercase">Báo cáo tóm tắt thuộc tính lâm sàng</label>
                <textarea required rows={3} value={formData.shortDescription} onChange={(e) => setFormData({...formData, shortDescription: e.target.value})} className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon font-body resize-none" />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 mt-2 border-t border-white/5 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="h-10 border border-white/10 text-text-muted hover:text-text-pure px-4 font-bold uppercase tracking-wider transition-colors cursor-pointer">
                  Hủy lệnh
                </button>
                <button type="submit" disabled={saveProductMutation.isPending} className="h-10 bg-primary-cyan text-background-deep px-5 font-bold uppercase tracking-wider hover:bg-primary-neon transition-all flex items-center gap-1.5 cursor-pointer shadow-neon-cyan/10">
                  <Save className="w-4 h-4" /> {saveProductMutation.isPending ? "ĐANG ĐỒNG BỘ..." : "GHI ĐÈ DỮ LIỆU THẬT"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}