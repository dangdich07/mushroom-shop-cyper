# Phục hồi Supabase cho CyberMushroom

Các file SQL trong thư mục này được dựng lại từ toàn bộ truy vấn Supabase hiện có trong `src/`.

## Thứ tự chạy trên project Supabase mới

Mở **SQL Editor** và chạy lần lượt toàn bộ nội dung của:

1. `schema.sql` — tạo enum, bảng, khóa ngoại, index, trigger, RPC checkout và Realtime publication.
2. `policies.sql` — bật RLS, tạo policy, grant quyền và khóa RPC checkout cho `service_role`.
3. `seed.sql` — nạp 15 sản phẩm (5 dược liệu, 5 thực phẩm, 5 thiết bị/phôi), review, blog và voucher demo.

`schema.sql` dành cho database mới/trống. `policies.sql` và `seed.sql` có thể chạy lại.

## Tạo tài khoản quản trị đầu tiên

Đăng ký một tài khoản qua `/login`, xác nhận email nếu Auth đang yêu cầu, rồi chạy trong SQL Editor:

```sql
update public.profiles
set role = 'super_admin'
where email = 'email-cua-ban@example.com';
```

Mọi tài khoản mới khác mặc định có role `customer`. Policy chỉ cho `admin` và `super_admin` sửa dữ liệu quản trị.

## Cấu hình VietQR

RPC vẫn tạo payment khi chưa có cấu hình ngân hàng, nhưng `qr_url` sẽ để trống. Điền mã ngân hàng và số tài khoản thật trước khi thử checkout VietQR:

```sql
insert into public.payment_settings (id, bank_id, account_no, template, enabled)
values (true, 'MB', 'YOURACCOUNTNUMBER', 'compact2', true)
on conflict (id) do update
set
  bank_id = excluded.bank_id,
  account_no = excluded.account_no,
  template = excluded.template,
  enabled = excluded.enabled;
```

Không commit số tài khoản, `service_role` key hay webhook secret vào Git.

## Biến môi trường cần cập nhật

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ANON_OR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=SERVICE_ROLE_KEY
NEXT_PUBLIC_DATA_SOURCE=SUPABASE
PAYMENT_GATEWAY_SECRET=WEBHOOK_HMAC_SECRET
```

Sau khi đổi `.env.local`, khởi động lại Next.js. `SUPABASE_SERVICE_ROLE_KEY` và `PAYMENT_GATEWAY_SECRET` chỉ được dùng ở server.

## Những gì schema đã khôi phục

- `profiles` đồng bộ tự động từ `auth.users` và metadata tài khoản.
- `products`, `reviews`, `blogs`, `vouchers`.
- `orders`, `order_items`, `payments`, `order_tracking`, `payment_logs`.
- `addresses`, `notifications`, `payment_settings`.
- RPC `increment_blog_views`.
- RPC transaction `deploy_secure_checkout_transaction` tạo order, item snapshot, payment, tracking và notification nguyên tử.
- Trigger tự cập nhật rating/review count và `updated_at`.
- Realtime cho `orders`, `order_tracking` và `payments`.

Database mới không thể khôi phục user, đơn hàng hay dữ liệu production đã mất; `seed.sql` chỉ phục hồi dữ liệu demo có trong source code.
