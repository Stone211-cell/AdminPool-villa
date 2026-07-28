"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "./I18nProvider";

export function Navbar() {
  const { lang, setLang, t } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-3xl font-black tracking-tighter text-[#1f2937]">
                <span className="text-[#5b51fb]">V</span>ILLA DD
              </div>
            </Link>
          </div>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-sm font-semibold text-gray-700 hover:text-[#5b51fb] transition-colors">{t("home")}</Link>
            <Link href="#" className="text-sm font-semibold text-gray-400 hover:text-[#5b51fb] transition-colors">{t("article")}</Link>
            <Link href="/contact" className="text-sm font-semibold text-gray-400 hover:text-[#5b51fb] transition-colors">{t("contact")}</Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            
            {/* Language Selector */}
            <div className="relative" ref={langRef}>
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

              {/* Dropdown Menu */}
              {langOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <button 
                    onClick={() => { setLang("th"); setLangOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-bold transition-colors ${lang === "th" ? "bg-blue-50/50 text-[#5b51fb]" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_Thailand.svg" alt="TH" className="w-5 h-5 rounded-full object-cover" />
                    TH
                  </button>
                  <button 
                    onClick={() => { setLang("en"); setLangOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-bold transition-colors ${lang === "en" ? "bg-blue-50/50 text-[#5b51fb]" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg" alt="EN" className="w-5 h-5 rounded-full object-cover" />
                    EN
                  </button>
                </div>
              )}
            </div>

            {/* Post Home Button */}
            <Link href="#" className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              <span className="text-sm font-bold text-gray-700">{t("list_house")}</span>
            </Link>

            {/* Login Button */}
            <Link href="/sign-in" className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              <span className="text-sm font-bold text-gray-700">{t("login")}</span>
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
}
