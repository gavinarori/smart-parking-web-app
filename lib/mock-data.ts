import type { ParkingLot, ParkingSlot } from "./types"


export const mockParkingLots: ParkingLot[] = [
  {
    id: "lot-1",
    name: "Main Gate Parking",
    address: "Dedan Kimathi University, Main Entrance, Nyeri",
    coordinates: { lat: -0.39844, lng: 36.961078 },
    totalSlots: 80,
    availableSlots: 25,
    occupiedSlots: 50,
    reservedSlots: 5,
    pricePerHour: 20.0,
    operatingHours: { open: "06:00", close: "22:00" },
    slots: generateMockSlots("lot-1", 80, { lat: -0.39844, lng: 36.961078 }),
  },
  {
    id: "lot-2",
    name: "Library Parking",
    address: "Dedan Kimathi University, Library Zone, Nyeri",
    coordinates: { lat: -0.3979, lng: 36.9622 },
    totalSlots: 60,
    availableSlots: 15,
    occupiedSlots: 40,
    reservedSlots: 5,
    pricePerHour: 15.0,
    operatingHours: { open: "07:00", close: "21:00" },
    slots: generateMockSlots("lot-2", 60, { lat: -0.3979, lng: 36.9622 }),
  },
  {
    id: "lot-3",
    name: "Engineering Block Parking",
    address: "Dedan Kimathi University, Engineering Faculty, Nyeri",
    coordinates: { lat: -0.3992, lng: 36.9605 },
    totalSlots: 40,
    availableSlots: 10,
    occupiedSlots: 25,
    reservedSlots: 5,
    pricePerHour: 10.0,
    operatingHours: { open: "06:30", close: "20:00" },
    slots: generateMockSlots("lot-3", 40, { lat: -0.3992, lng: 36.9605 }),
  },
  {
    id: "lot-4",
    name: "Hostels Parking",
    address: "Dedan Kimathi University, Hostel Zone, Nyeri",
    coordinates: { lat: -0.4001, lng: 36.9628 },
    totalSlots: 100,
    availableSlots: 40,
    occupiedSlots: 50,
    reservedSlots: 10,
    pricePerHour: 10.0,
    operatingHours: { open: "00:00", close: "23:59" }, // 24 hours
    slots: generateMockSlots("lot-4", 100, { lat: -0.4001, lng: 36.9628 }),
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
