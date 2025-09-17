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
  const getSlotColor = (status: ParkingSlot["status"]) => {
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

  const getStatusIcon = (status: ParkingSlot["status"]) => {
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
          {slots.map((slot) => (
            <Button
              key={slot.id}
              variant="outline"
              size="sm"
              className={`h-12 w-12 p-0 flex flex-col items-center justify-center ${getSlotColor(slot.status)}`}
              onClick={() => slot.status === "available" && onSlotSelect(slot)}
              disabled={slot.status !== "available"}
            >
              {getStatusIcon(slot.status)}
              <span className="text-xs font-mono">{slot.number}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
