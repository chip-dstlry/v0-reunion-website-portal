import { NextRequest, NextResponse } from "next/server"
import { appendSubmission } from "@/lib/google-sheets"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { submittedBy, classmateName, type, email, phone, notes } = body

    if (!classmateName || !type) {
      return NextResponse.json({ error: "classmateName and type are required" }, { status: 400 })
    }

    if (!["contact_info", "deceased_report"].includes(type)) {
      return NextResponse.json({ error: "Invalid submission type" }, { status: 400 })
    }

    await appendSubmission({ submittedBy, classmateName, type, email, phone, notes })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/submit] Error:", err)
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 })
  }
}
