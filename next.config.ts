import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MÀNG BẢO VỆ TỐI ƯU HÓA: Ép bộ biên dịch tách nhỏ các icon/thành phần dùng chung để giảm tải dung lượng tải trang đầu
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@/components/ui",
      "radix-ui"
    ],
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;