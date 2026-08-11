"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminArticlesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Check if admin
  const isAdmin = user?.publicMetadata?.isAdmin === true;

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    if (!isAdmin) {
      toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
      router.push("/");
    } else {
      fetchArticles();
    }
  }, [isLoaded, isAdmin, router, user]);

  const fetchArticles = async () => {
    try {
      const { data } = await axios.get("/api/articles");
      setArticles(data);
    } catch (e) {
      console.error(e);
      toast.error("ดึงข้อมูลบทความล้มเหลว");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("files", file);

    try {
      const res = await axios.post("/api/admin/upload", formData);
      if (res.data.urls && res.data.urls.length > 0) {
        setImageUrl(res.data.urls[0]);
        toast.success("อัปโหลดรูปภาพสำเร็จ!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`อัปโหลดรูปภาพล้มเหลว: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.patch(`/api/articles/${editingId}`, { title, content, imageUrl });
        toast.success("อัปเดตบทความสำเร็จ!");
      } else {
        await axios.post("/api/articles", { title, content, imageUrl });
        toast.success("สร้างบทความใหม่สำเร็จ!");
      }
      resetForm();
      fetchArticles();
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article: any) => {
    setEditingId(article.id);
    setTitle(article.title);
    setContent(article.content);
    setImageUrl(article.imageUrl || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้?")) return;
    try {
      await axios.delete(`/api/articles/${id}`);
      toast.success("ลบบทความสำเร็จ!");
      window.location.reload();
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการลบ");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setImageUrl("");
  };

  if (!isLoaded || !isAdmin) return <div className="p-8 text-center font-bold text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200">
        <h1 className="text-3xl font-black mb-8 text-gray-900">จัดการบทความ (Admin)</h1>

        <form onSubmit={handleSubmit} className="bg-purple-50/50 p-6 rounded-2xl mb-12 border border-purple-100 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-purple-900">{editingId ? "แก้ไขบทความ" : "เขียนบทความใหม่"}</h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-sm font-bold text-gray-500 hover:text-gray-700">ยกเลิกการแก้ไข</button>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-gray-700">หัวข้อ <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="ตั้งชื่อบทความที่น่าสนใจ..." />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-gray-700">เนื้อหา <span className="text-red-500">*</span></label>
            <textarea value={content} onChange={e => setContent(e.target.value)} required className="w-full px-4 py-3 border border-gray-200 rounded-xl min-h-[200px] focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="พิมพ์เนื้อหาที่นี่..." />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-gray-700">รูปภาพหน้าปก (ไม่บังคับ)</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {imageUrl && (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageUrl("")} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 shadow-md">✕</button>
                </div>
              )}
              <div className="flex-1 w-full">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploadingImage}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all cursor-pointer" 
                />
                <p className="text-xs text-gray-500 mt-2 font-medium">รองรับ JPG, PNG, WEBP (อัปโหลดแล้วรูปจะถูกอัปขึ้นระบบอัตโนมัติ)</p>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading || uploadingImage} className="w-full sm:w-auto bg-purple-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? "กำลังบันทึก..." : uploadingImage ? "กำลังอัปโหลดรูป..." : (editingId ? "อัปเดตบทความ" : "เผยแพร่บทความ")}
          </button>
        </form>

        <div>
          <h2 className="text-2xl font-black mb-6 text-gray-900">บทความทั้งหมด ({articles.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map(a => (
              <div key={a.id} className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {a.imageUrl && (
                  <img src={a.imageUrl} alt={a.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{a.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">{a.content}</p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-400">{new Date(a.createdAt).toLocaleDateString('th-TH')}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(a)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-100 text-sm transition-colors">แก้ไข</button>
                      <button onClick={() => handleDelete(a.id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 text-sm transition-colors">ลบ</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {articles.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                <p className="text-gray-500 font-semibold">ยังไม่มีบทความในระบบ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
