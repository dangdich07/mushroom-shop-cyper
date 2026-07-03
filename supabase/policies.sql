-- ==========================================================
-- SPRINT 5.3: THẮT CHẶT AN NINH PHÒNG LAB (SECURITY HARDENING)
-- KÍCH HOẠT LẠI RLS VÀ CẤU HÌNH CHÍNH SÁCH BẢO MẬT PHÂN QUYỀN
-- ==========================================================

-- 1. TÁI KÍCH HOẠT MÀNG LỌC BẢO MẬT ROW LEVEL SECURITY (RLS) CHO TOÀN BỘ CÁC BẢNG LÕI
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. XOÁ BỎ CÁC CHÍNH SÁCH CŨ CÓ SẴN (NẾU CÓ) ĐỂ ĐẢM BẢO TÍNH ĐỒNG BỘ SẠCH
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public read access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public insert access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public read access to blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow public read access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert access to orders" ON public.orders;

-- 3. CHÍNH SÁCH CHO BẢNG PRODUCTS (Sàn giao dịch vật phẩm)
-- Cho phép mọi đối tượng Client (kể cả khách vãng lai không đăng nhập) đều được xem danh mục sản phẩm
CREATE POLICY "Allow public read access to products"
ON public.products FOR SELECT USING (true);

-- 4. CHÍNH SÁCH CHO BẢNG REVIEWS (Hội đồng khảo sát sinh học)
-- Đọc nhận xét công khai toàn sàn để kết xuất đồ thị Rating
CREATE POLICY "Allow public read access to reviews"
ON public.reviews FOR SELECT USING (true);

-- Cho phép gửi báo cáo đánh giá chuyên môn mới lên hệ thống cơ sở dữ liệu
CREATE POLICY "Allow public insert access to reviews"
ON public.reviews FOR INSERT WITH CHECK (true);

-- 5. CHÍNH SÁCH CHO BẢNG BLOGS (Trung tâm lưu trữ học thuật)
-- Cho phép đọc toàn bộ tài liệu và bài nghiên cứu khoa học công khai
CREATE POLICY "Allow public read access to blogs"
ON public.blogs FOR SELECT USING (true);

-- 6. CHÍNH SÁCH CHO BẢNG ORDERS (Quản lý và kiểm toán vận đơn)
-- Để trang tra cứu /track-order dò tìm lộ trình qua mã ma trận CB-MUSH-XXXXXX hoạt động mượt mà:
CREATE POLICY "Allow public read access to orders"
ON public.orders FOR SELECT USING (true);

-- Cho phép đẩy cấu trúc vận đơn mới lên trục lưu trữ đám mây khi khách hàng nhấn Quyết toán
CREATE POLICY "Allow public insert access to orders"
ON public.orders FOR INSERT WITH CHECK (true);