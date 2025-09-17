import { type NextRequest, NextResponse } from "next/server"
import { updateSlotStatus } from "@/lib/database/parking-lots"
import { verifyToken } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string; slotId: string } }) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { status, reservedUntil } = await request.json()

    if (!["available", "occupied", "reserved"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const success = await updateSlotStatus(
      params.id,
      params.slotId,
      status,
      status === "reserved" ? user.id : undefined,
      status === "reserved" && reservedUntil ? new Date(reservedUntil) : undefined,
    )

    if (!success) {
      return NextResponse.json({ error: "Failed to update slot" }, { status: 404 })
    }

    return NextResponse.json({ message: "Slot updated successfully" })
  } catch (error) {
    console.error("Failed to update slot:", error)
    return NextResponse.json({ error: "Failed to update slot" }, { status: 500 })
  }
}
