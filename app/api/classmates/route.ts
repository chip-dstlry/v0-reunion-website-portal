import { NextResponse } from "next/server"
import { getClassmates, computeStats } from "@/lib/google-sheets"

export const revalidate = 60 // ISR — refresh every 60 seconds

export async function GET() {
  try {
    const classmates = await getClassmates()
    const stats = computeStats(classmates)
    return NextResponse.json({ classmates, stats })
  } catch (err) {
    console.error("[api/classmates] Failed to fetch:", err)
    return NextResponse.json({ error: "Failed to load classmates" }, { status: 500 })
  }
}
