"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AdminArticlesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if admin
  const isAdmin = user?.publicMetadata?.isAdmin === true;

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push("/");
    } else if (isAdmin) {
      fetchArticles();
    }
  }, [isLoaded, isAdmin, router]);

  const fetchArticles = async () => {
    try {
      const { data } = await axios.get("/api/articles");
      setArticles(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/articles", { title, content, imageUrl });
      setTitle("");
      setContent("");
      setImageUrl("");
      fetchArticles();
    } catch (e) {
      alert("Error creating article");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axios.delete(`/api/articles/${id}`);
      fetchArticles();
    } catch (e) {
      alert("Error deleting article");
    }
  };

  if (!isLoaded || !isAdmin) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
        <h1 className="text-3xl font-black mb-8">จัดการบทความ (Admin)</h1>
        
        <form onSubmit={handleCreate} className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-200 space-y-4">
          <h2 className="text-xl font-bold">เขียนบทความใหม่</h2>
          <div>
            <label className="block text-sm font-bold mb-1">หัวข้อ</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 border rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">เนื้อหา</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} required className="w-full px-4 py-2 border rounded-xl min-h-[150px]" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">ลิงก์รูปภาพ (ไม่บังคับ)</label>
            <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-blue-700">
            {loading ? "กำลังบันทึก..." : "บันทึกบทความ"}
          </button>
        </form>

        <div>
          <h2 className="text-xl font-bold mb-4">บทความทั้งหมด</h2>
          <div className="space-y-4">
            {articles.map(a => (
              <div key={a.id} className="flex justify-between items-center bg-white border rounded-xl p-4 shadow-sm">
                <div>
                  <h3 className="font-bold text-lg">{a.title}</h3>
                  <p className="text-sm text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleDelete(a.id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100">
                  ลบ
                </button>
              </div>
            ))}
            {articles.length === 0 && <p className="text-gray-500">ยังไม่มีบทความ</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
