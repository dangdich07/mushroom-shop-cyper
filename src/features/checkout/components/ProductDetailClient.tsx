"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
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
  const [selectedVariantId, setSelectedVariantId] = useState(
    initialProduct.variants.find((variant) => variant.stockQuantity - variant.reservedQuantity > 0)?.id
      ?? initialProduct.variants[0]?.id
      ?? "",
  );
  const [selectedImage, setSelectedImage] = useState<string>(
    initialProduct.image || initialProduct.images[0]?.url || "",
  );
  const [reviewerName, setReviewerName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const galleryImages = useMemo(() => {
    const candidates = [
      ...(initialProduct.image ? [{ url: initialProduct.image, alt: initialProduct.name }] : []),
      ...initialProduct.images,
    ];
    const seen = new Set<string>();

    return candidates.filter((image) => {
      const url = image.url.trim();
      if (!url || seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }, [initialProduct.image, initialProduct.images, initialProduct.name]);

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
    setSelectedImage(initialProduct.image || initialProduct.images[0]?.url || "");
    setSelectedVariantId(
      initialProduct.variants.find((variant) => variant.stockQuantity - variant.reservedQuantity > 0)?.id
        ?? initialProduct.variants[0]?.id
        ?? "",
    );
    setQuantity(1);
  }, [initialProduct.id, initialProduct.image, initialProduct.images, initialProduct.variants]);

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
    <div className="w-full min-w-0 overflow-x-clip text-text-pure">
      <nav aria-label="Điều hướng phân cấp" className="mb-5 flex min-h-11 max-w-full items-center gap-2 overflow-hidden text-sm sm:mb-7">
        <Link href="/" className="inline-flex shrink-0 items-center gap-2 text-text-dark transition-colors hover:text-primary-neon focus-visible:bio-focus">
          <Home aria-hidden="true" className="h-4 w-4" />
          <span className="hidden sm:inline">Trang chủ</span>
        </Link>
        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-primary-neon/60" />
        <Link href="/products" className="shrink-0 text-text-dark transition-colors hover:text-primary-neon focus-visible:bio-focus">Danh mục nấm</Link>
        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-primary-neon/60" />
        <span aria-current="page" className="truncate font-medium text-text-muted">{initialProduct.name}</span>
      </nav>

      <div className="mb-10 grid min-w-0 grid-cols-1 items-stretch gap-6 lg:mb-12 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:gap-7 xl:gap-9">
        <div className="min-w-0">
          <ProductGallery images={galleryImages} productName={initialProduct.name} selectedImage={displayImage} onSelectImage={setSelectedImage} />
        </div>
        <div className="min-w-0">
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
        product={initialProduct}
        selectedVariant={selectedVariant}
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
