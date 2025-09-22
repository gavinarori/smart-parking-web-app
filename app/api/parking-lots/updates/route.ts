import type { NextRequest } from "next/server"
import { getAllParkingLots, updateSlotStatus } from "@/lib/database/parking-lots"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  // Set up Server-Sent Events
  const encoder = new TextEncoder()

  const customReadable = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: "connected", message: "Real-time updates connected" })}\n\n`
      controller.enqueue(encoder.encode(data))

      // Simulate real-time parking updates
      const interval = setInterval(async () => {
        try {
          // Get current parking lots
          const parkingLots = await getAllParkingLots()

          // Simulate random slot status changes
          const updates = []

          for (const lot of parkingLots) {
            // Randomly select 1-3 slots to update
            const slotsToUpdate = Math.floor(Math.random() * 3) + 1
            const randomSlots = lot.slots.sort(() => 0.5 - Math.random()).slice(0, slotsToUpdate)

            for (const slot of randomSlots) {
              // Randomly change status
              const statuses = ["available", "occupied", "reserved"]
              const currentIndex = statuses.indexOf(slot.status)
              const newStatus = statuses[(currentIndex + 1) % statuses.length]

              // Update in database
              await updateSlotStatus(lot.id, slot.id, newStatus as any)

              updates.push({
                lotId: lot.id,
                slotId: slot.id,
                oldStatus: slot.status,
                newStatus,
                timestamp: new Date().toISOString(),
              })
            }
          }

          if (updates.length > 0) {
            const data = `data: ${JSON.stringify({ type: "slot_updates", updates })}\n\n`
            controller.enqueue(encoder.encode(data))
          }
        } catch (error) {
          console.error("Error in real-time updates:", error)
          const errorData = `data: ${JSON.stringify({ type: "error", message: "Update failed" })}\n\n`
          controller.enqueue(encoder.encode(errorData))
        }
      }, 10000) // Update every 10 seconds

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
