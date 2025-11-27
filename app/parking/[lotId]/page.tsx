"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SlotGrid } from "@/components/slot-grid"
import type { ParkingLot, ParkingSlot } from "@/lib/types"
import { ArrowLeft, MapPin, Clock, Car } from "lucide-react"

export default function ParkingLotDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [lot, setLot] = useState<ParkingLot | null>(null)
  const [slots, setSlots] = useState<ParkingSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLot = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:4000/api/lots/${params.lotId}`)
        const data = await res.json()

        setLot(data)

        // Map slots to include number property
        const mappedSlots = data.slots.map((slot: any) => ({
          ...slot,
          number: slot.slotId.split('-').pop(), // Extract S01, S02, etc.
        }))
        setSlots(mappedSlots)
      } catch (error) {
        console.error("Error loading lot:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLot()
  }, [params.lotId])

  console.log(lot);
  const handleSlotSelect = (slot: ParkingSlot) => {
    if (slot.status !== "available") return
    setSelectedSlot(slot)
  }

  const handleReserve = async () => {
    if (!selectedSlot) return

    try {
      const res = await fetch("http://localhost:4000/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.slotId,
          userId: "user-123",
        }),
      })

      const data = await res.json()

      if (data.success) {
        alert("Slot reserved successfully!")

        // Refresh slots
        const updated = await fetch(`http://localhost:4000/api/lots/${params.lotId}`)
        const fullData = await updated.json()
        setLot(fullData.lot)
        setSlots(fullData.slots.map((slot: any) => ({
          ...slot,
          number: slot.slotId.split('-').pop()
        })))
        setSelectedSlot(null)
      } else {
        alert(data.error || "Failed to reserve slot")
      }
    } catch (error) {
      console.error("Reservation error:", error)
      alert("Reservation failed")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading parking lot...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => router.back()} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-primary">{lot?.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {lot?.address}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Availability Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" /> Availability
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{lot?.availableSlots}</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-destructive">{lot?.occupiedSlots}</div>
                  <div className="text-sm text-muted-foreground">Occupied</div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-secondary">{lot?.reservedSlots}</div>
                  <div className="text-sm text-muted-foreground">Reserved</div>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full"
                  style={{ width: `${lot ? (lot.availableSlots / lot.totalSlots) * 100 : 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Hours
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">
                {lot?.operatingHours.open} - {lot?.operatingHours.close}
              </div>
              <div className="text-sm text-muted-foreground">Operating Hours</div>

              <Badge variant="outline" className="mt-4 text-primary border-primary">
                {lot?.isOpen ? "Open Now" : "Closed"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Slot Grid */}
        <SlotGrid slots={slots} onSlotSelect={handleSlotSelect} />

        {/* Selected Slot */}
        {selectedSlot && (
          <Card className="mt-6 border-primary">
            <CardHeader>
              <CardTitle>Selected Slot: {selectedSlot.number}</CardTitle>
              <CardDescription>Ready to reserve this parking spot?</CardDescription>
            </CardHeader>

            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Location: {lot?.name} — Slot {selectedSlot.number}
                </p>
                <p className="text-sm text-muted-foreground">
                  Rate: ${lot?.pricePerHour}/hour
                </p>
              </div>

              <Button size="lg" onClick={handleReserve}>
                Reserve This Slot
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
