import { type NextRequest, NextResponse } from "next/server"
import { getParkingLotById } from "@/lib/database/parking-lots"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const parkingLot = await getParkingLotById(params.id)

    if (!parkingLot) {
      return NextResponse.json({ error: "Parking lot not found" }, { status: 404 })
    }

    return NextResponse.json(parkingLot)
  } catch (error) {
    console.error("Failed to fetch parking lot:", error)
    return NextResponse.json({ error: "Failed to fetch parking lot" }, { status: 500 })
  }
}
