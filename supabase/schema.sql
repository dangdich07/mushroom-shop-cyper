-- ==========================================================
-- 1. KHỞI TẠO CÁC LOẠI DỮ LIỆU ĐẶC THÙ (ENUMS & EXTENSIONS)
-- ==========================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE mushroom_category AS ENUM ('MEDICINAL', 'FOOD', 'EQUIPMENT');
CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('VIETQR', 'BANK_TRANSFER', 'COD');

-- ==========================================================
-- 2. BẢNG SẢN PHẨM (PRODUCTS TABLE)
-- ==========================================================
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    scientific_name TEXT,
    category mushroom_category NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(12, 2) CHECK (compare_at_price >= price),
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INT DEFAULT 0 CHECK (total_reviews >= 0),
    image TEXT NOT NULL,
    short_description TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    tags TEXT[] DEFAULT '{}',
    in_stock BOOLEAN DEFAULT TRUE,
    pharmacological_effects TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 3. BẢNG ĐÁNH GIÁ (REVIEWS TABLE)
-- ==========================================================
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 4. BẢNG BÀI VIẾT TRI THỨC (BLOGS TABLE)
-- ==========================================================
CREATE TABLE public.blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    read_time_minutes INT NOT NULL DEFAULT 5,
    view_count INT DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 5. BẢNG ĐƠN HÀNG LOGISTICS (ORDERS TABLE)
-- ==========================================================
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY, -- Mã vận đơn sinh định dạng (Ví dụ: CB-MUSH-123456)
    user_id TEXT NOT NULL,
    items JSONB NOT NULL, -- Lưu danh sách mảng vật phẩm đóng băng tại thời điểm mua
    subtotal NUMERIC(12, 2) NOT NULL,
    shipping_fee NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0,
    grand_total NUMERIC(12, 2) NOT NULL,
    status order_status DEFAULT 'PENDING',
    payment_method payment_method NOT NULL,
    shipping_name TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_detail TEXT NOT NULL,
    shipping_area TEXT NOT NULL,
    tracking_logs JSONB DEFAULT '[]'::jsonb, -- Nhật ký lộ trình tuyến tính
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 6. TỰ ĐỘNG HÓA TÍNH TOÁN (DATABASE TRIGGERS)
-- ==========================================================

-- Hàm cập nhật số sao và lượt review trung bình của Sản phẩm
CREATE OR REPLACE FUNCTION public.calculate_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET 
        rating = COALESCE((SELECT AVG(rating) FROM public.reviews WHERE product_id = NEW.product_id), 5.0),
        total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE product_id = NEW.product_id)
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Kích hoạt trigger mỗi khi có dòng review mới được INSERT hoặc DELETE
CREATE TRIGGER trigger_update_product_rating
AFTER INSERT OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.calculate_product_rating();