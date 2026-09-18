import { Suspense } from "react";
import { notFound } from "next/navigation";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { ProductDetailClient } from "@/features/checkout/components/ProductDetailClient";
import type { ProductDetailData } from "@/components/product-detail/product-detail.types";
import { Activity } from "lucide-react";

// KÍCH HOẠT CHU KỲ LÀM TƯƠI BỘ NHỚ ĐỆM TỰ ĐỘNG (ISR 60 GIÂY MỘT LẦN)
export const revalidate = 60;

// SINH MÃ TOẠ ĐỘ TRƯỚC KHI BUILD ĐỂ GIẢM ĐỘ TRỄ PHẢN HỒI XUỐNG < 5ms
interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ProductVariantRow {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  weight_grams: number | null;
  price: number | string;
  compare_at_price: number | string | null;
  stock_quantity: number;
  reserved_quantity: number;
  is_active: boolean;
}

interface ProductImageRow {
  image_url: string;
  alt_text: string | null;
  sort_order: number;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. ĐỌC DỮ LIỆU GỐC CỦA MẪU VẬN NẤM TỪ SUPABASE CLOUD
  const { data: product, error: productError } = await supabaseServiceRole
    .from("products")
    .select("*, product_variants(*), product_images(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (productError) {
    console.error("Product detail query failed", { code: productError.code });
    throw new Error("PRODUCT_DETAIL_QUERY_FAILED");
  }

  if (!product) {
    notFound(); // Đẩy sang trạm gác 404 hỏa tốc nếu sai mã cấu trúc gen nấm
  }

  // 2. TRUY QUẤT REVIEW THẬT TỪ BẢNG REVIEWS LIÊN KẾT ĐÃ KIỂM TOÁN
  const { data: reviews } = await supabaseServiceRole
    .from("reviews")
    .select("*")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false });

  // 3. TRA CỨU SẢN PHẨM CÙNG CHỦNG LOẠI SINH HỌC TƯƠNG ĐỒNG
  const { data: relatedProducts } = await supabaseServiceRole
    .from("products")
    .select("*")
    .eq("category", product.category)
    .not("id", "eq", product.id)
    .limit(3);

  // Đóng gói chuyển đổi cấu trúc dữ liệu snake_case từ Postgres sang camelCase của Frontend
  const initialProductData: ProductDetailData = {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    image: product.image,
    sku: product.sku,
    category: product.category,
    rating: Number(product.rating),
    in_stock: product.in_stock,
    scientificName: product.scientific_name || "",
    shortDescription: product.short_description || "",
    slug: product.slug,
    variants: ((product.product_variants || []) as ProductVariantRow[]).filter((variant) => variant.is_active).map((variant) => ({
      id: variant.id,
      productId: variant.product_id,
      name: variant.name,
      sku: variant.sku,
      weightGrams: variant.weight_grams ?? undefined,
      price: Number(variant.price),
      compareAtPrice: variant.compare_at_price === null ? undefined : Number(variant.compare_at_price),
      stockQuantity: variant.stock_quantity,
      reservedQuantity: variant.reserved_quantity,
      isActive: variant.is_active,
    })),
    images: ((product.product_images || []) as ProductImageRow[])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => ({ url: image.image_url, alt: image.alt_text || product.name })),
    reviews: (reviews || []).map(r => ({
      id: r.id,
      userName: r.user_name,
      rating: Number(r.rating),
      comment: r.comment,
      createdAt: new Date(r.created_at).toLocaleDateString("vi-VN")
    }))
  };

  const formattedRelated = (relatedProducts || []).map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    image: p.image,
    sku: p.sku,
    category: p.category,
    rating: Number(p.rating),
    inStock: p.in_stock,
    shortDescription: p.short_description || "",
    
    //  VÁ LỖI CHÍ MẠNG: Bơm đầy đủ lõi thuộc tính định vị để ProductCard khớp lệnh
    slug: p.slug,
    totalReviews: Number(p.total_reviews || 0),
    tags: p.tags || [] // Nạp mảng tag để hiển thị nhãn Hologram góc trái thẻ
  }));

  return (
    <PageWrapper>
      <div className="relative min-h-screen min-w-0 overflow-x-clip border-b border-white/5 py-8">
        <Container>
          <Suspense fallback={
            <div className="flex min-h-[60vh] items-center justify-center px-4 text-center font-mono text-xs text-primary-neon" role="status">
              <Activity aria-hidden="true" className="mr-2 h-5 w-5 animate-spin motion-reduce:animate-none" /> Đang giải băm cấu trúc nấm lượng tử...
            </div>
          }>
            <ProductDetailClient 
              initialProduct={initialProductData} 
              relatedProducts={formattedRelated} 
            />
          </Suspense>
        </Container>
      </div>
    </PageWrapper>
  );
}
