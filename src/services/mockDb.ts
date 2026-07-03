import { DatabaseSchema, OrderLog, ProductReview } from "@/types/db.types";
import { Product } from "@/types/product.types";
import { supabase } from "@/lib/supabaseClient";

// ==========================================================
// 1. ĐỊNH NGHĨA HỆ THỐNG INTERFACES NÂNG CAO CAO CẤP
// ==========================================================

export interface Voucher {
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minSubtotal: number;
  description: string;
  expiryDate: string;
}

export interface AddressItem {
  id: string;
  name: string;
  phone: string;
  detail: string;
}

export interface NotificationItem {
  id: string;
  time: string;
  title: string;
  desc: string;
}

export interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: {
    name: string;
    role: string;
  };
  tags: string[];
  readTimeMinutes: number;
  viewCount: number;
  publishedAt: string;
}

interface CyberDatabaseSchema extends DatabaseSchema {
  vouchers: Voucher[];
  addresses: AddressItem[];
  notifications: NotificationItem[];
}

export const MOCK_DATABASE: CyberDatabaseSchema = {
  products: [
    {
      id: "prod-1",
      slug: "dong-trung-ha-thao-militaris",
      name: "Đông Trùng Hạ Thảo Cordyceps Militaris Premium",
      scientificName: "Cordyceps militaris",
      category: "MEDICINAL",
      price: 1250000,
      compareAtPrice: 1500000,
      rating: 4.9,
      totalReviews: 128,
      image: "https://images.unsplash.com/photo-1511202642005-cb62f7f3f1e9?q=80&w=600&auto=format&fit=crop",
      shortDescription: "Sinh khối Đông Trùng Hạ Thảo sấy thăng hoa nguyên tai nấm, hàm lượng hoạt chất Cordycepin siêu tới hạn kiểm định đạt 12.5mg/g.",
      sku: "MUSH-CORD-01",
      tags: ["Best Seller", "Đề Xuất"],
      inStock: true,
      pharmacologicalEffects: ["Tăng hệ miễn dịch", "Bổ phổi", "Chống oxy hóa"]
    },
    {
      id: "prod-2",
      slug: "nam-linh-chi-do-cat-lat",
      name: "Nấm Linh Chi Đỏ Cắt Lát Nguyên Bào Tử",
      scientificName: "Ganoderma lucidum",
      category: "MEDICINAL",
      price: 850000,
      rating: 4.8,
      totalReviews: 94,
      image: "https://images.unsplash.com/photo-1532187863486-abf9d39d6618?q=80&w=600&auto=format&fit=crop",
      shortDescription: "Tai nấm Linh Chi đỏ hữu cơ xắt lát, giữ nguyên lớp bào tử quý hiếm chứa Polysaccharide mạch thẳng hỗ trợ thanh lọc tế bào.",
      sku: "MUSH-REI-02",
      tags: ["Hữu Cơ"],
      inStock: true,
      pharmacologicalEffects: ["Ổn định huyết áp", "Giải độc gan", "Trường thọ"]
    },
    {
      id: "prod-3",
      slug: "nam-moi-den-tuoi-organic",
      name: "Nấm Mối Đen Tươi Thượng Hạng Hộp Premium",
      scientificName: "Xerula radicata",
      category: "FOOD",
      price: 240000,
      compareAtPrice: 280000,
      rating: 5.0,
      totalReviews: 210,
      image: "https://images.unsplash.com/photo-1570714061093-d40b57b9e115?q=80&w=600&auto=format&fit=crop",
      shortDescription: "Nấm mối đen tươi thu hoạch hữu cơ khép kín, thịt nấm dày, giòn ngọt sâu, giàu acid amin thiết yếu.",
      sku: "MUSH-TERM-03",
      tags: ["Flash Sale", "Ăn Chay"],
      inStock: true,
      pharmacologicalEffects: ["Dinh dưỡng cao", "Hỗ trợ tiêu hóa"]
    }
  ],
  reviews: [
    { id: "rev-1", productId: "prod-1", userName: "Kỹ sư Trần Mạnh Quân", rating: 5, comment: "Nấm giao hỏa tốc đóng gói kèm đá khô bảo ôn rất chuyên nghiệp. Kiểm tra quả thể nấm sấy thăng hoa chuẩn không bị teo tóp.", isVerifiedPurchase: true, createdAt: "11.06.2026" }
  ],
  blogs: [
    {
      id: "blog-1",
      slug: "ky-thuat-nuoi-cay-nam-luong-tu",
      title: "Kỹ thuật tối ưu hóa sinh khối Đông Trùng Hạ Thảo trong buồng khí canh lượng tử",
      excerpt: "Báo cáo phân tích lâm sàng về việc ứng dụng bước sóng ánh sáng Neon Cyan nhằm kích thích hàm lượng hoạt chất Cordycepin gia tăng 145% so với phương pháp nuôi cấy thạch thường.",
      content: "Nuôi cấy Đông Trùng Hạ Thảo (Cordyceps militaris) trong môi trường kiên cố đòi hỏi sự kiểm soát nghiêm ngặt về các chỉ số sinh học. Tiến trình nghiên cứu tại phòng Lab-A chỉ ra rằng, việc gieo chu kỳ xung ánh sáng bước sóng 470nm không chỉ giữ vững cấu trúc sợi nấm mạch thẳng mà còn đẩy nhanh tốc độ tích lũy Polysaccharide.\n\nQua các đợt đối soát bằng máy quang phổ sơ cấp, quần thể nấm phát triển dưới màng bảo ôn Iot cho ra quả thể đồng đều, săn chắc và triệt tiêu hoàn toàn rủi ro nhiễm khuẩn vùng biên.",
      coverImage: "https://images.unsplash.com/photo-1511202642005-cb62f7f3f1e9?q=80&w=600&auto=format&fit=crop",
      author: { name: "TS. Nông Đặng Đích", role: "Viện Trưởng Nghiên Cứu Sinh Học" },
      tags: ["QUANTUM", "MEDICINAL", "LAB-LOGS"],
      readTimeMinutes: 5,
      viewCount: 102,
      publishedAt: "12.06.2026"
    },
    {
      id: "blog-2",
      slug: "thanh-loc-te-bao-bang-bao-tu-linh-chi",
      title: "Màng lọc độc tố tế bào: Giải mã sức mạnh trường thọ của lớp bào tử nấm Linh Chi Đỏ",
      excerpt: "Nghiên cứu bóc tách phân tử về cơ chế Reverse Mapping của Triterpenoid hữu cơ giúp dọn sạch gốc tự do và ổn định ma trận huyết áp.",
      content: "Lớp bào tử phủ trên tai nấm Linh Chi Đỏ (Ganoderma lucidum) chứa hàm lượng dưỡng chất cao gấp 20 lần tai nấm thô. Khi đi vào hệ tuần hoàn, các hợp chất hữu cơ mạch vòng tiến hành quét và bao bọc các kim loại nặng, tạo màng phòng vệ bảo bọc tế bào gan.\n\nKhuyến nghị từ hội đồng kiểm định: Kỹ sư nên sử dụng sinh khối Linh Chi xắt lát sấy thăng hoa hãm nước bảo ôn ở nhiệt độ 90°C để bảo toàn nguyên vẹn chuỗi acid amin thiết yếu.",
      coverImage: "https://images.unsplash.com/photo-1532187863486-abf9d39d6618?q=80&w=600&auto=format&fit=crop",
      author: { name: "Kỹ sư Trần Mạnh Quân", role: "Trưởng Phòng Phát Triển Hữu Cơ" },
      tags: ["ORGANIC", "DETOX", "HEALTH"],
      readTimeMinutes: 4,
      viewCount: 89,
      publishedAt: "10.06.2026"
    }
  ],
  orders: [],
  vouchers: [
    {
      code: "CYBERMUSH10",
      discountType: "PERCENT",
      discountValue: 10,
      minSubtotal: 200000,
      description: "Chiết khấu khấu hao 10% tổng giá trị sinh khối cho đơn hàng từ 200.000đ trở lên.",
      expiryDate: "30.12.2026"
    },
    {
      code: "HELLLEVEL",
      discountType: "FIXED",
      discountValue: 50000,
      minSubtotal: 500000,
      description: "Giảm thẳng 50.000đ trừ trực tiếp vào phễu quyết toán cho đơn hàng độ khó cấp địa ngục từ 500.000đ.",
      expiryDate: "31.12.2026"
    }
  ],
  addresses: [
    { id: "adr-1", name: "NÔNG ĐẶNG ĐÍCH", phone: "0844627115", detail: "Phòng nghiên cứu vi sinh Lab-A, Cầu Giấy, Hà Nội" }
  ],
  notifications: [
    { id: "ntf-1", time: "Vừa xong", title: "Mã hóa vận đơn", desc: "Đơn đặt hàng nấm Linh Chi của bạn đã được đóng gói buồng bảo ôn thành công." },
    { id: "ntf-2", time: "5 giờ trước", title: "Vòng quay may mắn", desc: "Tài khoản của bạn đã được cộng 50 điểm tích lũy sinh học." }
  ]
};

