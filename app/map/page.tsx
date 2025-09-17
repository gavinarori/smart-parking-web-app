"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GoogleMap } from "@/components/google-map"
import { RealTimeUpdates } from "@/components/real-time-updates"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { mockParkingLots } from "@/lib/mock-data"
import type { ParkingLot, ParkingSlot } from "@/lib/types"
import { MapPin } from "lucide-react"

export default function MapPage() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>(mockParkingLots)
  const [selectedLot, setSelectedLot] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
  const [showSlots, setShowSlots] = useState(false)
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const router = useRouter()

  const selectedLotData = selectedLot ? parkingLots.find((lot) => lot.id === selectedLot) : null

  const handleRealTimeUpdate = (updates: { lotId: string; slots: ParkingSlot[] }[]) => {
    setParkingLots((prevLots) => {
      return prevLots.map((lot) => {
        const update = updates.find((u) => u.lotId === lot.id)
        if (!update) return lot

        const updatedSlots = lot.slots.map((slot) => {
          const updatedSlot = update.slots.find((s) => s.id === slot.id)
          return updatedSlot || slot
        })

        // Recalculate lot statistics
        const available = updatedSlots.filter((s) => s.status === "available").length
        const occupied = updatedSlots.filter((s) => s.status === "occupied").length
        const reserved = updatedSlots.filter((s) => s.status === "reserved").length

        return {
          ...lot,
          slots: updatedSlots,
          availableSlots: available,
          occupiedSlots: occupied,
          reservedSlots: reserved,
        }
      })
    })
  }

  const handleLotSelect = (lotId: string) => {
    setSelectedLot(lotId)
    setSelectedSlot(null)
  }

  const handleSlotSelect = (slot: ParkingSlot) => {
    setSelectedSlot(slot)
  }

  const handleReserveSlot = () => {
    if (selectedSlot && selectedLot) {
      router.push(`/reserve?lotId=${selectedLot}&slotId=${selectedSlot.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map Section */}
          <div className="flex-1">
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-primary">Parking Map</h1>
                  <p className="text-muted-foreground">Real-time parking availability across the city</p>
                </div>
                <div className="flex items-center gap-4">
                  <RealTimeUpdates onUpdate={handleRealTimeUpdate} isActive={realTimeEnabled} />
                  <div className="flex items-center space-x-2">
                    <Switch id="realtime" checked={realTimeEnabled} onCheckedChange={setRealTimeEnabled} />
                    <Label htmlFor="realtime" className="text-sm">
                      Live updates
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-slots"
                        checked={showSlots}
                        onCheckedChange={setShowSlots}
                        disabled={!selectedLot}
                      />
                      <Label htmlFor="show-slots" className="text-sm">
                        Show individual slots
                      </Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-secondary"></div>
                      <span>Reserved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive"></div>
                      <span>Occupied</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <GoogleMap
              parkingLots={parkingLots}
              selectedLot={selectedLot}
              onLotSelect={handleLotSelect}
              onSlotSelect={handleSlotSelect}
              showSlots={showSlots}
              className="w-full h-[600px] rounded-lg border"
            />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            {selectedLotData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {selectedLotData.name}
                  </CardTitle>
                  <CardDescription>{selectedLotData.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">{selectedLotData.availableSlots}</div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-destructive">{selectedLotData.occupiedSlots}</div>
                      <div className="text-xs text-muted-foreground">Occupied</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-secondary">{selectedLotData.reservedSlots}</div>
                      <div className="text-xs text-muted-foreground">Reserved</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Price per hour:</span>
                      <span className="font-semibold">${selectedLotData.pricePerHour}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Operating hours:</span>
                      <span className="font-semibold">
                        {selectedLotData.operatingHours.open} - {selectedLotData.operatingHours.close}
                      </span>
                    </div>
                  </div>

                  <Button onClick={() => router.push(`/parking/${selectedLotData.id}`)} className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            )}

            {selectedSlot && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Selected Slot</CardTitle>
                  <CardDescription>Slot {selectedSlot.number}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={selectedSlot.status === "available" ? "default" : "secondary"}>
                        {selectedSlot.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Last updated:</span>
                      <span className="text-sm">{selectedSlot.lastUpdated.toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {selectedSlot.status === "available" && (
                    <Button onClick={handleReserveSlot} className="w-full">
                      Reserve This Slot
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total lots:</span>
                  <span className="font-semibold">{parkingLots.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available spots:</span>
                  <span className="font-semibold text-primary">
                    {parkingLots.reduce((sum, lot) => sum + lot.availableSlots, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average price:</span>
                  <span className="font-semibold">
                    ${(parkingLots.reduce((sum, lot) => sum + lot.pricePerHour, 0) / parkingLots.length).toFixed(2)}/hr
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
