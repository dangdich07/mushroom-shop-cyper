import type { NextConfig } from "next";

const scriptSource = process.env.NODE_ENV === "development"
  ? "'self' 'unsafe-inline' 'unsafe-eval'"
  : "'self' 'unsafe-inline'";

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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src ${scriptSource}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com https://router.project-osrm.org https://*.tile.openstreetmap.org https://*.cartocdn.com; worker-src 'self' blob:; frame-src 'self' https://*.supabase.co;` },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
