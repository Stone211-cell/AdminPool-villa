import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return null;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.publicMetadata?.isAdmin === true ? userId : null;
}

// GET /api/admin/houses — all houses with details
export async function GET() {
  try {
    const adminId = await requireAdmin();
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const houses = await prisma.house.findMany({
      orderBy: { createdAt: "desc" },
      include: { detail: true, basePrices: true },
    });
    return NextResponse.json(houses);
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// POST /api/admin/houses — create new house
export async function POST(req: Request) {
  try {
    const adminId = await requireAdmin();
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      hId, name, description, hZone, hBedroom, hToilet, price, people,
      images, swim, wifi, grill, pet, karaoke, jacuzzi, snooker, discotech,
      slider, billard, swimmingKid, bath, category, isPublished, isActive,
      // detail fields
      checkin, checkout, extra, insurance, peopleMax, location, parking,
      kitchen, fullDescription, amenities, nearbyPlaces, rules, mapUrl,
      alert, bedroomDetail,
      // pricing
      priceSun, priceMon, priceTue, priceWed, priceThu, priceFri, priceSat,
    } = body;

    if (!hId || !hBedroom || !price) {
      return NextResponse.json({ error: "Missing required fields (hId, hBedroom, price)" }, { status: 400 });
    }

    const house = await prisma.house.create({
      data: {
        hId, name: name || "", description: description || "",
        hZone: hZone || "pattaya", hBedroom: Number(hBedroom),
        hToilet: Number(hToilet) || 1, price: Number(price),
        people: Number(people) || 1, images: images || [],
        swim: swim || "chlorine", wifi: !!wifi, grill: !!grill, pet: !!pet,
        karaoke: !!karaoke, jacuzzi: !!jacuzzi, snooker: !!snooker,
        discotech: !!discotech, slider: !!slider, billard: !!billard,
        swimmingKid: !!swimmingKid, bath: !!bath,
        category: category || "NORMAL",
        isPublished: isPublished !== false,
        isActive: isActive !== false,
        manualOverride: true, // manually created = always manual
        detail: {
          create: {
            checkin: checkin || "14:00", checkout: checkout || "12:00",
            extra: Number(extra) || 0, insurance: Number(insurance) || 0,
            peopleMax: Number(peopleMax) || Number(people) || 1,
            location: location || "", parking: parking || "",
            kitchen: kitchen || "", fullDescription: fullDescription || "",
            amenities: amenities || [], nearbyPlaces: nearbyPlaces || "",
            rules: rules || "", mapUrl: mapUrl || "",
            alert: alert || "", bedroomDetail: bedroomDetail || "",
          },
        },
        basePrices: {
          create: {
            priceSun: Number(priceSun) || Number(price) || 0,
            priceMon: Number(priceMon) || Number(price) || 0,
            priceTue: Number(priceTue) || Number(price) || 0,
            priceWed: Number(priceWed) || Number(price) || 0,
            priceThu: Number(priceThu) || Number(price) || 0,
            priceFri: Number(priceFri) || Number(price) || 0,
            priceSat: Number(priceSat) || Number(price) || 0,
          },
        },
      },
      include: { detail: true, basePrices: true },
    });

    return NextResponse.json(house, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to create house" }, { status: 500 });
  }
}
