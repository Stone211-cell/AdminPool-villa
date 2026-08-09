"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const isAdmin = user?.publicMetadata?.isAdmin === true;

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/sign-in"); return; }
    if (!isAdmin) { router.push("/"); return; }
  }, [isLoaded, isAdmin, user, router]);

  if (!isLoaded || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const adminMenus = [
    {
      href: "/admin/houses",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      ),
      title: "จัดการบ้านพัก",
      desc: "ตั้งค่า Manual Override, หมวดหมู่ และ Sync ปฏิทิน",
      color: "from-purple-500 to-purple-700",
      badge: "Houses",
    },
    {
      href: "/admin/articles",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v12a2 2 0 01-2 2z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20v-5H7v5M7 4v4h7"/>
        </svg>
      ),
      title: "จัดการบทความ",
      desc: "เพิ่ม แก้ไข และลบบทความของเว็บไซต์",
      color: "from-blue-500 to-blue-700",
      badge: "Articles",
    },
    {
      href: "/",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
        </svg>
      ),
      title: "ดูเว็บไซต์",
      desc: "ดูหน้าเว็บไซต์ที่ลูกค้าเห็น",
      color: "from-green-500 to-green-700",
      badge: "Preview",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">🏠 Baitong Pool Villa</h1>
            <p className="text-sm text-gray-500 mt-0.5">ระบบจัดการหลังบ้าน (Admin Dashboard)</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-700">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</p>
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-black px-2 py-0.5 rounded-full">👑 Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6 sm:p-8">
        <div className="mb-8">
          <h2 className="text-xl font-black text-gray-800 mb-1">เมนูหลัก</h2>
          <p className="text-sm text-gray-500">เลือกหัวข้อที่ต้องการจัดการ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className={`bg-gradient-to-br ${menu.color} p-6 text-white`}>
                {menu.icon}
              </div>
              <div className="p-5">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{menu.badge}</span>
                <h3 className="text-lg font-black text-gray-900 mt-1 mb-1 group-hover:text-purple-700 transition-colors">{menu.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{menu.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