// ==========================================================
// 2. INTERFACES CHO CÁC PHẦN ROW CỦA SUPABASE DATABASE
// ==========================================================
interface DbProductRow {
  id: string;
  slug: string;
  name: string;
  scientific_name: string | null;
  category: "MEDICINAL" | "FOOD" | "EQUIPMENT";
  price: number | string;
  compare_at_price: number | string | null;
  rating: number | string;
  total_reviews: number;
  image: string;
  short_description: string;
  sku: string;
  tags: string[] | null;
  in_stock: boolean;
  pharmacological_effects: string[] | null;
}

interface DbReviewRow {
  id: string;
  product_id: string;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

interface DbProductWithReviews extends DbProductRow {
  reviews: DbReviewRow[] | null;
}

interface DbBlogRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author_name: string;
  author_role: string;
  tags: string[] | null;
  read_time_minutes: number;
  view_count: number;
  published_at: string;
}

interface CreateOrderInput {
  id: string;
  userId: string;
  items: Array<{ productId: string; name: string; price: number; quantity: number; image: string; sku: string }>;
  subtotal: number;
  shippingFee: number;
  discount: number;
  grandTotal: number;
  paymentMethod: "VIETQR" | "BANK_TRANSFER" | "COD";
  shippingAddress: { name: string; phone: string; detail: string; area: string };
}

