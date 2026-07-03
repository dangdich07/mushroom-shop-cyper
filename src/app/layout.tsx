import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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
    <html lang="vi" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background-deep text-text-muted antialiased flex flex-col min-h-screen">
        <div className="fixed inset-0 cyber-grid pointer-events-none z-0 opacity-40" />
        <div className="fixed inset-0 bg-gradient-to-tr from-[#030712] via-[#050816] to-[#0b1120] pointer-events-none z-[-1]" />
        <Providers>
          <Header />
          <div className="relative z-10 flex-grow w-full pt-20">
            {children}
          </div>
          <Footer />
          
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