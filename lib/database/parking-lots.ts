import { getDatabase } from "@/lib/mongodb"
import type { ParkingLot, ParkingSlot } from "@/lib/models/ParkingLot"
import { ObjectId } from "mongodb"

export async function getAllParkingLots(): Promise<ParkingLot[]> {
  const db = await getDatabase()
  const collection = db.collection<ParkingLot>("parking_lots")

  const lots = await collection.find({}).toArray()
  return lots.map((lot) => ({
    ...lot,
    id: lot._id?.toString() || lot.id,
  }))
}

export async function getParkingLotById(id: string): Promise<ParkingLot | null> {
  const db = await getDatabase()
  const collection = db.collection<ParkingLot>("parking_lots")

  try {
    const lot = await collection.findOne({
      $or: [{ _id: new ObjectId(id) }, { id: id }],
    })

    if (!lot) return null

    return {
      ...lot,
      id: lot._id?.toString() || lot.id,
    }
  } catch {
    return null
  }
}

export async function updateSlotStatus(
  lotId: string,
  slotId: string,
  status: "available" | "occupied" | "reserved",
  reservedBy?: string,
  reservedUntil?: Date,
): Promise<boolean> {
  const db = await getDatabase()
  const collection = db.collection<ParkingLot>("parking_lots")

  const updateData: any = {
    "slots.$.status": status,
    "slots.$.lastUpdated": new Date(),
  }

  if (status === "reserved" && reservedBy && reservedUntil) {
    updateData["slots.$.reservedBy"] = reservedBy
    updateData["slots.$.reservedUntil"] = reservedUntil
  } else {
    updateData["slots.$.reservedBy"] = null
    updateData["slots.$.reservedUntil"] = null
  }

  const result = await collection.updateOne(
    {
      $or: [{ _id: new ObjectId(lotId) }, { id: lotId }],
      "slots.id": slotId,
    },
    { $set: updateData },
  )

  if (result.modifiedCount > 0) {
    // Update lot statistics
    await updateLotStatistics(lotId)
    return true
  }

  return false
}

export async function updateLotStatistics(lotId: string): Promise<void> {
  const db = await getDatabase()
  const collection = db.collection<ParkingLot>("parking_lots")

  const lot = await collection.findOne({
    $or: [{ _id: new ObjectId(lotId) }, { id: lotId }],
  })

  if (!lot) return

  const availableSlots = lot.slots.filter((slot) => slot.status === "available").length
  const occupiedSlots = lot.slots.filter((slot) => slot.status === "occupied").length
  const reservedSlots = lot.slots.filter((slot) => slot.status === "reserved").length

  await collection.updateOne(
    { _id: lot._id },
    {
      $set: {
        availableSlots,
        occupiedSlots,
        reservedSlots,
        updatedAt: new Date(),
      },
    },
  )
}

export async function createParkingLot(
  lotData: Omit<ParkingLot, "_id" | "createdAt" | "updatedAt">,
): Promise<ParkingLot> {
  const db = await getDatabase()
  const collection = db.collection<ParkingLot>("parking_lots")

  const newLot: Omit<ParkingLot, "_id"> = {
    ...lotData,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await collection.insertOne(newLot)
  return { ...newLot, _id: result.insertedId }
}

export async function getSlotsByStatus(status: "available" | "occupied" | "reserved"): Promise<ParkingSlot[]> {
  const db = await getDatabase()
  const collection = db.collection<ParkingLot>("parking_lots")

  const lots = await collection.find({}).toArray()
  const slots: ParkingSlot[] = []

  lots.forEach((lot) => {
    const filteredSlots = lot.slots.filter((slot) => slot.status === status)
    slots.push(...filteredSlots)
  })

  return slots
}
