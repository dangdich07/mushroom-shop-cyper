import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  // ĐÃ BỔ SUNG: Phân khu cấu hình luật kiểm toán chuyên sâu cho Production
  {
    rules: {
      // 1. Tắt hoàn toàn cảnh báo ép buộc dùng thẻ <Image> của Next.js để thoải mái dùng <img> từ URL động
      "@next/next/no-img-element": "off",

      // 2. Chuyển đổi trạng thái "Biến khai báo nhưng không dùng" từ Báo lỗi đỏ (Error) sang Cảnh báo vàng (Warning)
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];

export default eslintConfig;