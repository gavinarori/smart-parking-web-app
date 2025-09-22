import { Loader } from "@googlemaps/js-api-loader"

let googleMapsLoader: Loader | null = null

export async function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") {
    throw new Error("Google Maps can only be loaded in the browser")
  }

  if (window.google?.maps) {
    return window.google
  }

  if (!googleMapsLoader) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      throw new Error("Google Maps API key is not configured")
    }

    googleMapsLoader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "geometry"],
    })
  }

  await googleMapsLoader.load()
  return window.google
}

export const getGoogleMaps = () => {
  if (typeof window !== "undefined" && window.google) {
    return window.google
  }
  throw new Error("Google Maps not loaded yet")
}

export interface MapMarkerData {
  id: string
  position: google.maps.LatLngLiteral
  title: string
  type: "lot" | "slot"
  status?: "available" | "occupied" | "reserved"
  data?: any
}

export function createMarkerIcon(
  type: "lot" | "slot",
  status: "available" | "occupied" | "reserved" = "available",
  isSelected = false,
): google.maps.Symbol {
  const colors = {
    available: "#15803d", // Green
    occupied: "#dc2626", // Red
    reserved: "#84cc16", // Yellow-green
  }

  const scale = type === "lot" ? (isSelected ? 16 : 12) : isSelected ? 8 : 6
  const strokeWeight = isSelected ? 3 : 2

  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale,
    fillColor: colors[status],
    fillOpacity: 0.8,
    strokeColor: isSelected ? "#ffffff" : "#000000",
    strokeWeight,
    strokeOpacity: isSelected ? 1 : 0.6,
  }
}

export function createInfoWindowContent(type: "lot" | "slot", data: any): string {
  if (type === "lot") {
    return `
      <div class="p-3 min-w-[200px]">
        <h3 class="font-bold text-lg text-gray-800 mb-1">${data.name}</h3>
        <p class="text-sm text-gray-600 mb-3">${data.address}</p>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm">Available:</span>
            <span class="font-semibold text-green-600">${data.availableSlots}/${data.totalSlots}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm">Price:</span>
            <span class="font-semibold">$${data.pricePerHour}/hr</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm">Hours:</span>
            <span class="font-semibold text-xs">${data.operatingHours.open} - ${data.operatingHours.close}</span>
          </div>
        </div>
        <button 
          onclick="window.selectParkingLot('${data.id}')"
          class="mt-3 w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
        >
          View Details
        </button>
      </div>
    `
  } else {
    const statusColor = data.status === "available" ? "green" : data.status === "reserved" ? "yellow" : "red"
    const statusText = data.status.charAt(0).toUpperCase() + data.status.slice(1)

    return `
      <div class="p-3 min-w-[150px]">
        <h4 class="font-bold text-gray-800 mb-1">Slot ${data.number}</h4>
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 rounded-full bg-${statusColor}-500"></div>
          <span class="text-sm capitalize">${statusText}</span>
        </div>
        <p class="text-xs text-gray-600 mb-2">
          Updated: ${new Date(data.lastUpdated).toLocaleTimeString()}
        </p>
        ${
          data.status === "available"
            ? `
          <button 
            onclick="window.selectParkingSlot('${data.id}')"
            class="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
          >
            Reserve Slot
          </button>
        `
            : ""
        }
      </div>
    `
  }
}

declare global {
  interface Window {
    google: typeof google
  }
}
