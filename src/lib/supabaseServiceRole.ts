import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// MÀNG CHẶN KIỂM TRA BIẾN MÔI TRƯỜNG TẦNG SERVER
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "[BÁO ĐỘNG HỆ THỐNG]: Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY tại tệp .env.local"
  );
}

/**
 * INSTANCE SUPABASE CLIENT MANG ĐẶC QUYỀN TỐI CAO (BYPASS RLS)
 * Chỉ được phép import và thực thi tại môi trường Server Side (Server Actions, API Routes).
 * Tuyệt đối không leak hoặc gọi tệp tin này ở các Client Component ("use client").
 */
export const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // Tắt cơ chế lưu Session Cookie vì Server chạy stateless
    autoRefreshToken: false, // Không tự động làm mới token trên môi trường chạy ngầm
  },
});