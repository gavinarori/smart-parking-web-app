import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  name: string
  phone: string
  vehicleInfo: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface UserSession {
  id: string
  email: string
  name: string
  phone: string
  vehicleInfo: string
}
