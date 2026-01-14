"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SlotGrid } from "@/components/slot-grid"
import { ParkingSatellitePreview } from "@/lib/parking-satellite-preview"
import type { ParkingLot, ParkingSlot } from "@/lib/types"
import { ArrowLeft, MapPin, Clock, Car } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"

export default function ParkingLotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [lot, setLot] = useState<ParkingLot | null>(null)
  const [slots, setSlots] = useState<ParkingSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
  const [loading, setLoading] = useState(true)

  const wsRef = useRef<WebSocket | null>(null)

  // ---------------- LOAD LOT ----------------
  useEffect(() => {
    const fetchLot = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:4000/api/lots/${params.lotId}`)
        const data = await res.json()

        setLot(data)
        setSlots(
          data.slots.map((slot: any) => ({
            ...slot,
            number: slot.slotId.split("-").pop(),
          }))
        )
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchLot()
  }, [params.lotId])

  // ---------------- WEBSOCKET ----------------
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000")
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", lotId: params.lotId }))
    }

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data)

      if (payload.lotId !== params.lotId) return

      if (payload.type === "lot-update") {
        setLot((prev) => ({ ...prev!, ...payload.data }))
      }

      if (
        payload.type === "slot-update" ||
        payload.type === "reservation-update" ||
        payload.type === "occupancy-update"
      ) {
        setSlots((prev) =>
          prev.map((s) =>
            s.slotId === payload.data.slotId
              ? { ...s, ...payload.data, number: payload.data.slotId.split("-").pop() }
              : s
          )
        )
      }
    }

    return () => ws.close()
  }, [params.lotId])

  // ---------------- SLOT SELECT ----------------
  const handleSlotSelect = (slot: ParkingSlot) => {
    if (slot.occupied || slot.reserved) return
    setSelectedSlot(slot)
  }

  // ---------------- RESERVE ----------------
  const handleReserve = async () => {
    if (!selectedSlot || !user) return

    const res = await fetch("http://localhost:4000/api/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotId: selectedSlot.slotId,
        userId: user.id,
        rfidTag: user.rfidTag,
      }),
    })

    const data = await res.json()
    if (data.success) setSelectedSlot(null)
    else alert(data.error)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => router.back()} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>

          <div>
            <h1 className="text-3xl font-bold">{lot?.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {lot?.address}
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" /> Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{lot?.availableSlots}</div>
                <div className="text-sm">Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-destructive">{lot?.occupiedSlots}</div>
                <div className="text-sm">Occupied</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">{lot?.reservedSlots}</div>
                <div className="text-sm">Reserved</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lot?.operatingHours.open} - {lot?.operatingHours.close}
              <Badge className="mt-3">{lot?.isOpen ? "Open" : "Closed"}</Badge>
            </CardContent>
          </Card>
        </div>

        {/* 🛰 SATELLITE VIEW (NEW, SAFE) */}
        <div className="mb-6">
          <ParkingSatellitePreview lat={-0.3983732} lng={36.960898} />
          <p className="text-xs text-muted-foreground mt-2">
            Satellite view of parking layout
          </p>
        </div>

        {/* SLOTS (UNCHANGED LOGIC) */}
        <SlotGrid slots={slots} onSlotSelect={handleSlotSelect} />

        {/* RESERVE */}
        {selectedSlot && (
          <Card className="mt-6 border-primary">
            <CardHeader>
              <CardTitle>Slot {selectedSlot.number}</CardTitle>
              <CardDescription>Ready to reserve?</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between">
              
              <Button onClick={handleReserve}>Reserve</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
