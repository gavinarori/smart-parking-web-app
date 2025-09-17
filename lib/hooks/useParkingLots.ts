"use client"

import { useState, useEffect } from "react"
import type { ParkingLot } from "@/lib/models/ParkingLot"

export function useParkingLots() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchParkingLots = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/parking-lots")

      if (!response.ok) {
        throw new Error("Failed to fetch parking lots")
      }

      const data = await response.json()
      setParkingLots(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch parking lots")
      console.error("Error fetching parking lots:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateSlotStatus = async (
    lotId: string,
    slotId: string,
    status: "available" | "occupied" | "reserved",
    reservedUntil?: Date,
  ) => {
    try {
      const response = await fetch(`/api/parking-lots/${lotId}/slots/${slotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, reservedUntil }),
      })

      if (!response.ok) {
        throw new Error("Failed to update slot")
      }

      // Refresh parking lots data
      await fetchParkingLots()
      return true
    } catch (err) {
      console.error("Error updating slot:", err)
      return false
    }
  }

  useEffect(() => {
    fetchParkingLots()
  }, [])

  return {
    parkingLots,
    loading,
    error,
    refetch: fetchParkingLots,
    updateSlotStatus,
  }
}

export function useParkingLot(id: string) {
  const [parkingLot, setParkingLot] = useState<ParkingLot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchParkingLot = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/parking-lots/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch parking lot")
        }

        const data = await response.json()
        setParkingLot(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch parking lot")
        console.error("Error fetching parking lot:", err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchParkingLot()
    }
  }, [id])

  return { parkingLot, loading, error }
}
