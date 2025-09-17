"use client"

import { useEffect, useRef, useState } from "react"
import type { ParkingLot, ParkingSlot } from "@/lib/types"

interface GoogleMapProps {
  parkingLots: ParkingLot[]
  selectedLot?: string | null
  onLotSelect?: (lotId: string) => void
  onSlotSelect?: (slot: ParkingSlot) => void
  showSlots?: boolean
  className?: string
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
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
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load Google Maps script
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`
    script.async = true
    script.defer = true

    window.initMap = () => {
      setIsLoaded(true)
    }

    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    })

    mapInstanceRef.current = map
  }, [isLoaded])

  // Update markers when parking lots change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    const bounds = new window.google.maps.LatLngBounds()

    parkingLots.forEach((lot) => {
      // Create lot marker
      const lotMarker = new window.google.maps.Marker({
        position: lot.coordinates,
        map: mapInstanceRef.current,
        title: lot.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: lot.availableSlots > 10 ? "#15803d" : lot.availableSlots > 5 ? "#84cc16" : "#dc2626",
          fillOpacity: 0.8,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      })

      // Add info window for lot
      const lotInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold text-lg">${lot.name}</h3>
            <p class="text-sm text-gray-600">${lot.address}</p>
            <div class="mt-2 space-y-1">
              <div class="flex justify-between">
                <span>Available:</span>
                <span class="font-semibold text-green-600">${lot.availableSlots}</span>
              </div>
              <div class="flex justify-between">
                <span>Price:</span>
                <span class="font-semibold">$${lot.pricePerHour}/hr</span>
              </div>
            </div>
          </div>
        `,
      })

      lotMarker.addListener("click", () => {
        lotInfoWindow.open(mapInstanceRef.current, lotMarker)
        onLotSelect?.(lot.id)
      })

      markersRef.current.push(lotMarker)
      bounds.extend(lot.coordinates)

      // Add slot markers if showing slots and this lot is selected
      if (showSlots && selectedLot === lot.id) {
        lot.slots.forEach((slot) => {
          const slotColor = slot.status === "available" ? "#15803d" : slot.status === "reserved" ? "#84cc16" : "#dc2626"

          const slotMarker = new window.google.maps.Marker({
            position: slot.coordinates,
            map: mapInstanceRef.current,
            title: `Slot ${slot.number} - ${slot.status}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: slotColor,
              fillOpacity: 0.9,
              strokeColor: "#ffffff",
              strokeWeight: 1,
            },
          })

          const slotInfoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h4 class="font-bold">Slot ${slot.number}</h4>
                <p class="text-sm capitalize">${slot.status}</p>
                ${slot.status === "available" ? '<button class="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm">Reserve</button>' : ""}
              </div>
            `,
          })

          slotMarker.addListener("click", () => {
            slotInfoWindow.open(mapInstanceRef.current, slotMarker)
            if (slot.status === "available") {
              onSlotSelect?.(slot)
            }
          })

          markersRef.current.push(slotMarker)
        })
      }
    })

    // Fit map to show all markers
    if (parkingLots.length > 0) {
      mapInstanceRef.current.fitBounds(bounds)
    }
  }, [parkingLots, selectedLot, showSlots, onLotSelect, onSlotSelect])

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
