import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthBootstrap } from "@/components/AuthBootstrap";

const mapleStory = localFont({
  src: "../public/fonts/Maplestory OTF Bold.otf",
  variable: "--font-maplestory",
});

const mapleStoryLight = localFont({
  src: "../public/fonts/Maplestory OTF Light.otf",
  variable: "--font-maplestory-light",
});

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
      <body className={`${mapleStory.variable} ${mapleStoryLight.variable} font-[family-name:var(--font-maplestory-light)] antialiased`}>
        <AuthBootstrap />
        {children}
      </body>
    </html>
  );
}
