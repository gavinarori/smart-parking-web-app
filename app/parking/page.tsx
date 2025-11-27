"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ParkingLotCard } from "@/components/parking-lot-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import type { ParkingLot } from "@/lib/types"
import { Search, MapPin, RefreshCw as Refresh, Map } from "lucide-react"

export default function ParkingPage() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // -------------------------------
  // Fetch parking lots from backend
  // -------------------------------
  const fetchParkingLots = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:4000/api/lots")
      const data = await res.json()
      setParkingLots(data)
    } catch (error) {
      console.error("Failed to fetch parking lots", error)
    }
    setIsLoading(false)
  }

  // Load on mount
  useEffect(() => {
    fetchParkingLots()
  }, [])

  // Auto refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchParkingLots, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredLots = parkingLots.filter(
    (lot) =>
      lot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

 const handleViewDetails = (lotId: string) => {
  console.log(lotId)
  router.push(`/parking/${lotId}`)
}


  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Find Parking</h1>
            <p className="text-muted-foreground">Real-time parking availability</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/map">
                <Map className="h-4 w-4 mr-2" />
                Map View
              </Link>
            </Button>
            <Button onClick={fetchParkingLots} disabled={isLoading} variant="outline">
              <Refresh className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* SEARCH */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search parking lots..."
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

        {/* GRID */}
        {filteredLots.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No results found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLots.map((lot) => (
  <ParkingLotCard 
    key={lot.lotId} 
    lot={lot} 
    onViewDetails={handleViewDetails} 
  />
))}

          </div>
        )}
      </div>
    </div>
  )
}
