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
                <p className="text-xs text-[#ff758f] font-semibold">บ้านพักพูลวิลล่าพัทยา</p>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              ที่พักพูลวิลล่าพัทยา สัตหีบ สะอาด ปลอดภัย พร้อมสิ่งอำนวยความสะดวกครบครัน สระว่ายน้ำส่วนตัว ปิ้งย่าง คาราโอเกะ ให้คุณพักผ่อนอย่างเต็มที่
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-[#f4f7fe] flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#f4f7fe] flex items-center justify-center text-[#00B900] hover:bg-[#00B900] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
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
              <li><a href="#" className="text-gray-500 hover:text-[#ff758f] transition-colors">บ้านพักโปรโมชั่น</a></li>
              <li><a href="#" className="text-gray-500 hover:text-[#ff758f] transition-colors">บ้านพักแนะนำ</a></li>
              <li><a href="#" className="text-gray-500 hover:text-[#ff758f] transition-colors">บ้านติดทะเล</a></li>
              <li><a href="#" className="text-gray-500 hover:text-[#ff758f] transition-colors">สำหรับสายปาร์ตี้</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-black text-gray-900 mb-6">ติดต่อเรา</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#ff758f] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span className="text-gray-500 text-sm">666/66 หมู่ที่ 5 ต.นาเกลือ อ.บางละมุง จ.ชลบุรี 20150</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#ff758f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span className="text-gray-500 text-sm">080-123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#ff758f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span className="text-gray-500 text-sm">support@villadd.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Villa DD By suvapat jhaturuhsombun. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link href="/privacy-policy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
