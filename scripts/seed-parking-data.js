// MongoDB seeding script for parking lots
const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "smartpark"

// Sample parking lot data with real coordinates
const sampleParkingLots = [
  {
    id: "lot-1",
    name: "Downtown Plaza",
    address: "123 Main Street, Downtown",
    coordinates: { lat: 40.7128, lng: -74.006 },
    totalSlots: 50,
    availableSlots: 12,
    occupiedSlots: 35,
    reservedSlots: 3,
    pricePerHour: 5.0,
    operatingHours: { open: "06:00", close: "22:00" },
    slots: generateSlots("lot-1", 50, { lat: 40.7128, lng: -74.006 }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "lot-2",
    name: "Shopping Center",
    address: "456 Commerce Ave, Mall District",
    coordinates: { lat: 40.7589, lng: -73.9851 },
    totalSlots: 75,
    availableSlots: 28,
    occupiedSlots: 42,
    reservedSlots: 5,
    pricePerHour: 3.5,
    operatingHours: { open: "08:00", close: "23:00" },
    slots: generateSlots("lot-2", 75, { lat: 40.7589, lng: -73.9851 }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "lot-3",
    name: "Business District",
    address: "789 Corporate Blvd, Financial District",
    coordinates: { lat: 40.7505, lng: -73.9934 },
    totalSlots: 100,
    availableSlots: 45,
    occupiedSlots: 50,
    reservedSlots: 5,
    pricePerHour: 8.0,
    operatingHours: { open: "05:00", close: "24:00" },
    slots: generateSlots("lot-3", 100, { lat: 40.7505, lng: -73.9934 }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

function generateSlots(lotId, count, baseCoords) {
  const slots = []
  const statuses = ["available", "occupied", "reserved"]

  for (let i = 1; i <= count; i++) {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const slot = {
      id: `${lotId}-slot-${i}`,
      number: `${String.fromCharCode(65 + Math.floor((i - 1) / 10))}${((i - 1) % 10) + 1}`,
      status: randomStatus,
      coordinates: {
        lat: baseCoords.lat + (Math.random() - 0.5) * 0.001,
        lng: baseCoords.lng + (Math.random() - 0.5) * 0.001,
      },
      lastUpdated: new Date(Date.now() - Math.random() * 3600000),
      ...(randomStatus === "reserved" && {
        reservedBy: "user-123",
        reservedUntil: new Date(Date.now() + Math.random() * 7200000),
      }),
    }
    slots.push(slot)
  }

  return slots
}

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(DB_NAME)
    const collection = db.collection("parking_lots")

    // Clear existing data
    await collection.deleteMany({})
    console.log("Cleared existing parking lots")

    // Insert sample data
    const result = await collection.insertMany(sampleParkingLots)
    console.log(`Inserted ${result.insertedCount} parking lots`)

    // Create indexes
    await collection.createIndex({ id: 1 }, { unique: true })
    await collection.createIndex({ "coordinates.lat": 1, "coordinates.lng": 1 })
    await collection.createIndex({ "slots.id": 1 })
    console.log("Created indexes")

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