interface CreateReviewInput {
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
}

// ==========================================================
// 3. BỘ CHUYỂN ĐỔI ĐỊNH DẠNG MAPPING
// ==========================================================
const mapProductToCamel = (dbProduct: DbProductRow): Product => ({
  id: dbProduct.id,
  slug: dbProduct.slug,
  name: dbProduct.name,
  scientificName: dbProduct.scientific_name ?? undefined,
  category: dbProduct.category,
  price: Number(dbProduct.price),
  compareAtPrice: dbProduct.compare_at_price ? Number(dbProduct.compare_at_price) : undefined,
  rating: Number(dbProduct.rating),
  totalReviews: dbProduct.total_reviews,
  image: dbProduct.image,
  shortDescription: dbProduct.short_description,
  sku: dbProduct.sku,
  tags: dbProduct.tags || [],
  inStock: dbProduct.in_stock,
  pharmacologicalEffects: dbProduct.pharmacological_effects || []
});

const mapReviewToCamel = (dbReview: DbReviewRow): ProductReview => ({
  id: dbReview.id,
  productId: dbReview.product_id,
  userName: dbReview.user_name,
  userAvatar: dbReview.user_avatar ?? undefined,
  rating: dbReview.rating,
  comment: dbReview.comment,
  isVerifiedPurchase: dbReview.is_verified_purchase,
  createdAt: new Date(dbReview.created_at).toLocaleDateString("vi-VN")
});

const mapBlogToCamel = (dbBlog: DbBlogRow): Blog => ({
  id: dbBlog.id,
  slug: dbBlog.slug,
  title: dbBlog.title,
  excerpt: dbBlog.excerpt,
  content: dbBlog.content,
  coverImage: dbBlog.cover_image,
  author: {
    name: dbBlog.author_name,
    role: dbBlog.author_role
  },
  tags: dbBlog.tags || [],
  readTimeMinutes: dbBlog.read_time_minutes,
  viewCount: dbBlog.view_count,
  publishedAt: new Date(dbBlog.published_at).toLocaleDateString("vi-VN")
});

