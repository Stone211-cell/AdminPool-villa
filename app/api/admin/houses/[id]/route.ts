import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return null;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.publicMetadata?.isAdmin === true ? userId : null;
}

// GET /api/admin/houses/[id]
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdmin();
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const house = await prisma.house.findUnique({
      where: { hId: id },
      include: { detail: true, basePrices: true },
    });
    if (!house) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(house);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PATCH /api/admin/houses/[id] — update house + detail + basePrice
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdmin();
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const {
      name, description, hZone, hBedroom, hToilet, price, people,
      images, swim, wifi, grill, pet, karaoke, jacuzzi, snooker, discotech,
      slider, billard, swimmingKid, bath, category, isPublished, isActive, manualOverride,
      checkin, checkout, extra, insurance, peopleMax, location, parking,
      kitchen, fullDescription, amenities, nearbyPlaces, rules, mapUrl,
      alert, bedroomDetail,
      priceSun, priceMon, priceTue, priceWed, priceThu, priceFri, priceSat,
    } = body;

    // Update house
    const house = await prisma.house.update({
      where: { hId: id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(hZone !== undefined && { hZone }),
        ...(hBedroom !== undefined && { hBedroom: Number(hBedroom) }),
        ...(hToilet !== undefined && { hToilet: Number(hToilet) }),
        ...(price !== undefined && { price: Number(price) }),
        ...(people !== undefined && { people: Number(people) }),
        ...(images !== undefined && { images }),
        ...(swim !== undefined && { swim }),
        ...(wifi !== undefined && { wifi: !!wifi }),
        ...(grill !== undefined && { grill: !!grill }),
        ...(pet !== undefined && { pet: !!pet }),
        ...(karaoke !== undefined && { karaoke: !!karaoke }),
        ...(jacuzzi !== undefined && { jacuzzi: !!jacuzzi }),
        ...(snooker !== undefined && { snooker: !!snooker }),
        ...(discotech !== undefined && { discotech: !!discotech }),
        ...(slider !== undefined && { slider: !!slider }),
        ...(billard !== undefined && { billard: !!billard }),
        ...(swimmingKid !== undefined && { swimmingKid: !!swimmingKid }),
        ...(bath !== undefined && { bath: !!bath }),
        ...(category !== undefined && { category }),
        ...(isPublished !== undefined && { isPublished: !!isPublished }),
        ...(isActive !== undefined && { isActive: !!isActive }),
        ...(manualOverride !== undefined && { manualOverride: !!manualOverride }),
      },
    });

    // Upsert detail
    const detailData: any = {};
    if (checkin !== undefined) detailData.checkin = checkin;
    if (checkout !== undefined) detailData.checkout = checkout;
    if (extra !== undefined) detailData.extra = Number(extra);
    if (insurance !== undefined) detailData.insurance = Number(insurance);
    if (peopleMax !== undefined) detailData.peopleMax = Number(peopleMax);
    if (location !== undefined) detailData.location = location;
    if (parking !== undefined) detailData.parking = parking;
    if (kitchen !== undefined) detailData.kitchen = kitchen;
    if (fullDescription !== undefined) detailData.fullDescription = fullDescription;
    if (amenities !== undefined) detailData.amenities = amenities;
    if (nearbyPlaces !== undefined) detailData.nearbyPlaces = nearbyPlaces;
    if (rules !== undefined) detailData.rules = rules;
    if (mapUrl !== undefined) detailData.mapUrl = mapUrl;
    if (alert !== undefined) detailData.alert = alert;
    if (bedroomDetail !== undefined) detailData.bedroomDetail = bedroomDetail;

    if (Object.keys(detailData).length > 0) {
      await prisma.houseDetail.upsert({
        where: { houseId: id },
        update: detailData,
        create: { houseId: id, ...detailData },
      });
    }

    // Upsert base prices
    const priceData: any = {};
    if (priceSun !== undefined) priceData.priceSun = Number(priceSun);
    if (priceMon !== undefined) priceData.priceMon = Number(priceMon);
    if (priceTue !== undefined) priceData.priceTue = Number(priceTue);
    if (priceWed !== undefined) priceData.priceWed = Number(priceWed);
    if (priceThu !== undefined) priceData.priceThu = Number(priceThu);
    if (priceFri !== undefined) priceData.priceFri = Number(priceFri);
    if (priceSat !== undefined) priceData.priceSat = Number(priceSat);

    if (Object.keys(priceData).length > 0) {
      await prisma.basePrice.upsert({
        where: { houseId: id },
        update: priceData,
        create: { houseId: id, ...priceData },
      });
    }

    const updated = await prisma.house.findUnique({
      where: { hId: id },
      include: { detail: true, basePrices: true },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to update" }, { status: 500 });
  }
}

// DELETE /api/admin/houses/[id]
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdmin();
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    // Delete related records first
    await prisma.houseDetail.deleteMany({ where: { houseId: id } });
    await prisma.basePrice.deleteMany({ where: { houseId: id } });
    await prisma.holiday.deleteMany({ where: { houseId: id } });
    await prisma.booking.deleteMany({ where: { houseId: id } });
    await prisma.house.delete({ where: { hId: id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete" }, { status: 500 });
  }
}
