"use client"

import { useEffect, useState, useCallback } from "react"

interface RealTimeUpdatesProps {
  onUpdate: (updates: any[]) => void
  isActive: boolean
}

export function RealTimeUpdates({ onUpdate, isActive }: RealTimeUpdatesProps) {
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  const connectToUpdates = useCallback(() => {
    if (!isActive) {
      if (eventSource) {
        eventSource.close()
        setEventSource(null)
      }
      setConnectionStatus("disconnected")
      return
    }

    setConnectionStatus("connecting")

    const es = new EventSource("/api/parking-lots/updates")

    es.onopen = () => {
      setConnectionStatus("connected")
      console.log("[v0] Real-time updates connected")
    }

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log("[v0] Received update:", data)

        if (data.type === "slot_updates" && data.updates) {
          onUpdate(data.updates)
          setLastUpdate(new Date())
        }
      } catch (error) {
        console.error("[v0] Error parsing update:", error)
      }
    }

    es.onerror = (error) => {
      console.error("[v0] EventSource error:", error)
      setConnectionStatus("disconnected")

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (isActive) {
          connectToUpdates()
        }
      }, 5000)
    }

    setEventSource(es)

    return () => {
      es.close()
    }
  }, [isActive, onUpdate, eventSource])

  useEffect(() => {
    const cleanup = connectToUpdates()

    return () => {
      if (cleanup) cleanup()
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [connectToUpdates])

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
