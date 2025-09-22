"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SlotGrid } from "@/components/slot-grid"
import { mockParkingLots } from "@/lib/mock-data"
import type { ParkingLot, ParkingSlot } from "@/lib/types"
import { ArrowLeft, MapPin, Clock, DollarSign, Car } from "lucide-react"

export default function ParkingLotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [lot, setLot] = useState<ParkingLot | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)

  useEffect(() => {
    const foundLot = mockParkingLots.find((l) => l.id === params.lotId)
    setLot(foundLot || null)
  }, [params.lotId])

  const handleSlotSelect = (slot: ParkingSlot) => {
    setSelectedSlot(slot)
  }

  const handleReserve = () => {
    if (selectedSlot) {
      router.push(`/reserve?lotId=${lot?.id}&slotId=${selectedSlot.id}`)
    }
  }

  if (!lot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Parking lot not found.</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => router.back()} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">{lot.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {lot.address}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{lot.availableSlots}</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-destructive">{lot.occupiedSlots}</div>
                  <div className="text-sm text-muted-foreground">Occupied</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">{lot.reservedSlots}</div>
                  <div className="text-sm text-muted-foreground">Reserved</div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(lot.availableSlots / lot.totalSlots) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lot.operatingHours.open} - {lot.operatingHours.close}
              </div>
              <div className="text-sm text-muted-foreground">Operating hours</div>
              <Badge variant="outline" className="mt-4 text-primary border-primary">
                Open Now
              </Badge>
            </CardContent>
          </Card>
        </div>

        <SlotGrid slots={lot.slots} onSlotSelect={handleSlotSelect} />

        {selectedSlot && (
          <Card className="mt-6 border-primary">
            <CardHeader>
              <CardTitle>Selected Slot: {selectedSlot.number}</CardTitle>
              <CardDescription>Ready to reserve this parking spot?</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Location: {lot.name} - Slot {selectedSlot.number}
                </p>
                <p className="text-sm text-muted-foreground">Rate: ${lot.pricePerHour}/hour</p>
              </div>
              <Button onClick={handleReserve} size="lg">
                Reserve This Slot
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
