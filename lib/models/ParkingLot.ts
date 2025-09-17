import type { ObjectId } from "mongodb"

export interface ParkingSlot {
  id: string
  number: string
  status: "available" | "occupied" | "reserved"
  coordinates: {
    lat: number
    lng: number
  }
  lastUpdated: Date
  reservedBy?: string
  reservedUntil?: Date
}

export interface ParkingLot {
  _id?: ObjectId
  id: string
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  totalSlots: number
  availableSlots: number
  occupiedSlots: number
  reservedSlots: number
  slots: ParkingSlot[]
  pricePerHour: number
  operatingHours: {
    open: string
    close: string
  }
  createdAt: Date
  updatedAt: Date
}
