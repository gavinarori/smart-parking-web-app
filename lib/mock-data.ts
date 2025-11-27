import type { ParkingLot, ParkingSlot } from "./types"


export const mockParkingLots: ParkingLot[] = [

  {
    id: "lot-2",
    name: "Library Parking",
    address: "Dedan Kimathi University, Library Zone, Nyeri",
    coordinates: { lat: -0.3979, lng: 36.9622 },
    totalSlots: 10,
    availableSlots: 4,
    occupiedSlots: 2,
    reservedSlots: 4,
    pricePerHour: 15.0,
    operatingHours: { open: "07:00", close: "21:00" },
    slots: generateMockSlots("lot-2", 60, { lat: -0.3979, lng: 36.9622 }),
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
