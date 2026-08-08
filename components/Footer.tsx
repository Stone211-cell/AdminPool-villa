"use client";

import Link from "next/link";
import { useTranslation } from "./I18nProvider";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 relative z-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <img src="/logo.jpg" alt="Baitong Poolvilla" className="h-12 w-12 rounded-full object-cover shadow-sm" />
              <div>
                <p className="text-base font-black tracking-tight text-[#1f2937] leading-none">BAITONG POOLVILLA</p>
                <p className="text-xs text-[#ff758f] font-semibold">บ้านพักพูลวิลล่าพัทยา สัตหีบ</p>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              ที่พักพูลวิลล่าพัทยา สัตหีบ สะอาด ปลอดภัย พร้อมสิ่งอำนวยความสะดวกครบครัน สระว่ายน้ำส่วนตัว ปิ้งย่าง คาราโอเกะ ให้คุณพักผ่อนอย่างเต็มที่
            </p>
            <div className="flex gap-4">
              {/* Facebook Page */}
              <a
                href="https://web.facebook.com/profile.php?id=61556499615942"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#f4f7fe] flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                title="เพจ Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              {/* LINE OA */}
              <a
                href="https://line.me/R/ti/p/@baitongpoolvilla"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#f4f7fe] flex items-center justify-center text-[#00B900] hover:bg-[#00B900] hover:text-white transition-colors"
                title="LINE @baitongpoolvilla"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.04.792.019 1.077l-.145.894c-.035.21-.163.805.706.438.869-.367 4.697-2.766 6.945-5.132 2.309-2.427 3.382-4.996 3.382-7.477z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-black text-gray-900 mb-6">เมนูแนะนำ</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/" className="text-gray-500 hover:text-[#ff758f] transition-colors">{t("home")}</Link></li>
              <li><Link href="/articles" className="text-gray-500 hover:text-[#ff758f] transition-colors">{t("article")}</Link></li>
              <li><Link href="/contact" className="text-gray-500 hover:text-[#ff758f] transition-colors">{t("contact")}</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-500 hover:text-[#ff758f] transition-colors">นโยบายความเป็นส่วนตัว</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-black text-gray-900 mb-6">หมวดหมู่บ้านพัก</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/category/PROMOTION" className="text-gray-500 hover:text-[#ff758f] transition-colors">บ้านพักโปรโมชั่น</Link></li>
              <li><Link href="/category/RECOMMENDED" className="text-gray-500 hover:text-[#ff758f] transition-colors">บ้านพักแนะนำ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-black text-gray-900 mb-6">ติดต่อเรา</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#ff758f] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <a
                  href="https://maps.app.goo.gl/UwV3tVGGWJjXKujJ7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 text-sm hover:text-[#ff758f] transition-colors"
                >
                  59/75 สุขุมวิท 89 ซ.หนองหิน5<br />หมู่บ้านบ้านสวยไม้งาม
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <div className="flex flex-col gap-1">
                  <a href="https://web.facebook.com/profile.php?id=61556499615942" target="_blank" rel="noopener noreferrer" className="text-gray-500 text-sm hover:text-blue-600 transition-colors">เพจ Facebook</a>
                  <a href="https://web.facebook.com/jirapat.sutudnaayutthaya?locale=th_TH" target="_blank" rel="noopener noreferrer" className="text-gray-500 text-sm hover:text-blue-600 transition-colors">Facebook ส่วนตัว จิราภัทร สุทัศน์ ณ อยุธยา</a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#00B900] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.04.792.019 1.077l-.145.894c-.035.21-.163.805.706.438.869-.367 4.697-2.766 6.945-5.132 2.309-2.427 3.382-4.996 3.382-7.477z"/></svg>
                <a href="https://line.me/R/ti/p/@baitongpoolvilla" target="_blank" rel="noopener noreferrer" className="text-gray-500 text-sm hover:text-[#00B900] transition-colors">@baitongpoolvilla</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Baitong Poolvilla | จิราภัทร สุทัศน์ ณ อยุธยา. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link href="/privacy-policy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
