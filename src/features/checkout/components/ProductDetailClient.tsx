"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Star, ShieldCheck, Beaker, HelpCircle, MessageSquare, 
  ArrowLeft, ShoppingCart, Heart, Plus, Minus 
} from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { supabase } from "@/lib/supabaseClient";
import { formatVND } from "@/lib/utils";
import { Product } from "@/types/product.types";
import { cn } from "@/lib/utils";

type TabType = "DESCRIPTION" | "SPECIFICATIONS" | "REVIEWS" | "QA";

interface ClientReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ClientProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  sku: string;
  category: Product["category"]; // Đồng bộ cấu trúc danh mục lượng tử
  rating: number;
  in_stock: boolean;
  scientificName: string;
  shortDescription: string;
  slug: string;
  reviews: ClientReview[];
  tags?: string[];
}

interface ProductDetailClientProps {
  initialProduct: ClientProduct;
  relatedProducts: Product[]; // Tuyến liên thông sạch bóng any[]
}

export function ProductDetailClient({ initialProduct, relatedProducts }: ProductDetailClientProps) {
  const queryClient = useQueryClient();
  const { addToast } = useOverlayStore();
  const cartStore = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [activeTab, setActiveTab] = useState<TabType>("DESCRIPTION");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>(" ");

  const [reviewerName, setReviewerName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const fetchIdentitySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setReviewerName(session.user.user_metadata?.full_name || session.user.email || "Kỹ Sư Phòng Thí Nghiệm");
        setIsUserLoggedIn(true);
      }
    };
    fetchIdentitySession();
  }, []);

  // MUTATION GỬI BÁO CÁO KIỂM ĐỊNH LÂM SÀNG LÊN CLOUD SUPABASE
  const reviewMutation = useMutation({
    mutationFn: async (newReview: { product_id: string; user_name: string; rating: number; comment: string }) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert([{
          product_id: newReview.product_id,
          user_name: newReview.user_name,
          rating: newReview.rating,
          comment: newReview.comment
        }]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      addToast({ title: "ĐÃ ĐỒNG BỘ", description: "Bản báo cáo kiểm định lâm sàng đã nạp thành công lên đám mây.", type: "SUCCESS" });
      setReviewComment("");
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ["product-detail", initialProduct.id] });
      window.location.reload();
    },
    //  HÓA GIẢI LỖI CHÍ MẠNG: Sử dụng kiểu unknown kết hợp bóc tách Type-Safe để dập tắt hoàn toàn lỗi gạch đỏ
    onError: (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : "Sự cố mạch bảo vệ cơ sở dữ liệu.";
      addToast({ title: "MẠCH CHẶN LỖI", description: errorMessage, type: "ERROR" });
    }
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      addToast({ title: "THIẾU THÔNG TIN", description: "Vui lòng nhập đầy đủ các thông số chứng thực.", type: "ERROR" });
      return;
    }
    reviewMutation.mutate({
      product_id: initialProduct.id,
      user_name: reviewerName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim()
    });
  };

  useEffect(() => {
    if (initialProduct.slug.includes("hau-thu")) {
      setSelectedImage("https://images.unsplash.com/photo-1535254973040-607b474cb50d?q=80&w=600&auto=format&fit=crop");
    } else {
      setSelectedImage(initialProduct.image);
    }
  }, [initialProduct]);

  const displayImage = selectedImage || initialProduct.image;
  const isFavorite = isInWishlist(initialProduct.id);

  const handleAddToCart = () => {
    const addFn = cartStore.addItem; //
    if (addFn) {
      addFn({
        id: initialProduct.id,
        name: initialProduct.name,
        price: initialProduct.price,
        image: displayImage,
        sku: initialProduct.sku
      }, quantity);
      addToast({ title: "GIỎ HÀNG", description: `Đã cấy thêm ${quantity} x ${initialProduct.name} vào khay tiếp nhận.`, type: "SUCCESS" });
    }
  };

  const handleToggleFavorite = () => {
    const castedProduct: Product = {
      id: initialProduct.id,
      name: initialProduct.name,
      price: initialProduct.price,
      image: displayImage,
      category: initialProduct.category, //
      rating: initialProduct.rating,
      sku: initialProduct.sku,
      inStock: initialProduct.in_stock,
      shortDescription: initialProduct.shortDescription,
      slug: initialProduct.slug,
      totalReviews: initialProduct.reviews?.length || 0,
      tags: initialProduct.tags || [] //
    };

    toggleWishlist(castedProduct); // Tuyến liên thông sạch bóng gạch đỏ as any
    addToast({
      title: isFavorite ? "ĐA GỠ" : "ĐA LƯU LẠI",
      description: isFavorite ? "Đã loại bỏ khỏi mục yêu thích." : "Đã khóa lưu trữ vào mục yêu thích cá nhân.",
      type: "SUCCESS"
    });
  };

  return (
    <div className="w-full text-xs font-mono text-text-pure">
      <Link href="/products" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-text-dark hover:text-primary-neon transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Quay lại sàn giao dịch
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="w-full aspect-square bg-background-dark border border-white/5 overflow-hidden relative">
            <img src={displayImage} alt={initialProduct.name} className="w-full h-full object-cover opacity-80" />
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-5 w-full">
          <div className="flex flex-col gap-1">
            <span className="text-primary-cyan tracking-widest uppercase text-[10px]">MÃ ĐỊNH DANH SKU: {initialProduct.sku}</span>
            <h1 className="text-2xl sm:text-4xl font-heading font-black uppercase tracking-tight text-text-pure leading-tight">{initialProduct.name}</h1>
            {initialProduct.scientificName && (
              <p className="text-xs text-primary-neon/80 italic font-body mt-0.5">🔬 Danh pháp: {initialProduct.scientificName}</p>
            )}
          </div>

          <div className="flex items-center gap-4 border-y border-white/5 py-3">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-sm">{Number(initialProduct.rating).toFixed(1)}</span>
            </div>
            <span className="text-text-dark">|</span>
            <span className="text-text-muted">{initialProduct.reviews?.length || 0} Bản kiểm định</span>
            <span className="text-text-dark">|</span>
            <span className={cn("font-bold", initialProduct.in_stock ? "text-primary-neon" : "text-text-dark")}>
              {initialProduct.in_stock ? "● KHO SẴN SÀNG" : "○ HẾT SINH KHỐI"}
            </span>
          </div>

          <p className="text-text-dark font-sans leading-relaxed text-xs">{initialProduct.shortDescription}</p>

          <div className="text-3xl font-black text-text-pure tracking-tight neon-text-cyan my-2">
            {formatVND(initialProduct.price)}
          </div>

          {initialProduct.in_stock && (
            <div className="flex items-center flex-wrap gap-4 mt-2">
              <div className="flex items-center border border-white/10 h-11 bg-black/20">
                <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-full flex items-center justify-center hover:bg-white/5 text-text-dark hover:text-text-pure transition-colors">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center font-bold text-text-pure text-sm">{quantity}</span>
                <button type="button" onClick={() => setQuantity(q => q + 1)} className="w-10 h-full flex items-center justify-center hover:bg-white/5 text-text-dark hover:text-text-pure transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button 
                type="button" 
                onClick={handleAddToCart}
                className="h-11 bg-primary-neon text-background-deep px-6 font-black uppercase tracking-widest hover:bg-primary-cyan transition-colors flex items-center gap-2 cursor-pointer shadow-neon-cyan/20 shadow-lg"
              >
                <ShoppingCart className="w-4 h-4" /> BƠM SINH KHỐI VÀO GIỎ
              </button>

              <button
                type="button"
                onClick={handleToggleFavorite}
                className={cn(
                  "w-11 h-11 border flex items-center justify-center transition-all cursor-pointer",
                  isFavorite ? "border-red-500 bg-red-500/10 text-red-500" : "border-white/10 text-text-dark hover:text-text-pure hover:border-white/20"
                )}
              >
                <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TABS PANEL LAYER */}
      <div className="w-full border border-white/5 bg-background-card/30 mb-16">
        <div className="flex border-b border-white/5 bg-black/10 overflow-x-auto">
          {([
            { id: "DESCRIPTION", label: "Mô Tả Cấu Trúc", icon: Beaker },
            { id: "SPECIFICATIONS", label: "Chứng Nhận Kiểm Định", icon: ShieldCheck },
            { id: "REVIEWS", label: "Hội Đồng Đánh Giá", icon: MessageSquare },
            { id: "QA", label: "Khảo Sát Q&A", icon: HelpCircle },
          ] as const).map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "border-primary-neon bg-white/5 text-primary-neon" : "border-transparent text-text-dark hover:text-text-pure"}`}>
                <TabIcon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 text-text-dark leading-relaxed">
          {activeTab === "DESCRIPTION" && <p className="font-sans text-xs">{initialProduct.shortDescription}</p>}
          {activeTab === "SPECIFICATIONS" && <p>Báo cáo phân tích phòng thí nghiệm đạt tiêu chuẩn an toàn sinh học vô trùng.</p>}
          {activeTab === "QA" && <p>Hệ thống hỏi đáp kỹ thuật nuôi cấy mô nấm cao cấp CyberMushroom.</p>}
          {activeTab === "REVIEWS" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 flex flex-col gap-4">
                {initialProduct.reviews && initialProduct.reviews.length > 0 ? (
                  initialProduct.reviews.map((rev) => (
                    <div key={rev.id} className="border border-white/5 p-4 flex items-start gap-4 bg-black/10">
                      <div className="w-8 h-8 rounded-full border border-primary-neon flex items-center justify-center font-mono text-[10px] text-primary-neon bg-primary-neon/5 shrink-0 uppercase font-bold">
                        {rev.userName.substring(0, 2)}
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-text-pure uppercase text-[11px] tracking-wide">{rev.userName}</span>
                          <span className="text-[10px] text-text-dark">{rev.createdAt}</span>
                        </div>
                        <p className="text-text-muted text-xs font-sans mt-0.5">{rev.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="font-mono text-text-dark italic text-[11px]">Chưa ghi nhận bản báo cáo kiểm định lâm sàng nào.</p>
                )}
              </div>

              <form onSubmit={handleReviewSubmit} className="lg:col-span-5 border border-white/5 bg-black/20 p-5 flex flex-col gap-4">
                <h4 className="font-bold text-text-pure uppercase tracking-widest border-b border-white/5 pb-2">Nạp Báo Cáo Khảo Sát</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-text-dark uppercase text-[10px]">Kỹ sư kiểm định thực hiện</label>
                  <input type="text" value={reviewerName} onChange={(e) => !isUserLoggedIn && setReviewerName(e.target.value)} disabled={isUserLoggedIn} placeholder="Họ tên kỹ sư..." className="bg-background-dark border border-white/10 p-3 text-text-pure outline-none focus:border-primary-neon disabled:opacity-40 font-bold uppercase tracking-wider" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-text-dark uppercase text-[10px]">Hàm lượng đánh giá chuyên môn</label>
                  <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="bg-background-dark border border-white/10 p-3 text-text-pure outline-none focus:border-primary-neon font-bold custom-select-arrow">
                    <option value={5}>⭐⭐⭐⭐ Serology 5/5 (Tối Hảo)</option>
                    <option value={4}>⭐⭐⭐⭐ Serology 4/5 (Đạt Chuẩn)</option>
                    <option value={3}>⭐⭐⭐ Serology 3/5 (Trung Tính)</option>
                    <option value={2}>⭐⭐ Serology 2/5 (Kém Kích ỨNG)</option>
                    <option value={1}>⭐ Serology 1/5 (Đột Biến Lỗi)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-text-dark uppercase text-[10px]">Nội dung báo cáo chi tiết</label>
                  <textarea rows={4} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Nhập kết quả khảo sát lâm sàng..." className="bg-background-dark border border-white/10 p-3 text-text-pure text-xs outline-none focus:border-primary-neon resize-none font-sans" />
                </div>

                <button type="submit" disabled={reviewMutation.isPending} className="h-10 bg-primary-neon text-background-deep font-bold uppercase tracking-wider hover:bg-primary-cyan transition-colors cursor-pointer disabled:opacity-40">
                  {reviewMutation.isPending ? "ĐANG ĐỒNG BỘ..." : "GỬI BÁO CÁO CÔNG KHAI"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* SẢN PHẨM LIÊN QUAN TRÊN TRỤC GEN TƯƠNG ĐỒNG */}
      {relatedProducts.length > 0 && (
        <div className="flex flex-col gap-4 w-full pt-6 border-t border-white/5">
          <h3 className="font-black text-xs uppercase text-text-pure tracking-widest">Cấu trúc gen tương đồng</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} viewMode="grid" showFavoriteButton={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}