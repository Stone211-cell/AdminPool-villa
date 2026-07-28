import { Navbar } from "@/components/Navbar";
import { LineRichMenu } from "@/components/LineRichMenu";

export const metadata = {
  title: "ติดต่อเรา | Villa DD",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fe] font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100 text-center relative overflow-hidden">
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <h1 className="text-4xl font-black text-gray-900 mb-4 relative z-10">ติดต่อเรา</h1>
          <p className="text-gray-500 mb-12 relative z-10">
            หากมีข้อสงสัยเกี่ยวกับการจองที่พัก หรือต้องการร่วมงานกับเรา สามารถติดต่อได้ตามช่องทางด้านล่างนี้
          </p>

          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <a href="https://lin.ee/placeholder" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-8 rounded-3xl bg-[#00B900]/10 border border-[#00B900]/20 hover:bg-[#00B900]/20 transition group">
              <div className="w-16 h-16 rounded-full bg-[#00B900] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" className="w-8 h-8 brightness-0 invert" alt="LINE" />
              </div>
              <h3 className="text-xl font-bold text-[#00B900] mb-2">LINE Official Account</h3>
              <p className="text-sm text-gray-600 font-semibold">@villadd (มี @ ด้านหน้า)</p>
            </a>

            <a href="tel:0801234567" className="flex flex-col items-center justify-center p-8 rounded-3xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition group">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-blue-500 mb-2">เบอร์โทรศัพท์</h3>
              <p className="text-sm text-gray-600 font-semibold">080-123-4567 (เวลาทำการ)</p>
            </a>
          </div>

        </div>

      </main>

      <LineRichMenu />
    </div>
  );
}
