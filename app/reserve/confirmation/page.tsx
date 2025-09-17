"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Reservation } from "@/lib/types"
import { mockParkingLots } from "@/lib/mock-data"
import { CheckCircle, MapPin, Clock, Car, CreditCard, Calendar } from "lucide-react"

export default function ReservationConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reservationId = searchParams.get("reservationId")

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [lot, setLot] = useState<any>(null)
  const [slot, setSlot] = useState<any>(null)

  useEffect(() => {
    if (!reservationId) {
      router.push("/dashboard")
      return
    }

    // Get reservation from localStorage (in real app, this would be API call)
    const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
    const foundReservation = reservations.find((r: Reservation) => r.id === reservationId)

    if (foundReservation) {
      setReservation(foundReservation)

      // Find lot and slot details
      const foundLot = mockParkingLots.find((l) => l.id === foundReservation.lotId)
      if (foundLot) {
        setLot(foundLot)
        const foundSlot = foundLot.slots.find((s) => s.id === foundReservation.slotId)
        setSlot(foundSlot)
      }
    } else {
      router.push("/dashboard")
    }
  }, [reservationId, router])

  if (!reservation || !lot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const duration = (reservation.endTime.getTime() - reservation.startTime.getTime()) / (1000 * 60 * 60)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Reservation Confirmed!</h1>
          <p className="text-muted-foreground">Your parking spot has been successfully reserved</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
            <CardDescription>Confirmation ID: {reservation.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-sm text-muted-foreground">{lot.name}</p>
                    <p className="text-sm text-muted-foreground">{lot.address}</p>
                    {slot && (
                      <Badge variant="outline" className="mt-1">
                        Slot {slot.number}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Time</h3>
                    <p className="text-sm text-muted-foreground">{new Date(reservation.startTime).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">to {new Date(reservation.endTime).toLocaleString()}</p>
                    <Badge variant="secondary" className="mt-1">
                      {duration} hour{duration !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Payment</h3>
                    <p className="text-sm text-muted-foreground">Total: ${reservation.totalCost.toFixed(2)}</p>
                    <Badge variant="outline" className="mt-1 text-green-600 border-green-600">
                      Paid
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Car className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Status</h3>
                    <Badge variant="default" className="mt-1">
                      {reservation.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Please arrive within 15 minutes of your start time</li>
              <li>• Your reservation will be automatically cancelled if you're more than 30 minutes late</li>
              <li>• You can extend your reservation through the app (subject to availability)</li>
              <li>• Free cancellation up to 1 hour before your start time</li>
              <li>• Keep your confirmation ID handy for any assistance</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link href="/reservations">
              <Calendar className="h-4 w-4 mr-2" />
              View All Reservations
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
