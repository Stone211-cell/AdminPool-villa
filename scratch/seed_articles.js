const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  console.log("Connected to database");

  // Insert 3 mock articles
  const articles = [
    {
      id: "art-01",
      title: "ทริปพัทยา 2 วัน 1 คืนสุดคุ้ม: พักผ่อนให้เต็มที่ในงบที่สบาย",
      content: "สัมผัสประสบการณ์การพักผ่อนแบบส่วนตัวในพูลวิลล่าสุดหรู พร้อมกิจกรรมมากมาย ไม่ว่าจะเป็นปิ้งย่างริมสระน้ำ ร้องคาราโอเกะ หรือปาร์ตี้กับกลุ่มเพื่อน...",
      imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop",
      published: true
    },
    {
      id: "art-02",
      title: "สายปาร์ตี้ต้องรู้! เลือกพูลวิลล่ายังไงให้มันส์ได้เต็มที่",
      content: "สายปาร์ตี้ห้ามพลาด! เทคนิคเลือกและจองพูลวิลล่าให้มันส์เต็มพิกัด ทั้งเรื่องการใช้เสียง ระบบเครื่องเสียง และพื้นที่ทำกิจกรรม...",
      imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop",
      published: true
    },
    {
      id: "art-03",
      title: "5 บ้านพูลวิลล่าพัทยาติดทะเล วิวหลักล้าน",
      content: "รวมพูลวิลล่าพัทยาที่มองเห็นวิวทะเลแบบพาโนรามา ตื่นมาดูพระอาทิตย์ขึ้นจากเตียง พร้อมสระว่ายน้ำส่วนตัว...",
      imageUrl: "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?q=80&w=800&auto=format&fit=crop",
      published: true
    }
  ];

  for (const art of articles) {
    await client.query(
      `INSERT INTO articles (id, title, content, image_url, published) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, image_url = EXCLUDED.image_url`,
      [art.id, art.title, art.content, art.imageUrl, art.published]
    );
  }

  console.log("Seeded 3 articles");
  await client.end();
}

main().catch(console.error);
