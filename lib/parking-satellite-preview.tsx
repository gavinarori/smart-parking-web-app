"use client"

import { useEffect, useRef, useState } from "react"
import { loadGoogleMaps } from "@/lib/google-maps"

interface Props {
  lat: number
  lng: number
}

export function ParkingSatellitePreview({ lat, lng }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const [mapType, setMapType] = useState<google.maps.MapTypeId>("satellite")

  useEffect(() => {
    loadGoogleMaps().then((google) => {
      if (!mapRef.current || mapInstance.current) return

      const map = new google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 20,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        mapTypeControl: false,
      })


      new google.maps.Marker({
        position: { lat, lng },
        map,
        title: "Parking Area",
      })


      new google.maps.Polygon({
        paths: [
          { lat: lat + 0.00015, lng: lng - 0.0002 },
          { lat: lat + 0.00015, lng: lng + 0.0002 },
          { lat: lat - 0.00015, lng: lng + 0.0002 },
          { lat: lat - 0.00015, lng: lng - 0.0002 },
        ],
        strokeColor: "#00ff88",
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: "#00ff88",
        fillOpacity: 0.15,
        map,
      })

      mapInstance.current = map
    })
  }, [lat, lng])


  const toggleMapType = () => {
    if (!mapInstance.current) return
    const next =
      mapType === "satellite"
        ? google.maps.MapTypeId.ROADMAP
        : google.maps.MapTypeId.SATELLITE

    mapInstance.current.setMapTypeId(next)
    setMapType(next)
  }


  const recenter = () => {
    mapInstance.current?.panTo({ lat, lng })
    mapInstance.current?.setZoom(20)
  }

  return (
    <div className="relative w-full h-[360px] rounded-xl overflow-hidden border">
      {/* Map */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Controls */}
      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={toggleMapType}
          className="px-3 py-1 text-xs bg-black/70 text-white rounded hover:bg-black"
        >
          {mapType === "satellite" ? "Map View" : "Satellite"}
        </button>

        <button
          onClick={recenter}
          className="px-3 py-1 text-xs bg-black/70 text-white rounded hover:bg-black"
        >
          Recenter
        </button>
      </div>
    </div>
  )
}
