import { Navbar } from "@/components/Navbar";
import { LineRichMenu } from "@/components/LineRichMenu";

export const metadata = {
  title: "ติดต่อเรา | Villa DD",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fe] font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <h1 className="text-4xl font-black text-gray-900 mb-8 border-b pb-4">ติดต่อเรา</h1>

        <div className="grid md:grid-cols-2 gap-12 mt-8">
          {/* Left Column: Contact Details */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-[#5b51fb]">บริษัท โก มอร์ ฮับ จำกัด</h2>
            
            <div className="flex items-start gap-4 text-gray-600 font-semibold">
              <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <p>666/66 หมู่ที่ 5 ตำบลนาเกลือ อำเภอบางละมุง จังหวัดชลบุรี 20150</p>
            </div>

            <div className="flex items-center gap-4 text-gray-600 font-semibold">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <p>Villa DD - วิลล่าดีดี By Go More Hub</p>
            </div>

            <div className="flex items-center gap-4 text-gray-600 font-semibold">
              <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center flex-shrink-0">
                 <span className="font-black text-sm">🎵</span>
              </div>
              <p>Go More Hub</p>
            </div>

            <div className="flex items-center gap-4 text-gray-600 font-semibold">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 flex-shrink-0">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </div>
              <p>@VillaDD</p>
            </div>

            <div className="flex items-center gap-4 text-gray-600 font-semibold">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 flex-shrink-0">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <p>support@villadd.com</p>
            </div>
          </div>

          {/* Right Column: Map Placeholder */}
          <div className="bg-gray-100 rounded-2xl min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-300">
             <p className="text-gray-400 font-bold">พื้นที่สำหรับแสดง Google Maps</p>
          </div>
        </div>

      </main>

      <LineRichMenu />
    </div>
  );
}
