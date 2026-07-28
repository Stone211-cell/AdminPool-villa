import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Villa DD | จองบ้านพักพูลวิลล่าส่วนตัว ราคาพิเศษ",
  description: "จองบ้านพักพูลวิลล่าส่วนตัวที่ดีที่สุด พร้อมโปรโมชั่นมากมาย",
};

import { I18nProvider } from "@/components/I18nProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="th"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <I18nProvider>
            {children}
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
