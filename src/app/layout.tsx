import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteChrome } from "@/components/layout/site-chrome";
import { ToastContainer } from "@/components/ui/toast";
import { LoadingPortal } from "@/components/ui/loading-portal";
import { CommandMenu } from "@/components/common/command-menu";
import { BackToTop } from "@/components/common/back-to-top";
import { ChatWidget } from "@/components/common/chat-widget"; // Thêm mới

const inter = Inter({ subsets: ["vietnamese"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

export const metadata: Metadata = {
  title: "CyberMushroom - Nấm Thực Phẩm & Dược Liệu Cao Cấp",
  description: "Hệ thống cung cấp nấm thực phẩm hữu cơ, nấm dược liệu quý hiếm công nghệ cao."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" data-theme="dark" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cybermushroom-theme');t=t==='light'?'light':'dark';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){document.documentElement.dataset.theme='dark'}})();`,
          }}
        />
      </head>
      <body className="bg-background-deep text-text-muted antialiased flex flex-col min-h-screen">
        <div className="fixed inset-0 cyber-grid pointer-events-none z-0 opacity-40" />
        <div className="site-background-gradient fixed inset-0 pointer-events-none z-[-1]" />
        <Providers>
          <SiteChrome>
            <div className="relative z-10 w-full flex-grow">
              {children}
            </div>
          </SiteChrome>
          
          <ToastContainer />
          <LoadingPortal />
          <CommandMenu />
          <BackToTop />
          <ChatWidget /> {/* Tích hợp kênh hỗ trợ trực tuyến */}
        </Providers>
      </body>
    </html>
  );
}
