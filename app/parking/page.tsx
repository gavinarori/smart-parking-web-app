"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ParkingLotCard } from "@/components/parking-lot-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockParkingLots } from "@/lib/mock-data"
import type { ParkingLot } from "@/lib/types"
import { Search, MapPin, RefreshCw as Refresh, Map } from "lucide-react"

export default function ParkingPage() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>(mockParkingLots)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Filter parking lots based on search term
  const filteredLots = parkingLots.filter(
    (lot) =>
      lot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Simulate real-time updates
  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update available slots randomly
    const updatedLots = parkingLots.map((lot) => {
      const change = Math.floor(Math.random() * 6) - 3 // -3 to +3 change
      const newAvailable = Math.max(0, Math.min(lot.totalSlots - lot.reservedSlots, lot.availableSlots + change))
      const newOccupied = lot.totalSlots - newAvailable - lot.reservedSlots

      return {
        ...lot,
        availableSlots: newAvailable,
        occupiedSlots: newOccupied,
      }
    })

    setParkingLots(updatedLots)
    setIsLoading(false)
  }

  const handleViewDetails = (lotId: string) => {
    router.push(`/parking/${lotId}`)
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [parkingLots])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Find Parking</h1>
            <p className="text-muted-foreground">Real-time parking availability across the city</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/map">
                <Map className="h-4 w-4 mr-2" />
                Map View
              </Link>
            </Button>
            <Button onClick={refreshData} disabled={isLoading} variant="outline">
              <Refresh className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location or parking lot name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Near Me
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {filteredLots.reduce((sum, lot) => sum + lot.availableSlots, 0)}
              </div>
              <p className="text-xs text-muted-foreground">spots across {filteredLots.length} locations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                ${(filteredLots.reduce((sum, lot) => sum + lot.pricePerHour, 0) / filteredLots.length).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">per hour</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Best Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {Math.max(...filteredLots.map((lot) => Math.round((lot.availableSlots / lot.totalSlots) * 100)))}%
              </div>
              <p className="text-xs text-muted-foreground">
                at{" "}
                {
                  filteredLots.find(
                    (lot) =>
                      lot.availableSlots / lot.totalSlots ===
                      Math.max(...filteredLots.map((l) => l.availableSlots / l.totalSlots)),
                  )?.name
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Parking Lots Grid */}
        {filteredLots.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No parking lots found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLots.map((lot) => (
              <ParkingLotCard key={lot.id} lot={lot} onViewDetails={handleViewDetails} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
