"use client";

import { useEffect, useState, useCallback } from "react";
import { resolveHouseImage } from "@/lib/utils/image";

// ---- Types ----
type LiffProfile = { userId: string; displayName: string; pictureUrl?: string };
type House = {
  hId: string; price: number; hBedroom: number; hToilet: number;
  people: number; imgName: string; swim: string;
  dayStatus?: "free" | "booked" | "waiting" | "repair" | "holiday" | "hotpro";
  basePrices?: { priceSun: number; priceMon: number; priceTue: number; priceWed: number; priceThu: number; priceFri: number; priceSat: number }[];
};
type Step = "loading" | "select-room" | "fill-info" | "confirm" | "success" | "error";

const LIFF_ID = "2010963994-FoimQnXy";

// คำนวณราคาตามวัน
function calcNightPrice(bp: House["basePrices"], checkIn: Date, checkOut: Date): number {
  if (!bp || bp.length === 0) return 0;
  const keys = ["priceSun","priceMon","priceTue","priceWed","priceThu","priceFri","priceSat"] as const;
  let total = 0;
  const cur = new Date(checkIn);
  while (cur < checkOut) {
    total += bp[0][keys[cur.getDay()]] || 0;
    cur.setDate(cur.getDate() + 1);
  }
  return total;
}

function formatPrice(n: number) {
  return n.toLocaleString("th-TH");
}

