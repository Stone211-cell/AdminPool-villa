import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export const metadata = {
  title: "ติดต่อเรา | Baitong Poolvilla",
  description: "ติดต่อบ้านพักพูลวิลล่าใบตอง พัทยา สัตหีบ LINE @baitongpoolvilla",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fe] font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <h1 className="text-4xl font-black text-gray-900 mb-2 border-b pb-4">ติดต่อเรา</h1>
        <p className="text-gray-500 mb-10">ยินดีต้อนรับทุกคำถามและการจอง — ติดต่อเราได้ตลอด 24 ชม.</p>

        <div className="grid md:grid-cols-2 gap-12 mt-4">
          {/* Left Column: Contact Details */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-[#ff758f]">Baitong Poolvilla</h2>
            <p className="text-gray-600 -mt-4 font-semibold">จิราภัทร สุทัศน์ ณ อยุธยา</p>

            {/* Address */}
            <a
              href="https://maps.app.goo.gl/UwV3tVGGWJjXKujJ7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 text-gray-600 font-semibold hover:text-[#ff758f] transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#ff758f] flex-shrink-0 group-hover:bg-[#ff758f] group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <div>
                <p>59/75 สุขุมวิท 89 ซ.หนองหิน5</p>
                <p>หมู่บ้านบ้านสวยไม้งาม</p>
                <p className="text-xs text-[#ff758f] mt-1">📍 คลิกเพื่อดูแผนที่ Google Maps</p>
              </div>
            </a>

            {/* Facebook Page */}
            <a
              href="https://web.facebook.com/profile.php?id=61556499615942"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 text-gray-600 font-semibold hover:text-blue-600 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </div>
              <div>
                <p>เพจ Facebook </p>
                <p className="text-xs text-gray-400">บ้านพักพูลวิลล่าพัทยา สัตหีบราคาถูก By.Baitong Pool Villa</p>
              </div>
            </a>

            {/* Facebook Personal */}
            <a
              href="https://web.facebook.com/jirapat.sutudnaayutthaya?locale=th_TH"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 text-gray-600 font-semibold hover:text-blue-600 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a3 3 0 110 6 3 3 0 010-6zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 01-6 3.22z" /></svg>
              </div>
              <div>
                <p>Facebook ส่วนตัว</p>
                <p className="text-xs text-gray-400">จิราภัทร สุทัศน์ ณ อยุธยา</p>
              </div>
            </a>

            {/* LINE */}
            <a
              href="https://line.me/R/ti/p/@baitongpoolvilla"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 text-gray-600 font-semibold hover:text-[#00B900] transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-[#00B900] flex-shrink-0 group-hover:bg-[#00B900] group-hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.04.792.019 1.077l-.145.894c-.035.21-.163.805.706.438.869-.367 4.697-2.766 6.945-5.132 2.309-2.427 3.382-4.996 3.382-7.477z" /></svg>
              </div>
              <div>
                <p>LINE Official</p>
                <p className="text-xs text-gray-400">@baitongpoolvilla</p>
              </div>
            </a>
          </div>

          {/* Right Column: Google Maps Embed */}
          <div className="rounded-2xl overflow-hidden shadow-lg min-h-[400px] border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3905.3!2d100.9!3d12.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU0JzAwLjAiTiAxMDDCsDU0JzAwLjAiRQ!5e0!3m2!1sth!2sth!4v1000000000000!5m2!1sth!2sth"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "400px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Baitong Poolvilla Location"
            />
          </div>
        </div>
        <div>
          <a
            href="tel:0935622211"
            rel="noopener noreferrer"
            className="flex items-center gap-4 text-gray-600 font-semibold hover:text-[#00B900] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-[#00B900] flex-shrink-0 group-hover:bg-[#00B900] group-hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.04.792.019 1.077l-.145.894c-.035.21-.163.805.706.438.869-.367 4.697-2.766 6.945-5.132 2.309-2.427 3.382-4.996 3.382-7.477z" /></svg>
            </div>
            <div>
              <p>เบอร์โทรศัพท์</p>
              <p className="text-xs text-gray-400">093-562-2211</p>
            </div>
          </a>
        </div>


      </main >
    </div >
  );
}
