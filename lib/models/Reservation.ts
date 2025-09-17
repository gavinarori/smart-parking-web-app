import type { ObjectId } from "mongodb"

export interface Reservation {
  _id?: ObjectId
  id: string
  userId: string
  slotId: string
  lotId: string
  startTime: Date
  endTime: Date
  status: "active" | "completed" | "cancelled"
  totalCost: number
  createdAt: Date
  updatedAt: Date
}
