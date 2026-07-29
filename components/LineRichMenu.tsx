"use client";

export function LineRichMenu() {
  return (
    <a 
      href="/line-qr.jpg" 
      target="_blank" 
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 group flex flex-col items-center hover:-translate-y-1 transition-transform"
    >
      <div className="relative">
        <img 
          src="/logo.jpg" 
          alt="Contact" 
          className="w-16 h-16 rounded-full border-2 border-white shadow-lg object-cover"
        />
        <div className="absolute -top-1 -right-1 flex gap-1">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
        </div>
      </div>
      <div className="mt-2 bg-[#00B900] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-1">
        <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" className="w-4 h-4 brightness-0 invert" alt="LINE" />
        สอบถาม
      </div>
    </a>
  );
}
