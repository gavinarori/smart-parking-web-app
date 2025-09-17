"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Reservation } from "@/lib/types"
import { mockParkingLots } from "@/lib/mock-data"
import { MapPin, Clock, Car, CreditCard, X, Calendar, Plus } from "lucide-react"
import Link from "next/link"

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/login")
      return
    }

    // Load reservations
    const storedReservations = JSON.parse(localStorage.getItem("reservations") || "[]")
    const userReservations = storedReservations
      .filter((r: Reservation) => r.userId === JSON.parse(userData).email)
      .map((r: Reservation) => ({
        ...r,
        startTime: new Date(r.startTime),
        endTime: new Date(r.endTime),
      }))
      .sort((a: Reservation, b: Reservation) => b.startTime.getTime() - a.startTime.getTime())

    setReservations(userReservations)
  }, [router])

  const handleCancelReservation = async (reservationId: string) => {
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update reservation status
      const updatedReservations = reservations.map((r) =>
        r.id === reservationId ? { ...r, status: "cancelled" as const } : r,
      )
      setReservations(updatedReservations)

      // Update localStorage
      const allReservations = JSON.parse(localStorage.getItem("reservations") || "[]")
      const updatedAllReservations = allReservations.map((r: Reservation) =>
        r.id === reservationId ? { ...r, status: "cancelled" } : r,
      )
      localStorage.setItem("reservations", JSON.stringify(updatedAllReservations))
    } catch (err: any) {
      setError("Failed to cancel reservation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getLotDetails = (lotId: string) => {
    return mockParkingLots.find((lot) => lot.id === lotId)
  }

  const getSlotDetails = (lotId: string, slotId: string) => {
    const lot = getLotDetails(lotId)
    return lot?.slots.find((slot) => slot.id === slotId)
  }

  const canCancelReservation = (reservation: Reservation) => {
    const now = new Date()
    const oneHourBefore = new Date(reservation.startTime.getTime() - 60 * 60 * 1000)
    return now < oneHourBefore && reservation.status === "active"
  }

  const activeReservations = reservations.filter((r) => r.status === "active")
  const pastReservations = reservations.filter((r) => r.status !== "active")

  const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
    const lot = getLotDetails(reservation.lotId)
    const slot = getSlotDetails(reservation.lotId, reservation.slotId)
    const duration = (reservation.endTime.getTime() - reservation.startTime.getTime()) / (1000 * 60 * 60)
    const isUpcoming = reservation.startTime > new Date()
    const isActive = reservation.startTime <= new Date() && reservation.endTime > new Date()

    return (
      <Card className={`${reservation.status === "cancelled" ? "opacity-60" : ""}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{lot?.name || "Unknown Location"}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {lot?.address || "Address not available"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={
                  reservation.status === "active"
                    ? isActive
                      ? "default"
                      : isUpcoming
                        ? "secondary"
                        : "outline"
                    : reservation.status === "completed"
                      ? "outline"
                      : "destructive"
                }
              >
                {reservation.status === "active"
                  ? isActive
                    ? "In Progress"
                    : isUpcoming
                      ? "Upcoming"
                      : "Active"
                  : reservation.status}
              </Badge>
              {slot && <Badge variant="outline">Slot {slot.number}</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Start: {reservation.startTime.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>End: {reservation.endTime.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span>
                  Duration: {duration} hour{duration !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Total: ${reservation.totalCost.toFixed(2)}</span>
              </div>
              <div className="text-xs text-muted-foreground">Confirmation: {reservation.id}</div>
            </div>
          </div>

          {canCancelReservation(reservation) && (
            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancelReservation(reservation.id)}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Reservation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">My Reservations</h1>
            <p className="text-muted-foreground">Manage your parking reservations</p>
          </div>
          <Button asChild>
            <Link href="/parking">
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Link>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active ({activeReservations.length})</TabsTrigger>
            <TabsTrigger value="history">History ({pastReservations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeReservations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No active reservations</p>
                  <Button asChild>
                    <Link href="/parking">Find Parking</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              activeReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {pastReservations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No past reservations</p>
                </CardContent>
              </Card>
            ) : (
              pastReservations.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
