"use client";
import * as React from "react";

export function MobileDrawer({ open, onClose, children }: {
  open: boolean; onClose: () => void; children: React.ReactNode;
}) {
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <div className={`fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] bg-[#0f0f12] border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="font-semibold text-sm text-white">ค้นหาและกรอง</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#a1a1aa] hover:text-white transition-colors text-base">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </>
  );
}
