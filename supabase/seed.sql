-- CyberMushroom - extended demo catalog recovered and expanded from the app
-- Run after schema.sql and policies.sql. This file is safe to re-run.

begin;

insert into public.products (
  id,
  slug,
  name,
  scientific_name,
  category,
  price,
  compare_at_price,
  image,
  short_description,
  sku,
  tags,
  in_stock,
  pharmacological_effects
)
values
  (
    'prod-1',
    'dong-trung-ha-thao-militaris',
    'Đông Trùng Hạ Thảo Cordyceps Militaris Premium',
    'Cordyceps militaris',
    'MEDICINAL',
    1250000,
    1500000,
    'https://images.unsplash.com/photo-1511202642005-cb62f7f3f1e9?q=80&w=600&auto=format&fit=crop',
    'Sinh khối Đông Trùng Hạ Thảo sấy thăng hoa nguyên tai nấm, hàm lượng Cordycepin được kiểm định đạt 12.5mg/g.',
    'MUSH-CORD-01',
    array['Best Seller', 'Đề Xuất'],
    true,
    array['Tăng hệ miễn dịch', 'Bổ phổi', 'Chống oxy hóa']
  ),
  (
    'prod-2',
    'nam-linh-chi-do-cat-lat',
    'Nấm Linh Chi Đỏ Cắt Lát Nguyên Bào Tử',
    'Ganoderma lucidum',
    'MEDICINAL',
    850000,
    null,
    'https://images.unsplash.com/photo-1532187863486-abf9d39d6618?q=80&w=600&auto=format&fit=crop',
    'Tai nấm Linh Chi Đỏ hữu cơ cắt lát, giữ nguyên lớp bào tử giàu polysaccharide.',
    'MUSH-REI-02',
    array['Hữu Cơ'],
    true,
    array['Ổn định huyết áp', 'Hỗ trợ chức năng gan', 'Chống oxy hóa']
  ),
  (
    'prod-3',
    'nam-moi-den-tuoi-organic',
    'Nấm Mối Đen Tươi Thượng Hạng Hộp Premium',
    'Xerula radicata',
    'FOOD',
    240000,
    280000,
    'https://images.unsplash.com/photo-1570714061093-d40b57b9e115?q=80&w=600&auto=format&fit=crop',
    'Nấm mối đen tươi thu hoạch hữu cơ khép kín, thịt nấm dày, giòn ngọt và giàu acid amin thiết yếu.',
    'MUSH-TERM-03',
    array['Flash Sale', 'Ăn Chay'],
    true,
    array['Dinh dưỡng cao', 'Hỗ trợ tiêu hóa']
  ),
  (
    'prod-4',
    'nam-hau-thu-say-thang-hoa',
    'Nấm Hầu Thủ Sấy Thăng Hoa Premium',
    'Hericium erinaceus',
    'MEDICINAL',
    690000,
    790000,
    'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600&auto=format&fit=crop',
    'Nấm Hầu Thủ nuôi cấy sạch, sấy thăng hoa giúp bảo toàn cấu trúc Hericenone và Erinacine tự nhiên.',
    'MUSH-LION-04',
    array['Não Bộ', 'Sấy Thăng Hoa'],
    true,
    array['Hỗ trợ trí nhớ', 'Tăng khả năng tập trung', 'Hỗ trợ hệ thần kinh']
  ),
  (
    'prod-5',
    'nam-chaga-lat-say-lanh',
    'Nấm Chaga Cắt Lát Sấy Lạnh',
    'Inonotus obliquus',
    'MEDICINAL',
    920000,
    1050000,
    'https://images.unsplash.com/photo-1511202642005-cb62f7f3f1e9?q=80&w=600&auto=format&fit=crop',
    'Chaga tuyển chọn được cắt lát và sấy lạnh ở nhiệt độ thấp, thích hợp pha trà hoặc chiết xuất chuyên sâu.',
    'MUSH-CHAGA-05',
    array['Chống Oxy Hóa', 'Trà Dược Liệu'],
    true,
    array['Chống oxy hóa', 'Hỗ trợ miễn dịch', 'Hỗ trợ chuyển hóa']
  ),
  (
    'prod-6',
    'nam-van-chi-cao-chiet',
    'Cao Chiết Nấm Vân Chi Polysaccharide',
    'Trametes versicolor',
    'MEDICINAL',
    780000,
    null,
    'https://images.unsplash.com/photo-1532187863486-abf9d39d6618?q=80&w=600&auto=format&fit=crop',
    'Cao chiết Nấm Vân Chi cô đặc dạng bột, chuẩn hóa hàm lượng polysaccharide cho nhu cầu nghiên cứu và sử dụng hằng ngày.',
    'MUSH-TURKEY-06',
    array['Cao Chiết', 'Lab Tested'],
    true,
    array['Hỗ trợ miễn dịch', 'Bảo vệ tế bào', 'Chống oxy hóa']
  ),
  (
    'prod-7',
    'nam-huong-tuoi-huu-co',
    'Nấm Hương Tươi Hữu Cơ',
    'Lentinula edodes',
    'FOOD',
    165000,
    190000,
    'https://images.unsplash.com/photo-1570714061093-d40b57b9e115?q=80&w=600&auto=format&fit=crop',
    'Nấm Hương tươi trồng trên giá thể gỗ tự nhiên, mùi thơm đậm và kết cấu chắc, phù hợp món xào, lẩu và súp.',
    'MUSH-SHII-07',
    array['Hữu Cơ', 'Umami'],
    true,
    array['Giàu chất xơ', 'Bổ sung vitamin nhóm B', 'Hỗ trợ tiêu hóa']
  ),
  (
    'prod-8',
    'nam-bao-ngu-xam-premium',
    'Nấm Bào Ngư Xám Premium',
    'Pleurotus ostreatus',
    'FOOD',
    135000,
    null,
    'https://images.unsplash.com/photo-1570714061093-d40b57b9e115?q=80&w=600&auto=format&fit=crop',
    'Cụm Nấm Bào Ngư Xám thu hoạch trong ngày, tai dày, vị ngọt thanh và thích hợp cho chế độ ăn thực vật.',
    'MUSH-OYSTER-08',
    array['Thu Hoạch Mới', 'Ăn Chay'],
    true,
    array['Giàu đạm thực vật', 'Ít chất béo', 'Hỗ trợ tiêu hóa']
  ),
  (
    'prod-9',
    'nam-kim-cham-trang',
    'Nấm Kim Châm Trắng Lab Fresh',
    'Flammulina filiformis',
    'FOOD',
    89000,
    105000,
    'https://images.unsplash.com/photo-1570714061093-d40b57b9e115?q=80&w=600&auto=format&fit=crop',
    'Nấm Kim Châm trắng giòn, ngọt nhẹ, được đóng gói lạnh ngay sau thu hoạch để duy trì độ tươi.',
    'MUSH-ENOKI-09',
    array['Lab Fresh', 'Hotpot'],
    true,
    array['Ít calo', 'Giàu chất xơ', 'Bổ sung khoáng chất']
  ),
  (
    'prod-10',
    'nam-maitake-tuoi',
    'Nấm Maitake Tươi Thượng Hạng',
    'Grifola frondosa',
    'FOOD',
    295000,
    330000,
    'https://images.unsplash.com/photo-1504545102780-26774c1bb073?q=80&w=600&auto=format&fit=crop',
    'Maitake tươi dạng cụm, hương vị đậm và kết cấu nhiều lớp, phù hợp áp chảo hoặc chế biến món chay cao cấp.',
    'MUSH-MAITAKE-10',
    array['Gourmet', 'Nhập Mới'],
    true,
    array['Giàu beta-glucan', 'Bổ sung chất xơ', 'Hỗ trợ miễn dịch']
  ),
  (
    'prod-11',
    'phoi-nam-hau-thu-san-sang-ra-qua',
    'Phôi Nấm Hầu Thủ Sẵn Sàng Ra Quả',
    'Hericium erinaceus spawn block',
    'EQUIPMENT',
    350000,
    390000,
    'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600&auto=format&fit=crop',
    'Khối phôi Hầu Thủ đã phủ kín sợi, đi kèm hướng dẫn tạo ẩm và kích thích ra quả tại nhà.',
    'EQUIP-LION-11',
    array['Grow Kit', 'Dễ Trồng'],
    true,
    array['Phôi vô trùng', 'Chu kỳ ươm ngắn', 'Có hướng dẫn kỹ thuật']
  ),
  (
    'prod-12',
    'bo-kit-nuoi-dong-trung-ha-thao-iot',
    'Bộ Kit Nuôi Đông Trùng Hạ Thảo IoT Mini',
    null,
    'EQUIPMENT',
    3290000,
    3650000,
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&auto=format&fit=crop',
    'Bộ buồng nuôi mini tích hợp điều khiển ánh sáng, nhiệt độ và độ ẩm dành cho quy mô gia đình hoặc phòng Lab nhỏ.',
    'EQUIP-IOT-12',
    array['IoT', 'Full Kit'],
    true,
    array['Điều khiển tự động', 'Theo dõi thời gian thực', 'Tiết kiệm năng lượng']
  ),
  (
    'prod-13',
    'may-phun-suong-sieu-am-lab',
    'Máy Phun Sương Siêu Âm Lab 4L',
    null,
    'EQUIPMENT',
    1450000,
    1590000,
    'https://images.unsplash.com/photo-1581093458791-9d42e3c4a7a5?q=80&w=600&auto=format&fit=crop',
    'Máy tạo ẩm siêu âm dung tích 4 lít, hỗ trợ giữ độ ẩm ổn định cho buồng nuôi nấm diện tích nhỏ.',
    'EQUIP-MIST-13',
    array['Tự Động', 'Bảo Hành 12 Tháng'],
    true,
    array['Hạt sương mịn', 'Điều chỉnh công suất', 'Tự ngắt khi hết nước']
  ),
  (
    'prod-14',
    'cam-bien-nhiet-am-wifi',
    'Cảm Biến Nhiệt Độ & Độ Ẩm WiFi',
    null,
    'EQUIPMENT',
    590000,
    650000,
    'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=600&auto=format&fit=crop',
    'Cảm biến WiFi theo dõi nhiệt độ và độ ẩm liên tục, có cảnh báo khi thông số buồng nuôi vượt ngưỡng.',
    'EQUIP-SENSOR-14',
    array['WiFi', 'Realtime'],
    true,
    array['Cảnh báo từ xa', 'Lưu lịch sử đo', 'Độ chính xác cao']
  ),
  (
    'prod-15',
    'gia-the-mun-cua-tiet-trung',
    'Túi Giá Thể Mùn Cưa Tiệt Trùng 2kg',
    null,
    'EQUIPMENT',
    95000,
    null,
    'https://images.unsplash.com/photo-1532187863486-abf9d39d6618?q=80&w=600&auto=format&fit=crop',
    'Giá thể mùn cưa phối trộn dinh dưỡng, đóng túi lọc khí và tiệt trùng sẵn cho quá trình cấy giống nấm.',
    'EQUIP-SUBSTRATE-15',
    array['Vô Trùng', 'Sẵn Sàng Cấy'],
    true,
    array['Độ ẩm ổn định', 'Túi lọc khí', 'Phối trộn đồng đều']
  )
