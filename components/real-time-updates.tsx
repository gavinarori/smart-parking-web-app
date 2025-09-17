"use client"

import { useEffect, useState } from "react"
import type { ParkingSlot } from "@/lib/types"
import { getSlotUpdates } from "@/lib/mock-data"

interface RealTimeUpdatesProps {
  onUpdate: (updates: { lotId: string; slots: ParkingSlot[] }[]) => void
  isActive: boolean
}

export function RealTimeUpdates({ onUpdate, isActive }: RealTimeUpdatesProps) {
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    if (!isActive) {
      setConnectionStatus("disconnected")
      return
    }

    // Simulate WebSocket connection
    setConnectionStatus("connecting")

    const connectTimeout = setTimeout(() => {
      setConnectionStatus("connected")
    }, 1000)

    // Simulate real-time updates every 5-10 seconds
    const updateInterval = setInterval(
      () => {
        if (connectionStatus === "connected") {
          const updates = getSlotUpdates()
          const groupedUpdates = updates.reduce(
            (acc, slot) => {
              const lotId = slot.id.split("-slot-")[0]
              if (!acc[lotId]) {
                acc[lotId] = []
              }
              acc[lotId].push(slot)
              return acc
            },
            {} as Record<string, ParkingSlot[]>,
          )

          const formattedUpdates = Object.entries(groupedUpdates).map(([lotId, slots]) => ({
            lotId,
            slots,
          }))

          onUpdate(formattedUpdates)
          setLastUpdate(new Date())
        }
      },
      Math.random() * 5000 + 5000,
    ) // 5-10 seconds

    return () => {
      clearTimeout(connectTimeout)
      clearInterval(updateInterval)
    }
  }, [isActive, connectionStatus, onUpdate])

  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={`w-2 h-2 rounded-full ${
          connectionStatus === "connected"
            ? "bg-green-500"
            : connectionStatus === "connecting"
              ? "bg-yellow-500 animate-pulse"
              : "bg-red-500"
        }`}
      />
      <span className="text-muted-foreground">
        {connectionStatus === "connected"
          ? "Live updates"
          : connectionStatus === "connecting"
            ? "Connecting..."
            : "Offline"}
      </span>
      {lastUpdate && (
        <span className="text-xs text-muted-foreground">Last update: {lastUpdate.toLocaleTimeString()}</span>
      )}
    </div>
  )
}
