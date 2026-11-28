import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAllBrands, saveAllBrands, deleteBrandById } from "@/lib/db";

export async function GET() {
  try {
    const brands = await getAllBrands();
    return NextResponse.json({ brands, count: brands.length });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const list = Array.isArray(body) ? body : body.brands;
    if (!Array.isArray(list)) {
      return NextResponse.json({ error: "Brands array required" }, { status: 400 });
    }
    const saved = await saveAllBrands(list);
    return NextResponse.json({ success: true, brands: saved });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to save brands" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Brand ID required" }, { status: 400 });
    }
    await deleteBrandById(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to delete brand" },
      { status: 500 }
    );
  }
}
