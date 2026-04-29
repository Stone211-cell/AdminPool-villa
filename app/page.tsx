// app/page.tsx
import { AvailabilityPage } from "@/components/AvailabilityPage";

export const metadata = {
  title: "พูลวิลล่าพัทยา | บ้านพักพร้อมสระว่ายน้ำส่วนตัว",
  description: "ค้นหาบ้านพักพูลวิลล่าพัทยาที่ว่างตามวันที่คุณต้องการ",
};

export default function HomePage() {
  return <AvailabilityPage />;
}