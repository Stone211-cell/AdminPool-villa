// app/liff/layout.tsx
// Layout แยกสำหรับ LIFF — ไม่มี header/footer/clerk ของเว็บปกติ
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "จองพูลวิลล่า | Poolvilla By Baitong",
  description: "จองพูลวิลล่าส่วนตัวผ่าน LINE",
};

export default function LiffLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ isolation: "isolate" }}>
        {children}
      </div>
    </>
  );
}
