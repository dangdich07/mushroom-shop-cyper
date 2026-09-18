"use client";

import type { FormEvent } from "react";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductGallery } from "@/components/product-detail/product-gallery";
import { ProductReviews } from "@/components/product-detail/product-reviews";
import { ProductSummary } from "@/components/product-detail/product-summary";
import { ProductTabs } from "@/components/product-detail/product-tabs";
import { RelatedProducts } from "@/components/product-detail/related-products";
import type { ProductDetailClientProps, ProductDetailTab } from "@/components/product-detail/product-detail.types";
import { supabase } from "@/lib/supabaseClient";
import { useCartStore } from "@/store/useCartStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import type { Product } from "@/types/product.types";

const subscribeToClientHydration = () => () => undefined;

export function ProductDetailClient({ initialProduct, relatedProducts }: ProductDetailClientProps) {
  const queryClient = useQueryClient();
  const { addToast } = useOverlayStore();
  const cartStore = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [activeTab, setActiveTab] = useState<ProductDetailTab>("DESCRIPTION");
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(initialProduct.variants[0]?.id ?? "");
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

  const reviewMutation = useMutation({
    mutationFn: async (newReview: { product_id: string; user_name: string; rating: number; comment: string }) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert([{
          product_id: newReview.product_id,
          user_name: newReview.user_name,
          rating: newReview.rating,
          comment: newReview.comment,
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
    onError: (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : "Sự cố mạch bảo vệ cơ sở dữ liệu.";
      addToast({ title: "MẠCH CHẶN LỖI", description: errorMessage, type: "ERROR" });
    },
  });

  const handleReviewSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      addToast({ title: "THIẾU THÔNG TIN", description: "Vui lòng nhập đầy đủ các thông số chứng thực.", type: "ERROR" });
      return;
    }
    reviewMutation.mutate({
      product_id: initialProduct.id,
      user_name: reviewerName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
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
  const selectedVariant = initialProduct.variants.find((variant) => variant.id === selectedVariantId);
  const availableQuantity = selectedVariant ? selectedVariant.stockQuantity - selectedVariant.reservedQuantity : 0;
  const hasClientHydrated = useSyncExternalStore(
    subscribeToClientHydration,
    () => true,
    () => false,
  );
  const isFavorite = hasClientHydrated && isInWishlist(initialProduct.id);

  const handleAddToCart = () => {
    if (!selectedVariant || availableQuantity < quantity) {
      addToast({ title: "KHÔNG KHẢ DỤNG", description: "Biến thể đã chọn không đủ tồn kho.", type: "ERROR" });
      return;
    }
    const addFn = cartStore.addItem;
    if (addFn) {
      addFn({
        id: initialProduct.id,
        lineId: selectedVariant.id,
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        name: initialProduct.name,
        price: selectedVariant.price,
        image: displayImage,
        sku: selectedVariant.sku,
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
      category: initialProduct.category,
      rating: initialProduct.rating,
      sku: initialProduct.sku,
      inStock: initialProduct.in_stock,
      shortDescription: initialProduct.shortDescription,
      slug: initialProduct.slug,
      totalReviews: initialProduct.reviews?.length || 0,
      tags: initialProduct.tags || [],
    };
    toggleWishlist(castedProduct);
    addToast({
      title: isFavorite ? "ĐÃ GỠ" : "ĐÃ LƯU LẠI",
      description: isFavorite ? "Đã loại bỏ khỏi mục yêu thích." : "Đã khóa lưu trữ vào mục yêu thích cá nhân.",
      type: "SUCCESS",
    });
  };

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  };

  return (
    <div className="w-full min-w-0 overflow-x-clip font-mono text-xs text-text-pure">
      <Link href="/products" className="group mb-8 inline-flex min-h-11 items-center gap-2 uppercase tracking-widest text-text-dark hover:text-primary-neon focus-visible:bio-focus">
        <ArrowLeft aria-hidden="true" className="h-4 w-4 motion-safe:group-hover:-translate-x-1" /> Quay lại sàn giao dịch
      </Link>

      <div className="mb-16 grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-5">
          <ProductGallery images={initialProduct.images} productName={initialProduct.name} selectedImage={displayImage} onSelectImage={setSelectedImage} />
        </div>
        <div className="min-w-0 lg:col-span-7">
          <ProductSummary
            product={initialProduct}
            selectedVariantId={selectedVariantId}
            quantity={quantity}
            availableQuantity={availableQuantity}
            isFavorite={isFavorite}
            onSelectVariant={handleSelectVariant}
            onChangeQuantity={setQuantity}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      </div>

      <ProductTabs
        activeTab={activeTab}
        description={initialProduct.shortDescription}
        onChange={setActiveTab}
        reviewsContent={(
          <ProductReviews
            reviews={initialProduct.reviews}
            reviewerName={reviewerName}
            reviewComment={reviewComment}
            reviewRating={reviewRating}
            isUserLoggedIn={isUserLoggedIn}
            isPending={reviewMutation.isPending}
            onReviewerNameChange={setReviewerName}
            onReviewCommentChange={setReviewComment}
            onReviewRatingChange={setReviewRating}
            onSubmit={handleReviewSubmit}
          />
        )}
      />
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
