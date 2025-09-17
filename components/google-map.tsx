"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { loadGoogleMaps, createMarkerIcon, createInfoWindowContent } from "@/lib/google-maps"
import type { ParkingLot, ParkingSlot } from "@/lib/models/ParkingLot"
import { google } from "google-maps"

interface GoogleMapProps {
  parkingLots: ParkingLot[]
  selectedLot?: string | null
  onLotSelect?: (lotId: string) => void
  onSlotSelect?: (slot: ParkingSlot) => void
  showSlots?: boolean
  className?: string
}

export function GoogleMap({
  parkingLots,
  selectedLot,
  onLotSelect,
  onSlotSelect,
  showSlots = false,
  className = "w-full h-96",
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Global functions for info window buttons
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.selectParkingLot = (lotId: string) => {
        onLotSelect?.(lotId)
        if (infoWindowRef.current) {
          infoWindowRef.current.close()
        }
      }

      window.selectParkingSlot = (slotId: string) => {
        const slot = parkingLots.flatMap((lot) => lot.slots).find((s) => s.id === slotId)
        if (slot) {
          onSlotSelect?.(slot)
          if (infoWindowRef.current) {
            infoWindowRef.current.close()
          }
        }
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        delete window.selectParkingLot
        delete window.selectParkingSlot
      }
    }
  }, [parkingLots, onLotSelect, onSlotSelect])

  // Load Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMaps()
        setIsLoaded(true)
        setError(null)
      } catch (err) {
        console.error("Failed to load Google Maps:", err)
        setError(err instanceof Error ? err.message : "Failed to load Google Maps")
      }
    }

    initializeMap()
  }, [])

  // Initialize map instance
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return

    try {
      const map = new google.maps.Map(mapRef.current, {
        zoom: 13,
        center: parkingLots.length > 0 ? parkingLots[0].coordinates : { lat: 40.7128, lng: -74.006 }, // Default to NYC
        styles: [
          {
            featureType: "poi.business",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      })

      mapInstanceRef.current = map
      infoWindowRef.current = new google.maps.InfoWindow()
    } catch (err) {
      console.error("Failed to initialize map:", err)
      setError("Failed to initialize map")
    }
  }, [isLoaded, parkingLots])

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []
  }, [])

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    clearMarkers()

    const bounds = new google.maps.LatLngBounds()
    let hasValidCoordinates = false

    parkingLots.forEach((lot) => {
      // Create lot marker
      const lotMarker = new google.maps.Marker({
        position: lot.coordinates,
        map: mapInstanceRef.current,
        title: lot.name,
        icon: createMarkerIcon(
          "lot",
          lot.availableSlots > 10 ? "available" : lot.availableSlots > 0 ? "reserved" : "occupied",
          selectedLot === lot.id,
        ),
      })

      // Add click listener for lot marker
      lotMarker.addListener("click", () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(createInfoWindowContent("lot", lot))
          infoWindowRef.current.open(mapInstanceRef.current, lotMarker)
        }
      })

      markersRef.current.push(lotMarker)
      bounds.extend(lot.coordinates)
      hasValidCoordinates = true

      // Add slot markers if showing slots and this lot is selected
      if (showSlots && selectedLot === lot.id) {
        lot.slots.forEach((slot) => {
          const slotMarker = new google.maps.Marker({
            position: slot.coordinates,
            map: mapInstanceRef.current,
            title: `Slot ${slot.number} - ${slot.status}`,
            icon: createMarkerIcon("slot", slot.status, false),
          })

          slotMarker.addListener("click", () => {
            if (infoWindowRef.current) {
              infoWindowRef.current.setContent(createInfoWindowContent("slot", slot))
              infoWindowRef.current.open(mapInstanceRef.current, slotMarker)
            }
          })

          markersRef.current.push(slotMarker)
          bounds.extend(slot.coordinates)
        })
      }
    })

    // Fit map to show all markers
    if (hasValidCoordinates && mapInstanceRef.current) {
      if (parkingLots.length === 1 && !showSlots) {
        mapInstanceRef.current.setCenter(parkingLots[0].coordinates)
        mapInstanceRef.current.setZoom(15)
      } else {
        mapInstanceRef.current.fitBounds(bounds)
      }
    }
  }, [parkingLots, selectedLot, showSlots, isLoaded, clearMarkers])

  if (error) {
    return (
      <div
        className={`${className} bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25`}
      >
        <div className="text-center p-6">
          <div className="text-destructive mb-2">⚠️</div>
          <p className="text-sm text-muted-foreground mb-2">Failed to load map</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">Please check your Google Maps API key configuration</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`${className} bg-muted rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className={className} />
}

// Extend Window interface for global functions
declare global {
  interface Window {
    selectParkingLot: (lotId: string) => void
    selectParkingSlot: (slotId: string) => void
  }
}
