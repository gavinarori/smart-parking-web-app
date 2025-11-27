"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ParkingSlot } from "@/lib/types"
import { Car, Clock } from "lucide-react"

interface SlotGridProps {
  slots: ParkingSlot[]
  onSlotSelect: (slot: ParkingSlot) => void
}

export function SlotGrid({ slots, onSlotSelect }: SlotGridProps) {
  // Derive status dynamically from slot properties
  const getSlotStatus = (slot: ParkingSlot) => {
    if (slot.occupied) return "occupied"
    if (slot.reserved) return "reserved"
    return "available"
  }

  const getSlotColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-primary/10 border-primary text-primary hover:bg-primary/20"
      case "occupied":
        return "bg-destructive/10 border-destructive text-destructive cursor-not-allowed"
      case "reserved":
        return "bg-secondary/10 border-secondary text-secondary cursor-not-allowed"
      default:
        return "bg-muted"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <Car className="h-4 w-4" />
      case "occupied":
        return <Car className="h-4 w-4 fill-current" />
      case "reserved":
        return <Clock className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Parking Slots
          <div className="flex gap-2 text-sm">
            <Badge variant="outline" className="text-primary border-primary">
              Available
            </Badge>
            <Badge variant="outline" className="text-destructive border-destructive">
              Occupied
            </Badge>
            <Badge variant="outline" className="text-secondary border-secondary">
              Reserved
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {slots.map((slot) => {
            const status = getSlotStatus(slot)
            return (
              <Button
                key={slot.slotId}
                variant="outline"
                size="sm"
                className={`h-12 w-12 p-0 flex flex-col items-center justify-center ${getSlotColor(status)}`}
                onClick={() => status === "available" && onSlotSelect(slot)}
                disabled={status !== "available"}
              >
                {getStatusIcon(status)}
                <span className="text-xs font-mono">{slot.number}</span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