on conflict (id) do update
set
  slug = excluded.slug,
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  category = excluded.category,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  image = excluded.image,
  short_description = excluded.short_description,
  sku = excluded.sku,
  tags = excluded.tags,
  in_stock = excluded.in_stock,
  pharmacological_effects = excluded.pharmacological_effects;

insert into public.reviews (
  id,
  product_id,
  user_name,
  rating,
  comment,
  is_verified_purchase,
  created_at
)
values (
  'rev-1',
  'prod-1',
  'Kỹ sư Trần Mạnh Quân',
  5,
  'Nấm được đóng gói bảo ôn rất chuyên nghiệp; quả thể sấy thăng hoa giữ nguyên cấu trúc.',
  true,
  '2026-06-11T08:00:00+07:00'
)
on conflict (id) do update
set
  product_id = excluded.product_id,
  user_name = excluded.user_name,
  rating = excluded.rating,
  comment = excluded.comment,
  is_verified_purchase = excluded.is_verified_purchase,
  created_at = excluded.created_at;

insert into public.blogs (
  id,
  slug,
  title,
  excerpt,
  content,
  cover_image,
  author_name,
  author_role,
  tags,
  read_time_minutes,
  view_count,
  published_at
)
values
  (
    'blog-1',
    'ky-thuat-nuoi-cay-nam-luong-tu',
    'Kỹ thuật tối ưu hóa sinh khối Đông Trùng Hạ Thảo trong buồng khí canh',
    'Báo cáo về việc ứng dụng chu kỳ ánh sáng nhằm kích thích hàm lượng Cordycepin trong quá trình nuôi cấy.',
    '<p>Nuôi cấy Đông Trùng Hạ Thảo đòi hỏi kiểm soát nghiêm ngặt ánh sáng, nhiệt độ và độ ẩm. Hệ thống cảm biến giúp theo dõi liên tục các chỉ số sinh học và giảm nguy cơ nhiễm khuẩn.</p><br/><h3 class="text-primary-neon font-heading font-bold text-base uppercase">Chu kỳ ánh sáng</h3><p class="mt-2 text-text-dark">Dải ánh sáng xanh được điều khiển theo chu kỳ giúp quả thể phát triển đồng đều và duy trì hàm lượng hoạt chất.</p>',
    'https://images.unsplash.com/photo-1511202642005-cb62f7f3f1e9?q=80&w=800&auto=format&fit=crop',
    'TS. Nông Đặng Đích',
    'Viện Trưởng Nghiên Cứu Sinh Học',
    array['QUANTUM', 'MEDICINAL', 'LAB-LOGS'],
    5,
    102,
    '2026-06-12T08:00:00+07:00'
  ),
  (
    'blog-2',
    'thanh-loc-te-bao-bang-bao-tu-linh-chi',
    'Giải mã lớp bào tử Nấm Linh Chi Đỏ',
    'Phân tích vai trò của triterpenoid và polysaccharide trong lớp bào tử Linh Chi Đỏ.',
    '<p>Lớp bào tử phủ trên tai nấm Linh Chi Đỏ chứa nhiều hợp chất sinh học có giá trị. Quy trình sấy và bảo quản đúng cách giúp hạn chế thất thoát hoạt chất.</p><br/><h3 class="text-primary-neon font-heading font-bold text-base uppercase">Khuyến nghị sử dụng</h3><p class="mt-2 text-text-dark">Sử dụng sản phẩm theo hướng dẫn và bảo quản tại nơi khô, mát, tránh ánh sáng trực tiếp.</p>',
    'https://images.unsplash.com/photo-1532187863486-abf9d39d6618?q=80&w=800&auto=format&fit=crop',
    'Kỹ sư Trần Mạnh Quân',
    'Trưởng Phòng Phát Triển Hữu Cơ',
    array['ORGANIC', 'DETOX', 'HEALTH'],
    4,
    89,
    '2026-06-10T08:00:00+07:00'
  )
on conflict (id) do update
set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  cover_image = excluded.cover_image,
  author_name = excluded.author_name,
  author_role = excluded.author_role,
  tags = excluded.tags,
  read_time_minutes = excluded.read_time_minutes,
  view_count = excluded.view_count,
  published_at = excluded.published_at;

insert into public.vouchers (
  code,
  discount_type,
  discount_value,
  min_subtotal,
  description,
  expiry_date,
  is_active
)
values
  (
    'CYBERMUSH10',
    'PERCENT',
    10,
    200000,
    'Giảm 10% tổng giá trị sản phẩm cho đơn hàng từ 200.000đ.',
    '2026-12-30',
    true
  ),
  (
    'HELLLEVEL',
    'FIXED',
    50000,
    500000,
    'Giảm trực tiếp 50.000đ cho đơn hàng từ 500.000đ.',
    '2026-12-31',
    true
  )
on conflict (code) do update
set
  discount_type = excluded.discount_type,
  discount_value = excluded.discount_value,
  min_subtotal = excluded.min_subtotal,
  description = excluded.description,
  expiry_date = excluded.expiry_date,
  is_active = excluded.is_active;

commit;
