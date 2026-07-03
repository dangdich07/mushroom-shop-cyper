import { createClient } from "@supabase/supabase-js";
import { z } from "zod"; // Kế thừa thư viện Zod sẵn có trong package.json để kiểm định dữ liệu

// 1. THIẾT LẬP MA TRẬN KIỂM TOÁN BIẾN MÔI TRƯỜNG (ENV VALIDATION SCHEMA)
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("Tọa độ URL Supabase cấu hình sai định dạng protocol.")
    .or(z.literal("")), // Cho phép chuỗi trống lúc dev chạy offline chế độ MOCK
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_DATA_SOURCE: z.enum(["SUPABASE", "MOCK"]).default("MOCK"),
});

// Chạy tiến trình đối soát runtime variables
const envProject = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  NEXT_PUBLIC_DATA_SOURCE: process.env.NEXT_PUBLIC_DATA_SOURCE,
});

if (!envProject.success) {
  console.warn(
    "⚠️ [CẢNH BÁO AN NINH PHÒNG LAB] Cấu hình biến môi trường chưa đạt điều kiện Production:",
    envProject.error.format()
  );
}

// 2. KHỞI TẠO THỰC THỂ KẾT NỐI (FALLBACK CHỐNG SẬP PHÔI KHI RUNTIME TRỐNG)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);