import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "bgremover - 图片背景移除工具",
  description: "拖拽即用的在线图片背景移除工具，无需注册，秒级出图。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
