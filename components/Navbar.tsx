"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "./I18nProvider";

export function Navbar() {
  const { lang, setLang, t } = useTranslation();
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      {/* Bank Account Banner */}
      <div className="bg-gradient-to-r from-[#1a6b3a] to-[#22913d] text-white py-2 px-4 text-center text-xs font-bold relative z-50">
        <button
          onClick={() => setBankOpen(!bankOpen)}
          className="flex items-center justify-center gap-2 mx-auto hover:opacity-80 transition-opacity"
        >
          <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span className="text-yellow-300">⚠️ โปรดตรวจสอบบัญชีรับโอนทุกครั้ง</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline text-white">กสิกรไทย: <span className="text-yellow-300 font-black tracking-widest">004-8-15411-5</span> ชื่อ: <span className="text-yellow-300">จิราภัทร สุทัศน์</span></span>
          <svg className={`w-4 h-4 transition-transform ${bankOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
        </button>

        {bankOpen && (
          <div className="mt-2 bg-white text-gray-800 rounded-2xl shadow-2xl p-4 max-w-sm mx-auto border-2 border-yellow-400">
            <p className="text-xs text-red-600 font-black mb-3 flex items-center gap-1">
              <span>⚠️</span> ป้องกันการโกง: ตรวจสอบชื่อและเลขบัญชีก่อนโอนทุกครั้ง!
            </p>
            <div className="bg-green-50 rounded-xl p-3 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">กส.</div>
                <div>
                  <p className="text-xs text-gray-500">ธนาคารกสิกรไทย (KBANK)</p>
                  <p className="font-black text-lg text-gray-900 tracking-widest">004-8-15411-5</p>
                </div>
              </div>
              <div className="border-t border-green-200 pt-2">
                <p className="text-xs text-gray-500">ชื่อบัญชี</p>
                <p className="font-bold text-gray-900">จิราภัทร สุทัศน์</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">หากมีข้อสงสัยติดต่อ LINE: @villadd</p>
          </div>
        )}
      </div>

      <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-3">
                <img src="/logo.jpg" alt="Baitong Poolvilla" className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover shadow-sm" />
                <div>
                  <p className="text-sm md:text-base font-black tracking-tight text-[#1f2937] leading-none">BAITONG POOLVILLA</p>
                  <p className="text-[10px] md:text-xs text-[#ff758f] font-semibold">บ้านพักพูลวิลล่าพัทยา สัตหีบ</p>
                </div>
              </Link>
            </div>

            {/* Center Links (Desktop) */}
            <div className="hidden md:flex space-x-8">
              <Link href="/" className={`text-sm font-semibold transition-colors ${pathname === "/" ? "text-[#1f2937]" : "text-gray-400 hover:text-[#ff758f]"}`}>{t("home")}</Link>
              <Link href="/articles" className={`text-sm font-semibold transition-colors ${pathname.startsWith("/articles") ? "text-[#1f2937]" : "text-gray-400 hover:text-[#ff758f]"}`}>{t("article")}</Link>
              <Link href="/contact" className={`text-sm font-semibold transition-colors ${pathname === "/contact" ? "text-[#1f2937]" : "text-gray-400 hover:text-[#ff758f]"}`}>{t("contact")}</Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4">

              {/* Language Selector (Desktop) */}
              <div className="hidden md:block relative" ref={langRef}>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={lang === "th" ? "https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_Thailand.svg" : "https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg"}
                    alt={lang}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-sm font-bold text-gray-700 uppercase">{lang}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                {langOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <button onClick={() => { setLang("th"); setLangOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-bold transition-colors ${lang === "th" ? "bg-blue-50/50 text-[#5b51fb]" : "text-gray-700 hover:bg-gray-50"}`}>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_Thailand.svg" alt="TH" className="w-5 h-5 rounded-full object-cover" />
                      TH
                    </button>
                    <button onClick={() => { setLang("en"); setLangOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-bold transition-colors ${lang === "en" ? "bg-blue-50/50 text-[#5b51fb]" : "text-gray-700 hover:bg-gray-50"}`}>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg" alt="EN" className="w-5 h-5 rounded-full object-cover" />
                      EN
                    </button>
                  </div>
                )}
              </div>

              {/* Login Button (Desktop) */}
              <Link href="/sign-in" className="hidden md:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <span className="text-sm font-bold text-gray-700">{t("login")}</span>
              </Link>

              {/* Hamburger (Mobile) */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors gap-1.5"
                aria-label="เมนู"
              >
                <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-screen border-t border-gray-100" : "max-h-0"}`}>
          <div className="px-4 py-4 bg-white flex flex-col gap-1">
            <Link href="/" className={`px-4 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-3 ${pathname === "/" ? "bg-pink-50 text-[#ff758f]" : "text-gray-700 hover:bg-gray-50"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              {t("home")}
            </Link>
            <Link href="/articles" className={`px-4 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-3 ${pathname.startsWith("/articles") ? "bg-pink-50 text-[#ff758f]" : "text-gray-700 hover:bg-gray-50"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v12a2 2 0 01-2 2z"/></svg>
              {t("article")}
            </Link>
            <Link href="/contact" className={`px-4 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-3 ${pathname === "/contact" ? "bg-pink-50 text-[#ff758f]" : "text-gray-700 hover:bg-gray-50"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              {t("contact")}
            </Link>
            <Link href="/sign-in" className="px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              {t("login")}
            </Link>

            {/* Bank Account in Mobile Menu */}
            <div className="mt-2 bg-green-50 rounded-xl p-3 border border-green-200">
              <p className="text-[10px] text-red-600 font-black mb-1">⚠️ ตรวจสอบบัญชีก่อนโอนทุกครั้ง!</p>
              <p className="text-xs font-black text-gray-700">กสิกรไทย: <span className="text-green-700 tracking-widest">004-8-15411-5</span></p>
              <p className="text-xs text-gray-600">ชื่อ: <span className="font-bold">จิราภัทร สุทัศน์</span></p>
            </div>

            {/* Language toggle in mobile */}
            <div className="flex gap-2 mt-1 px-4">
              <button onClick={() => setLang("th")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${lang === "th" ? "bg-pink-100 text-[#ff758f]" : "bg-gray-100 text-gray-600"}`}>🇹🇭 TH</button>
              <button onClick={() => setLang("en")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${lang === "en" ? "bg-pink-100 text-[#ff758f]" : "bg-gray-100 text-gray-600"}`}>🇬🇧 EN</button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
