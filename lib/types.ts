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
}

export interface Reservation {
  id: string
  userId: string
  slotId: string
  lotId: string
  startTime: Date
  endTime: Date
  status: "active" | "completed" | "cancelled"
  totalCost: number
}

export interface User {
  id: string
  email: string
  name: string
  phone: string
  vehicleInfo: string
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: "reservation_reminder" | "slot_available" | "payment_due" | "system_update"
  title: string
  message: string
  read: boolean
  createdAt: Date
}

export interface AnalyticsData {
  totalRevenue: number
  totalReservations: number
  averageOccupancy: number
  peakHours: { hour: string; usage: number }[]
  weeklyUsage: { day: string; reservations: number; revenue: number }[]
  monthlyTrends: { month: string; occupancy: number; revenue: number }[]
}