function formatDate(d: Date) {
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getNights(ci: Date, co: Date) {
  return Math.max(0, Math.round((co.getTime() - ci.getTime()) / 86400000));
}

// ---- Liff SDK lazy loader ----
async function loadLiff() {
  const liff = (await import("@line/liff")).default;
  return liff;
}

export default function LiffPage() {
  const [step, setStep] = useState<Step>("loading");
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [savedUser, setSavedUser] = useState<any>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [checkIn, setCheckIn] = useState<string>(() => toISODate(new Date()));
  const [checkOut, setCheckOut] = useState<string>(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); return toISODate(d);
  });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [liffReady, setLiffReady] = useState(false);
  const [liffInstance, setLiffInstance] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingHouses, setLoadingHouses] = useState(false);

  // Init LIFF
  useEffect(() => {
    loadLiff().then(async (liff) => {
      try {
        await liff.init({ liffId: LIFF_ID });
        setLiffInstance(liff);
        setLiffReady(true);

        if (liff.isLoggedIn()) {
          const p = await liff.getProfile();
          setProfile({ userId: p.userId, displayName: p.displayName, pictureUrl: p.pictureUrl });

          // บันทึก profile + ดึงข้อมูลที่เคยกรอกไว้
          await fetch("/api/liff/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lineUserId: p.userId, displayName: p.displayName, pictureUrl: p.pictureUrl }),
          });

          const meRes = await fetch(`/api/liff/me?lineUserId=${p.userId}`);
          const meData = await meRes.json();
          if (meData.user) {
            setSavedUser(meData.user);
            // Pre-fill form ด้วยข้อมูลที่เคยกรอกไว้
            if (meData.user.firstName) setFirstName(meData.user.firstName);
            if (meData.user.lastName) setLastName(meData.user.lastName);
            if (meData.user.phone) setPhone(meData.user.phone);
          }
        } else {
          liff.login();
          return;
        }
      } catch (e: any) {
        console.error("LIFF init error:", e);
        // Dev mode fallback — ถ้าเปิดบนเบราว์เซอร์ปกติ (ไม่ใช่ LINE)
        setProfile({ userId: "dev-user", displayName: "ทดสอบระบบ", pictureUrl: undefined });
      }
      setStep("select-room");
    });
  }, []);

  // โหลดรายการห้อง
  const fetchHouses = useCallback(async () => {
    setLoadingHouses(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (checkIn) params.set("date", checkIn);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/availability?${params}`);
      const data = await res.json();
      setHouses(data.houses || []);
    } catch (e) {
      console.error("fetch houses error:", e);
    } finally {
      setLoadingHouses(false);
    }
  }, [checkIn, searchQuery]);

  useEffect(() => {
    if (step === "select-room") fetchHouses();
  }, [step, fetchHouses]);

  const nights = getNights(new Date(checkIn), new Date(checkOut));
  const totalPrice = selectedHouse
    ? (calcNightPrice(selectedHouse.basePrices, new Date(checkIn), new Date(checkOut)) || selectedHouse.price * nights)
    : 0;

  // ---- Submit booking ----
  async function handleSubmit() {
    if (!profile || !selectedHouse) return;
    if (!phone.trim()) { setError("กรุณากรอกเบอร์โทรศัพท์"); return; }
    if (nights <= 0) { setError("กรุณาเลือกวันที่ให้ถูกต้อง"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/liff/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineUserId: profile.userId,
          houseId: selectedHouse.hId,
          checkIn: new Date(checkIn).toISOString(),
          checkOut: new Date(checkOut).toISOString(),
          guests,
          firstName,
          lastName,
          phone,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");
      setBookingResult(data.booking);
      setStep("success");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ---- Styles ----
  const styles = {
    wrap: { minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", fontFamily: "'Prompt', 'Noto Sans Thai', sans-serif", color: "#fff" } as const,
    card: { background: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.12)", padding: 20 } as const,
  };

  // ---- Loading ----
  if (step === "loading") return (
    <div style={{ ...styles.wrap, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏡</div>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Poolvilla By Baitong</div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>กำลังโหลด...</div>
      <div style={{ marginTop: 24, width: 40, height: 40, border: "3px solid rgba(255,255,255,0.3)", borderTop: "3px solid #7c8ef7", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ---- Step 1: Select Room ----
  if (step === "select-room") return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", padding: "16px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {profile?.pictureUrl && <img src={profile.pictureUrl} alt="" style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #7c8ef7" }} />}
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>🏡 จองพูลวิลล่า</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{profile?.displayName}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* วันที่ */}
        <div style={{ ...styles.card, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#7c8ef7" }}>📅 เลือกวันที่พัก</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 4 }}>เช็คอิน</label>
              <input type="date" value={checkIn} min={toISODate(new Date())}
                onChange={e => { setCheckIn(e.target.value); if (e.target.value >= checkOut) { const d = new Date(e.target.value); d.setDate(d.getDate()+1); setCheckOut(toISODate(d)); } }}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(124,142,247,0.4)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 4 }}>เช็คเอาท์</label>
              <input type="date" value={checkOut} min={checkIn}
                onChange={e => setCheckOut(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(124,142,247,0.4)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, boxSizing: "border-box" }} />
            </div>
          </div>
          {nights > 0 && <div style={{ textAlign: "center", marginTop: 10, fontSize: 13, color: "#7c8ef7" }}>🌙 {nights} คืน</div>}
        </div>

        {/* ค้นหา */}
        <div style={{ marginBottom: 16, position: "relative" }}>
          <input placeholder="🔍 ค้นหาห้อง (เช่น 2866)" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, boxSizing: "border-box" }} />
        </div>

        {/* รายการห้อง */}
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "rgba(255,255,255,0.8)" }}>
          {loadingHouses ? "⏳ กำลังโหลด..." : `🏠 ${houses.length} ห้องว่าง`}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {houses.filter(h => h.dayStatus !== "booked" && h.dayStatus !== "repair").map(h => {
            const price = h.basePrices?.[0]
              ? calcNightPrice(h.basePrices, new Date(checkIn), new Date(checkOut)) / Math.max(nights, 1)
              : h.price;
            const imgUrl = resolveHouseImage(h.imgName);

            return (
              <div key={h.hId} onClick={() => { setSelectedHouse(h); setStep("fill-info"); }}
                style={{ ...styles.card, cursor: "pointer", display: "flex", gap: 14, alignItems: "center",
                  border: "1px solid rgba(124,142,247,0.25)", transition: "all 0.2s",
                  ...(h.dayStatus === "waiting" ? { borderColor: "rgba(255,193,7,0.4)" } : {}) }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.1)" }}>
                  {h.imgName && <img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as any).style.display = "none"; }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>CITY-{h.hId}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
                    🛏 {h.hBedroom} ห้องนอน · 🚿 {h.hToilet} ห้องน้ำ · 👥 สูงสุด {h.people} ท่าน
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#7c8ef7" }}>฿{formatPrice(price)}<span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>/คืน</span></div>
                    {h.dayStatus === "waiting" && <span style={{ fontSize: 11, background: "rgba(255,193,7,0.2)", color: "#ffc107", padding: "2px 8px", borderRadius: 20 }}>รอยืนยัน</span>}
                    {h.dayStatus === "free" && <span style={{ fontSize: 11, background: "rgba(76,175,80,0.2)", color: "#4caf50", padding: "2px 8px", borderRadius: 20 }}>ว่าง ✓</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {!loadingHouses && houses.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.4)" }}>ไม่พบห้องว่างในวันที่เลือก</div>
          )}
        </div>
      </div>
    </div>
  );

  // ---- Step 2: Fill Info ----
  if (step === "fill-info") return (
    <div style={styles.wrap}>
      <div style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setStep("select-room")} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", padding: 0 }}>←</button>
        <div style={{ fontSize: 16, fontWeight: 700 }}>📝 กรอกข้อมูล</div>
      </div>

      <div style={{ padding: 16 }}>
        {/* สรุปห้องที่เลือก */}
        {selectedHouse && (
          <div style={{ ...styles.card, marginBottom: 20, display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,0.1)", flexShrink: 0 }}>
              {selectedHouse.imgName && <img src={resolveHouseImage(selectedHouse.imgName)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as any).style.display = "none"; }} />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>CITY-{selectedHouse.hId}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{formatDate(new Date(checkIn))} → {formatDate(new Date(checkOut))}</div>
              <div style={{ fontSize: 14, color: "#7c8ef7", fontWeight: 600, marginTop: 4 }}>🌙 {nights} คืน · ฿{formatPrice(totalPrice)}</div>
            </div>
          </div>
        )}

        {/* Form */}
        <div style={{ ...styles.card, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#7c8ef7" }}>👤 ข้อมูลผู้จอง</div>

          {savedUser && savedUser.firstName && (
            <div style={{ background: "rgba(124,142,247,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
              ✨ เติมข้อมูลจากการจองครั้งก่อนให้อัตโนมัติ
            </div>
          )}

          <InputField label="ชื่อ" value={firstName} onChange={setFirstName} placeholder="ชื่อ" />
          <InputField label="นามสกุล" value={lastName} onChange={setLastName} placeholder="นามสกุล" />
          <InputField label="เบอร์โทรศัพท์ *" value={phone} onChange={setPhone} placeholder="0xx-xxx-xxxx" type="tel" required />

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>จำนวนแขก</label>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button onClick={() => setGuests(g => Math.max(1, g-1))} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 20, cursor: "pointer" }}>−</button>
              <span style={{ fontSize: 20, fontWeight: 700 }}>{guests}</span>
              <button onClick={() => setGuests(g => Math.min(selectedHouse?.people || 20, g+1))} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 20, cursor: "pointer" }}>+</button>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>ท่าน (สูงสุด {selectedHouse?.people || "?"} ท่าน)</span>
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>หมายเหตุ (ถ้ามี)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="เช่น ต้องการเตียงเสริม, มาพร้อมสัตว์เลี้ยง..." rows={3}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, resize: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        {error && <div style={{ background: "rgba(231,76,60,0.2)", border: "1px solid rgba(231,76,60,0.4)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 14, color: "#ff6b6b" }}>⚠️ {error}</div>}

        <button onClick={() => { if (!phone.trim()) { setError("กรุณากรอกเบอร์โทรศัพท์"); return; } setError(""); setStep("confirm"); }}
          style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          ถัดไป → สรุปการจอง
        </button>
      </div>
    </div>
  );

  // ---- Step 3: Confirm ----
  if (step === "confirm") return (
    <div style={styles.wrap}>
      <div style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setStep("fill-info")} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", padding: 0 }}>←</button>
        <div style={{ fontSize: 16, fontWeight: 700 }}>✅ ยืนยันการจอง</div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ ...styles.card, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#7c8ef7", marginBottom: 16, textAlign: "center" }}>📋 สรุปคำขอจอง</div>

          <Row label="🏠 ห้อง" value={`CITY-${selectedHouse?.hId}`} large />
          <Row label="📅 เช็คอิน" value={formatDate(new Date(checkIn)) + " (14:00 น.)"} />
          <Row label="📅 เช็คเอาท์" value={formatDate(new Date(checkOut)) + " (12:00 น.)"} />
          <Row label="🌙 จำนวนคืน" value={`${nights} คืน`} />
          <Row label="👥 จำนวนแขก" value={`${guests} ท่าน`} />

          <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "12px 0" }} />

          <Row label="👤 ชื่อ" value={`${firstName} ${lastName}`.trim() || "-"} />
          <Row label="📞 เบอร์โทร" value={phone} />

          <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "12px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>ราคารวม (ประมาณ)</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#7c8ef7" }}>฿{formatPrice(totalPrice)}</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "right" }}>* ราคาอาจเปลี่ยนแปลง กรุณาติดต่อแอดมินเพื่อยืนยัน</div>
        </div>

        <div style={{ ...styles.card, marginBottom: 20, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
          📱 เมื่อกดยืนยัน ระบบจะส่งการ์ดสรุปการจองเข้า LINE ของคุณ เพื่อให้แอดมินติดต่อกลับภายใน 24 ชั่วโมง
        </div>

        {error && <div style={{ background: "rgba(231,76,60,0.2)", border: "1px solid rgba(231,76,60,0.4)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 14, color: "#ff6b6b" }}>⚠️ {error}</div>}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "18px", borderRadius: 14, border: "none", background: loading ? "rgba(255,255,255,0.2)" : "linear-gradient(135deg, #4caf50, #2e7d32)", color: "#fff", fontSize: 17, fontWeight: 800, cursor: loading ? "default" : "pointer", transition: "all 0.2s" }}>
          {loading ? "⏳ กำลังส่งคำขอ..." : "📤 ส่งคำขอจอง"}
        </button>
      </div>
    </div>
  );

  // ---- Step: Success ----
  if (step === "success") return (
    <div style={{ ...styles.wrap, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 16, animation: "pop 0.5s ease" }}>🎉</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>ส่งคำขอจองสำเร็จ!</div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 32, lineHeight: 1.7 }}>
        แอดมินจะติดต่อกลับภายใน 24 ชั่วโมง<br/>
        กรุณาตรวจสอบการ์ดสรุปใน LINE ของคุณ
      </div>
      <div style={{ ...styles.card, width: "100%", maxWidth: 320, marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>หมายเลขคำขอ</div>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>{bookingResult?.id?.slice(-8).toUpperCase()}</div>
      </div>
      <button onClick={() => { setStep("select-room"); setSelectedHouse(null); setNotes(""); }}
        style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
        🏡 จองห้องอื่น
      </button>
      <style>{`@keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }`}</style>
    </div>
  );

  return null;
}

// ---- Helper components ----
function InputField({ label, value, onChange, placeholder, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, boxSizing: "border-box", outline: "none" }} />
    </div>
  );
}

function Row({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0" }}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{label}</span>
      <span style={{ fontSize: large ? 16 : 14, fontWeight: large ? 700 : 500 }}>{value}</span>
    </div>
  );
}
