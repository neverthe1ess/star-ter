import type { Metadata } from "next";

import "./globals.css";
import { AuthBootstrap } from "@/components/AuthBootstrap";

export const metadata: Metadata = {
  title: "Starter",
  description: "빅데이터와 AI로 상권을 분석하는 Starter 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthBootstrap />
        {children}
      </body>
    </html>
  );
}
