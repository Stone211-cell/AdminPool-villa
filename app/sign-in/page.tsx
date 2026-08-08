"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex w-full bg-white font-sans text-gray-800">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 bg-gradient-to-br from-[#ffdde1] to-[#ee9ca7] relative overflow-hidden">
        
        {/* Animated Water Waves SVG */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-50 translate-y-2">
          <svg className="w-full h-auto min-h-[300px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
              <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g className="animate-[wave_10s_linear_infinite]">
              <use href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
            </g>
            <g className="animate-[wave_14s_linear_infinite_reverse]">
              <use href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
            </g>
            <g className="animate-[wave_20s_linear_infinite]">
              <use href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
            </g>
            <g className="animate-[wave_12s_linear_infinite_reverse]">
              <use href="#gentle-wave" x="48" y="7" fill="#ffffff" />
            </g>
          </svg>
        </div>

        {/* Global keyframes for wave (need to be in a style tag if not in tailwind config) */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes wave {
            0% { transform: translate3d(-90px,0,0); }
            100% { transform: translate3d(85px,0,0); }
          }
        `}} />

        <div className="z-10 text-white drop-shadow-md">
          <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">
            เข้าสู่ระบบ<br/>
            <span className="text-white text-6xl">BAITONG</span><br/>
            POOL VILLA
          </h1>
          <p className="text-white/90 max-w-sm mt-8 leading-relaxed font-medium">
            แพลตฟอร์มรับลงบ้านพักพูลวิลล่าพัทยา สัตหีบ สะดวก ปลอดภัย จองง่าย ได้บ้านชัวร์
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 sm:px-20 lg:px-32 bg-gray-50 relative">
        <SignIn 
          appearance={{
            elements: {
              card: "shadow-none border-none bg-transparent w-full",
              rootBox: "w-full max-w-md",
              formButtonPrimary: "bg-[#ff758f] hover:bg-[#ff5c77] text-white font-bold transition-colors shadow-lg shadow-pink-500/30",
              footerActionLink: "text-[#ff758f] hover:text-[#ff5c77]"
            }
          }}
        />

        {/* Floating Policy box at bottom */}
        <div className="absolute bottom-8 left-8 right-8 lg:left-32 lg:right-32 bg-white text-gray-600 p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100 hidden md:flex">
          <p className="text-xs sm:text-sm max-w-[80%] leading-relaxed">
            เว็บไซต์นี้ใช้คุกกี้ เราใช้คุกกี้เพื่อให้ท่านได้รับประสบการณ์การใช้งานที่ดีที่สุด โปรดศึกษาเพิ่มเติมที่ <a href="#" className="underline font-semibold text-[#ff758f]">นโยบายความเป็นส่วนตัว</a>
          </p>
          <button className="bg-[#ff758f] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-[#ff5c77] transition-colors">
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
}