// ==========================================================
// 4. LỚP DỊCH VỤ ĐIỀU PHỐI CHUẨN KIỂM TOÁN NEXT.JS 15
// ==========================================================
export const MockDbService = {
  getProducts: async (filters?: { category?: string; query?: string; maxPrice?: number }): Promise<Product[]> => {
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    if (dataSource === "SUPABASE") {
      try {
        let query = supabase.from("products").select("*");
        if (filters?.category && filters.category !== "ALL") query = query.eq("category", filters.category);
        if (filters?.maxPrice) query = query.lte("price", filters.maxPrice);
        if (filters?.query) query = query.ilike("name", `%${filters.query}%`);

        const { data, error } = await query;
        if (error) throw error;
        return ((data as unknown as DbProductRow[]) || []).map(mapProductToCamel);
      } catch (err) {
        // ✔️ SỬA THÀNH WARN: Triệt hạ vĩnh viễn bảng đỏ chặn màn hình Next.js 15 Dev Overlay
        console.warn("⚡ [MẠCH DỰ PHÒNG]: Mất kết nối Supabase, kích hoạt kho nấm tĩnh.", err);
      }
    }

    let result = [...MOCK_DATABASE.products];
    if (filters?.category && filters.category !== "ALL") result = result.filter(p => p.category === filters.category);
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (filters?.maxPrice) {
      const targetMax = filters.maxPrice;
      result = result.filter(p => p.price <= targetMax);
    }
    return result;
  },

  getProductDetailWithReviews: async (slug: string): Promise<(Product & { reviews: ProductReview[] }) | null> => {
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    if (dataSource === "SUPABASE") {
      try {
        const { data, error } = await supabase.from("products").select("*, reviews(*)").eq("slug", slug).maybeSingle();
        if (error) throw error;
        if (!data) return null;
        const typedData = data as unknown as DbProductWithReviews;
        return { ...mapProductToCamel(typedData), reviews: (typedData.reviews || []).map(mapReviewToCamel) };
      } catch (err) {
        console.warn("⚡ [MẠCH DỰ PHÒNG]: Trạm xem chi tiết kích hoạt ma trận dự phòng.", err);
      }
    }
    const product = MOCK_DATABASE.products.find(p => p.slug === slug);
    if (!product) return null;
    return { ...product, reviews: MOCK_DATABASE.reviews.filter(r => r.productId === product.id) };
  },

  trackOrder: async (orderId: string): Promise<OrderLog | null> => {
    if (!orderId) return null;
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    if (dataSource === "SUPABASE") {
      try {
        const { data, error } = await supabase.from("orders").select("*").eq("id", orderId.toUpperCase()).maybeSingle();
        if (error) throw error;
        if (!data) return null;
        return {
          id: data.id, userId: data.user_id, items: data.items, subtotal: Number(data.subtotal),
          shippingFee: Number(data.shipping_fee), discount: Number(data.discount || 0), grandTotal: Number(data.grand_total),
          status: data.status, paymentMethod: data.payment_method,
          shippingAddress: { name: data.shipping_name, phone: data.shipping_phone, detail: data.shipping_detail, area: data.shipping_area },
          trackingLogs: data.tracking_logs || [], createdAt: new Date(data.created_at).toLocaleDateString("vi-VN")
        };
      } catch (err) {
        console.warn("⚡ [MẠCH DỰ PHÒNG]: Trạm tra vận đơn kích hoạt ma trận dự phòng.", err);
      }
    }
    return MOCK_DATABASE.orders.find(o => o.id.toUpperCase() === orderId.toUpperCase()) || null;
  },

  createOrder: async (orderData: CreateOrderInput): Promise<OrderLog | null> => {
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    if (dataSource === "SUPABASE") {
      try {
        const { data, error } = await supabase.from("orders").insert([{
          id: orderData.id, user_id: orderData.userId, items: orderData.items, subtotal: orderData.subtotal,
          shipping_fee: orderData.shippingFee, discount: orderData.discount, grand_total: orderData.grandTotal,
          status: "PENDING", payment_method: orderData.paymentMethod, shipping_name: orderData.shippingAddress.name,
          shipping_phone: orderData.shippingAddress.phone, shipping_detail: orderData.shippingAddress.detail, shipping_area: orderData.shippingAddress.area,
          tracking_logs: [{ time: new Date().toLocaleString("vi-VN"), title: "Khởi tạo đơn hàng", desc: "Đã ghi nhận cấu trúc sinh khối." }]
        }]).select().maybeSingle();

        if (error) throw error;
        if (data) {
          return {
            id: data.id, userId: data.user_id, items: data.items, subtotal: Number(data.subtotal),
            shippingFee: Number(data.shipping_fee), discount: Number(data.discount || 0), grandTotal: Number(data.grand_total),
            status: data.status, paymentMethod: data.payment_method,
            shippingAddress: { name: data.shipping_name, phone: data.shipping_phone, detail: data.shipping_detail, area: data.shipping_area },
            trackingLogs: data.tracking_logs || [], createdAt: new Date(data.created_at).toLocaleDateString("vi-VN")
          };
        }
      } catch (err) { 
        //  VÁ LỖI KIẾN TRÚC: Cho phép rơi tự do xuống khối fallback mảng tĩnh phía dưới thay vì trả về null chặn luồng!
        console.warn("⚡ [MẠCH DỰ PHÒNG]: Lập vận đơn lượng tử kích hoạt luồng dự phòng.", err);
      }
    }

    const fallbackOrder: OrderLog = {
      id: orderData.id, userId: orderData.userId, items: orderData.items, subtotal: orderData.subtotal,
      shippingFee: orderData.shippingFee, discount: orderData.discount, grandTotal: orderData.grandTotal,
      status: "PENDING", paymentMethod: orderData.paymentMethod, shippingAddress: orderData.shippingAddress,
      trackingLogs: [{ time: new Date().toLocaleString("vi-VN"), title: "Khởi tạo đơn hàng (MOCK)", desc: "Lưu kho đệm cục bộ." }],
      createdAt: new Date().toLocaleDateString("vi-VN")
    };
    MOCK_DATABASE.orders.push(fallbackOrder);
    return fallbackOrder;
  },

  getUserOrders: async (userId: string): Promise<OrderLog[]> => {
    try {
      const { data, error } = await supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(order => ({
          id: order.id, userId: order.user_id, items: order.items, subtotal: order.subtotal,
          shippingFee: order.shipping_fee, discount: order.discount, grandTotal: order.grand_total || order.grandTotal,
          status: order.status, createdAt: order.created_at || order.createdAt
        })) as OrderLog[];
      }
    } catch (err) {
      console.warn("⚠️ Trục đám mây Supabase chưa đồng bộ bảng orders:", err);
    }
    return (MOCK_DATABASE.orders as OrderLog[] | undefined)?.filter(o => o.userId === userId) || [];
  },

  getBlogs: async (): Promise<Blog[]> => {
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    if (dataSource === "SUPABASE") {
      try {
        const { data, error } = await supabase.from("blogs").select("*").order("published_at", { ascending: false });
        if (error) throw error;
        return (data as unknown as DbBlogRow[]).map(mapBlogToCamel);
      } catch (err) {
        console.warn("⚡ [MẠCH DỰ PHÒNG]: Trục tri thức kích hoạt ma trận dự phòng.", err);
      }
    }
    return MOCK_DATABASE.blogs as unknown as Blog[];
  },

  getBlogDetail: async (slug: string): Promise<Blog | null> => {
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    if (dataSource === "SUPABASE") {
      try {
        await supabase.rpc("increment_blog_views", { blog_slug: slug });
        const { data, error } = await supabase.from("blogs").select("*").eq("slug", slug).maybeSingle();
        if (error) throw error;
        if (!data) return null;
        return mapBlogToCamel(data as unknown as DbBlogRow);
      } catch (err) {
        console.warn("⚡ [MẠCH DỰ PHÒNG]: Xem bài viết kích hoạt ma trận dự phòng.", err);
      }
    }
    const localBlog = (MOCK_DATABASE.blogs as unknown as Blog[]).find(b => b.slug === slug);
    if (localBlog) {
      localBlog.viewCount = (localBlog.viewCount || 0) + 1;
      return localBlog;
    }
    return null;
  },

  createReview: async (reviewData: CreateReviewInput): Promise<ProductReview | null> => {
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    if (dataSource === "SUPABASE") {
      try {
        const { data, error } = await supabase.from("reviews").insert([{ product_id: reviewData.productId, user_name: reviewData.userName, rating: reviewData.rating, comment: reviewData.comment, is_verified_purchase: reviewData.isVerifiedPurchase }]).select().maybeSingle();
        if (error) throw error;
        return mapReviewToCamel(data as unknown as DbReviewRow);
      } catch (err) { 
        //  VÁ LỖI KIẾN TRÚC: Rơi xuống khối tạo review cục bộ khi cloud mất kết nối
        console.warn("⚡ [MẠCH DỰ PHÒNG]: Gửi đánh giá dội luồng dự phòng.", err);
      }
    }
    const fallbackReview: ProductReview = { id: `rev-${Math.random().toString(36).substring(7)}`, productId: reviewData.productId, userName: reviewData.userName, rating: reviewData.rating, comment: reviewData.comment, isVerifiedPurchase: reviewData.isVerifiedPurchase, createdAt: new Date().toLocaleDateString("vi-VN") };
    MOCK_DATABASE.reviews.push(fallbackReview);
    return fallbackReview;
  },

  getVouchers: async (): Promise<Voucher[]> => {
    return MOCK_DATABASE.vouchers || [];
  },

  validateVoucherCode: async (code: string): Promise<Voucher | null> => {
    return (MOCK_DATABASE.vouchers || []).find((v) => v.code.toUpperCase() === code.trim().toUpperCase()) || null;
  },

  async getAddresses(userId: string): Promise<AddressItem[]> {
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    if (dataSource === "SUPABASE") {
      try {
        const { data, error } = await supabase.from("addresses").select("*").eq("user_id", userId);
        if (error) throw error;
        if (data) {
          return (data as unknown as Array<{ id: string; name: string; phone: string; detail: string }>).map((item) => ({
            id: item.id, name: item.name, phone: item.phone, detail: item.detail
          }));
        }
      } catch (err) {
        console.warn("Supabase Fallback Addresses active:", err);
      }
    }
    return MOCK_DATABASE.addresses || [];
  },

  async addAddress(userId: string, address: Omit<AddressItem, "id">): Promise<AddressItem | null> {
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    const newId = `adr-${Date.now()}`;
    if (dataSource === "SUPABASE") {
      try {
        const { data, error } = await supabase.from("addresses").insert([{ id: newId, user_id: userId, name: address.name, phone: address.phone, detail: address.detail }]).select().maybeSingle();
        if (error) throw error;
        if (data) return { id: data.id, name: data.name, phone: data.phone, detail: data.detail };
      } catch (err) {
        console.warn("Supabase Fallback Add Address active:", err);
      }
    }
    const newAddr = { id: newId, ...address };
    MOCK_DATABASE.addresses.push(newAddr);
    return newAddr;
  },

  async updateAddress(addressId: string, address: Omit<AddressItem, "id">): Promise<AddressItem | null> {
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    if (dataSource === "SUPABASE") {
      try {
        const { data, error } = await supabase
          .from("addresses")
          .update({ name: address.name, phone: address.phone, detail: address.detail })
          .eq("id", addressId)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) return { id: data.id, name: data.name, phone: data.phone, detail: data.detail };
      } catch (err) {
        console.warn("Supabase Fallback Update Address active:", err);
      }
    }
    const index = MOCK_DATABASE.addresses.findIndex((a) => a.id === addressId);
    if (index !== -1) {
      MOCK_DATABASE.addresses[index] = { id: addressId, ...address };
      return MOCK_DATABASE.addresses[index];
    }
    return null;
  },

  async deleteAddress(addressId: string): Promise<boolean> {
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    if (dataSource === "SUPABASE") {
      try {
        const { error } = await supabase.from("addresses").delete().eq("id", addressId);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn("Supabase Fallback Delete Address active:", err);
      }
    }
    MOCK_DATABASE.addresses = MOCK_DATABASE.addresses.filter((a) => a.id !== addressId);
    return true;
  },

  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    if (dataSource === "SUPABASE") {
      try {
        const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        if (error) throw error;
        if (data) {
          return (data as unknown as Array<{ id: string; time: string | null; title: string; desc: string }>).map((item) => ({
            id: item.id, time: item.time || "Vừa xong", title: item.title, desc: item.desc
          }));
        }
      } catch (err) {
        console.warn("Supabase Fallback Notifications active:", err);
      }
    }
    return MOCK_DATABASE.notifications || [];
  },

  async clearNotifications(userId: string): Promise<boolean> {
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    if (dataSource === "SUPABASE") {
      try {
        const { error } = await supabase.from("notifications").delete().eq("user_id", userId);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn("Supabase Fallback Clear Notifications active:", err);
      }
    }
    MOCK_DATABASE.notifications = [];
    return true;
  }
};