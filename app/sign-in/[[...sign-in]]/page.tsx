"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex w-full bg-white font-sans text-gray-800">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 bg-gradient-to-br from-[#ffdde1] to-[#ee9ca7] relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-50 translate-y-2">
          <svg className="w-full h-auto min-h-[300px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs><path id="gwave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" /></defs>
            <g className="animate-[wave_10s_linear_infinite]"><use href="#gwave" x="48" y="0" fill="rgba(255,255,255,0.7)" /></g>
            <g className="animate-[wave_14s_linear_infinite_reverse]"><use href="#gwave" x="48" y="3" fill="rgba(255,255,255,0.5)" /></g>
            <g className="animate-[wave_20s_linear_infinite]"><use href="#gwave" x="48" y="5" fill="rgba(255,255,255,0.3)" /></g>
            <g className="animate-[wave_12s_linear_infinite_reverse]"><use href="#gwave" x="48" y="7" fill="#ffffff" /></g>
          </svg>
        </div>
        <style dangerouslySetInnerHTML={{__html:`@keyframes wave{0%{transform:translate3d(-90px,0,0)}100%{transform:translate3d(85px,0,0)}}`}} />
        <div className="z-10 text-white drop-shadow-md">
          <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">
            เข้าสู่ระบบ<br/>
            <span className="text-6xl">BAITONG</span><br/>
            POOL VILLA
          </h1>
          <p className="text-white/90 max-w-sm mt-8 leading-relaxed font-medium">
            แพลตฟอร์มรับลงบ้านพักพูลวิลล่าพัทยา สัตหีบ สะดวก ปลอดภัย จองง่าย ได้บ้านชัวร์
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-8 bg-white relative min-h-screen">
        <SignIn
          appearance={{
            elements: {
              card: "shadow-none border-none bg-transparent p-0 w-full max-w-md",
              rootBox: "w-full max-w-md",
              header: "hidden",
              formButtonPrimary: "bg-[#ff758f] hover:bg-[#ff5c77] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-pink-500/30 text-sm",
              formFieldInput: "border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#ff758f] focus:border-transparent transition-all",
              formFieldLabel: "text-sm font-bold text-gray-700",
              socialButtonsBlockButton: "border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors",
              dividerLine: "bg-gray-100",
              dividerText: "text-gray-400 text-xs font-semibold tracking-widest uppercase",
              footerActionLink: "text-[#ff758f] hover:text-[#ff5c77] font-semibold",
              footerActionText: "text-gray-500",
              otpCodeFieldInput: "border border-gray-200 rounded-xl text-center font-black text-lg",
            },
            variables: {
              colorPrimary: "#ff758f",
              borderRadius: "0.75rem",
              fontFamily: "inherit",
              fontSize: "0.875rem",
            },
          }}
        />
        <div className="absolute bottom-8 left-8 right-8 lg:left-16 lg:right-16 bg-[#ff758f] text-white p-4 rounded-xl flex items-center justify-between shadow-xl">
          <p className="text-xs sm:text-sm max-w-[80%] leading-relaxed">
            เว็บไซต์นี้ใช้คุกกี้เพื่อให้ท่านได้รับประสบการณ์การใช้งานที่ดีที่สุด
          </p>
          <button className="bg-white text-[#ff758f] px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-pink-50 transition-colors whitespace-nowrap ml-2">
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
}
