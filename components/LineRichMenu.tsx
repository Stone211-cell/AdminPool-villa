"use client";

import Link from "next/link";

export function LineRichMenu() {
  return (
    <div className="fixed bottom-[110px] lg:bottom-6 right-4 lg:right-6 z-50 animate-bounce-slow">
      <Link 
        href="https://line.me/R/ti/p/@baitongpoolvilla" 
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white p-1 rounded-full shadow-2xl hover:scale-110 transition-transform hover:shadow-pink-200/50"
      >
        <img 
          src="/cute-chat.png" 
          alt="Contact Line" 
          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full border-4 border-[#06c755]"
        />
      </Link>
    </div>
  );
}
