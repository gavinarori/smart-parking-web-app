import type { ParkingLot, ParkingSlot } from "./types"

// Mock parking lots data
export const mockParkingLots: ParkingLot[] = [
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
    slots: generateMockSlots("lot-1", 50, { lat: 40.7128, lng: -74.006 }),
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
    slots: generateMockSlots("lot-2", 75, { lat: 40.7589, lng: -73.9851 }),
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
    slots: generateMockSlots("lot-3", 100, { lat: 40.7505, lng: -73.9934 }),
  },
]

function generateMockSlots(lotId: string, count: number, baseCoords: { lat: number; lng: number }): ParkingSlot[] {
  const slots: ParkingSlot[] = []
  const statuses: ("available" | "occupied" | "reserved")[] = ["available", "occupied", "reserved"]

  for (let i = 1; i <= count; i++) {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const slot: ParkingSlot = {
      id: `${lotId}-slot-${i}`,
      number: `${String.fromCharCode(65 + Math.floor((i - 1) / 10))}${((i - 1) % 10) + 1}`,
      status: randomStatus,
      coordinates: {
        lat: baseCoords.lat + (Math.random() - 0.5) * 0.001,
        lng: baseCoords.lng + (Math.random() - 0.5) * 0.001,
      },
      lastUpdated: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
      ...(randomStatus === "reserved" && {
        reservedBy: "user-123",
        reservedUntil: new Date(Date.now() + Math.random() * 7200000), // Random time within next 2 hours
      }),
    }
    slots.push(slot)
  }

  return slots
}

// Function to get real-time slot updates (simulates WebSocket data)
export function getSlotUpdates(): ParkingSlot[] {
  const allSlots = mockParkingLots.flatMap((lot) => lot.slots)
  // Randomly update 1-3 slots
  const slotsToUpdate = allSlots.slice(0, Math.floor(Math.random() * 3) + 1)

  return slotsToUpdate.map((slot) => ({
    ...slot,
    status: Math.random() > 0.5 ? "available" : "occupied",
    lastUpdated: new Date(),
  }))
}
