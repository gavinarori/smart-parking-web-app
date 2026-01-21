import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { getDatabase } from "./mongodb"
import type { User, UserSession } from "./models/User"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: UserSession): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession
  } catch {
    return null
  }
}

export async function createUser(
  userData: Omit<User, "_id" | "createdAt" | "updatedAt">
): Promise<User> {
  const db = await getDatabase()
  const users = db.collection<User>("users")

  // Check email uniqueness
  const existingUser = await users.findOne({ email: userData.email })
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Check RFID uniqueness (CRITICAL)
  const existingRfid = await users.findOne({ rfidTag: userData.rfidTag })
  if (existingRfid) {
    throw new Error("RFID tag already in use")
  }

  const hashedPassword = await hashPassword(userData.password)

  const newUser: Omit<User, "_id"> = {
    ...userData,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await users.insertOne(newUser)
  return { ...newUser, _id: result.insertedId }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<UserSession | null> {
  const db = await getDatabase()
  const users = db.collection<User>("users")

  const user = await users.findOne({ email })
  if (!user) return null

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) return null

  return {
    id: user._id!.toString(),
    email: user.email,
    name: user.name,
    phone: user.phone,
    rfidTag: user.rfidTag,
    vehicleInfo: user.vehicleInfo,
  }
}

export async function getUserById(id: string): Promise<UserSession | null> {
  const db = await getDatabase()
  const users = db.collection<User>("users")

  try {
    const user = await users.findOne({ _id: new ObjectId(id) })
    if (!user) return null

    return {
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      rfidTag: user.rfidTag,
      vehicleInfo: user.vehicleInfo,
    }
  } catch {
    return null
  }
}