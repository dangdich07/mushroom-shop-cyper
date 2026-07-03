import { Suspense } from "react";
import { notFound } from "next/navigation";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { ProductDetailClient } from "@/features/checkout/components/ProductDetailClient";
import { Activity } from "lucide-react";

// KÍCH HOẠT CHU KỲ LÀM TƯƠI BỘ NHỚ ĐỆM TỰ ĐỘNG (ISR 60 GIÂY MỘT LẦN)
export const revalidate = 60;

// SINH MÃ TOẠ ĐỘ TRƯỚC KHI BUILD ĐỂ GIẢM ĐỘ TRỄ PHẢN HỒI XUỐNG < 5ms
export async function generateStaticParams() {
  try {
    const { data: products } = await supabaseServiceRole
      .from("products")
      .select("id");

    if (!products) return [];

    return products.map((prod) => ({
      slug: String(prod.id),
    }));
  } catch (err) {
    console.error("Gãy luồng tiền biên dịch dữ liệu tĩnh:", err);
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. ĐỌC DỮ LIỆU GỐC CỦA MẪU VẬN NẤM TỪ SUPABASE CLOUD
  const { data: product } = await supabaseServiceRole
    .from("products")
    .select("*")
    .eq("id", slug)
    .maybeSingle();

  if (!product) {
    notFound(); // Đẩy sang trạm gác 404 hỏa tốc nếu sai mã cấu trúc gen nấm
  }

  // 2. TRUY QUẤT REVIEW THẬT TỪ BẢNG REVIEWS LIÊN KẾT ĐÃ KIỂM TOÁN
  const { data: reviews } = await supabaseServiceRole
    .from("reviews")
    .select("*")
    .eq("product_id", slug)
    .order("created_at", { ascending: false });

  // 3. TRA CỨU SẢN PHẨM CÙNG CHỦNG LOẠI SINH HỌC TƯƠNG ĐỒNG
  const { data: relatedProducts } = await supabaseServiceRole
    .from("products")
    .select("*")
    .eq("category", product.category)
    .not("id", "eq", product.id)
    .limit(3);

  // Đóng gói chuyển đổi cấu trúc dữ liệu snake_case từ Postgres sang camelCase của Frontend
  const initialProductData = {
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
    slug: product.id,
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
    slug: p.id, // Hoặc p.slug nếu DB của Chỉ Huy có cột chuỗi chữ định danh
    totalReviews: Number(p.rating_count || 0), 
    tags: p.tags || [] // Nạp mảng tag để hiển thị nhãn Hologram góc trái thẻ
  }));

  return (
    <PageWrapper>
      <div className="relative min-h-screen py-8 border-b border-white/5">
        <Container>
          <Suspense fallback={
            <div className="min-h-screen flex justify-center items-center font-mono text-xs text-primary-neon">
              <Activity className="w-5 h-5 animate-spin mr-2" /> Đang giải băm cấu trúc nấm lượng tử...
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