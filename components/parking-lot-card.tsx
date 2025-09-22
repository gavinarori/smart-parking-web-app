"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, DollarSign } from "lucide-react"
import type { ParkingLot } from "@/lib/types"

interface ParkingLotCardProps {
  lot: ParkingLot
  onViewDetails: (lotId: string) => void
}

export function ParkingLotCard({ lot, onViewDetails }: ParkingLotCardProps) {
  const availabilityPercentage = (lot.availableSlots / lot.totalSlots) * 100

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{lot.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {lot.address}
            </CardDescription>
          </div>
          <Badge
            variant={
              availabilityPercentage > 50 ? "default" : availabilityPercentage > 20 ? "secondary" : "destructive"
            }
            className="ml-2"
          >
            {lot.availableSlots} available
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-primary">{lot.availableSlots}</div>
            <div className="text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-destructive">{lot.occupiedSlots}</div>
            <div className="text-muted-foreground">Occupied</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-secondary">{lot.reservedSlots}</div>
            <div className="text-muted-foreground">Reserved</div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {lot.operatingHours.open} - {lot.operatingHours.close}
            </span>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${availabilityPercentage}%` }}
          />
        </div>

        <Button onClick={() => onViewDetails(lot.id)} className="w-full" size="sm">
          View Details & Reserve
        </Button>
      </CardContent>
    </Card>
  )
}
