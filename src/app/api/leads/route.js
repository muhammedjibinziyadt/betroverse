import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAllLeads, addLead } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leads = await getAllLeads();
  return NextResponse.json({ leads });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const saved = await addLead(body);
    return NextResponse.json({ success: true, lead: saved });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
