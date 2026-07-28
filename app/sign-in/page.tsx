"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn() as any;
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // start the sign In process.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        console.log(result);
        setError("กรุณายืนยันตัวตนเพิ่มเติม");
      }
    } catch (err: any) {
      console.error("error", err.errors[0]?.longMessage);
      setError(err.errors[0]?.longMessage || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleOAuth = (provider: "oauth_google" | "oauth_facebook") => {
    if (!isLoaded) return;
    signIn.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  return (
    <div className="min-h-screen flex w-full bg-white font-sans text-gray-800">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 bg-gradient-to-br from-[#fff5f8] to-[#ffffff] relative overflow-hidden">
        {/* Subtle background waves/curves could go here */}
        <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle at -20% 50%, #ffe4e8 0%, transparent 50%)"
        }}></div>
        <div className="z-10">
          <h1 className="text-5xl font-black mb-4 tracking-tight">
            เข้าสู่ระบบ<br/>
            <span className="text-[#ff758f]">POOL VILLA</span>
          </h1>
          <p className="text-gray-500 max-w-sm mt-8 leading-relaxed">
            แพลตฟอร์มรับลงบ้านพักพูลวิลล่าให้เช่า ตามไลฟ์สไตล์ ที่คุณว่าใช่ สะดวก ปลอดภัย ปิดดีลสบายๆ กับ POOL VILLA คุณจะได้อะไรที่มากกว่า
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-20 lg:px-32 bg-white relative">
        {error && (
          <div className="mb-4 text-red-500 text-sm font-semibold bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">อีเมล</label>
            <input
              type="email"
              placeholder="กรุณากรอกอีเมล"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff758f] focus:border-transparent transition-all"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">รหัสผ่าน</label>
            <div className="relative">
              <input
                type="password"
                placeholder="กรุณากรอกรหัสผ่าน"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff758f] focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-[#ff758f] rounded border-gray-300 focus:ring-[#ff758f]" />
              <span className="text-sm text-gray-600">จดจำฉัน</span>
            </label>
            <a href="#" className="text-sm text-gray-800 font-semibold hover:text-[#ff758f]">
              ลืมรหัสผ่าน?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-[#ff758f] hover:bg-[#ff5c77] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-pink-500/30"
          >
            เข้าสู่ระบบ
          </button>
          
          <div className="flex gap-4 mt-6">
            <button 
              type="button"
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line" className="w-5 h-5" />
              เข้าสู่ระบบผ่าน Line
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("oauth_google")}
              className="w-12 flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("oauth_facebook")}
              className="w-12 flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Floating Policy box at bottom */}
        <div className="absolute bottom-8 left-8 right-8 lg:left-32 lg:right-32 bg-[#ff758f] text-white p-4 rounded-xl flex items-center justify-between shadow-xl">
          <p className="text-xs sm:text-sm max-w-[80%] leading-relaxed">
            เว็บไซต์นี้ใช้คุกกี้ เราใช้คุกกี้เพื่อให้ท่านได้รับประสบการณ์การใช้งานที่ดีที่สุดบนเว็บไซต์ของเรา โปรดศึกษาเพิ่มเติมที่ <a href="#" className="underline font-semibold">นโยบายความเป็นส่วนตัว</a> และ <a href="#" className="underline font-semibold">ข้อกำหนดและเงื่อนไขการใช้บริการ</a>
          </p>
          <button className="bg-white text-[#ff758f] px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-pink-50 transition-colors">
            ยอมรับ
          </button>
        </div>
      </div>
    </div>
  );
}
