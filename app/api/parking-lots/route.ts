import { NextResponse } from "next/server"
import { getAllParkingLots } from "@/lib/database/parking-lots"

export async function GET() {
  try {
    const parkingLots = await getAllParkingLots()
    return NextResponse.json(parkingLots)
  } catch (error) {
    console.error("Failed to fetch parking lots:", error)
    return NextResponse.json({ error: "Failed to fetch parking lots" }, { status: 500 })
  }
}
