"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { mockParkingLots } from "@/lib/mock-data"
import type { ParkingLot, ParkingSlot, Reservation } from "@/lib/types"
import { ArrowLeft, Clock, MapPin, CreditCard, Car } from "lucide-react"

export default function ReservePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lotId = searchParams.get("lotId")
  const slotId = searchParams.get("slotId")

  const [lot, setLot] = useState<ParkingLot | null>(null)
  const [slot, setSlot] = useState<ParkingSlot | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [reservationData, setReservationData] = useState({
    startTime: "",
    duration: "1",
    vehicleInfo: "",
    notes: "",
    paymentMethod: "credit-card",
  })

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
      setReservationData((prev) => ({
        ...prev,
        vehicleInfo: JSON.parse(userData).vehicleInfo || "",
      }))
    } else {
      router.push("/login")
      return
    }

    // Find lot and slot
    if (lotId) {
      const foundLot = mockParkingLots.find((l) => l.id === lotId)
      setLot(foundLot || null)

      if (foundLot && slotId) {
        const foundSlot = foundLot.slots.find((s) => s.id === slotId)
        setSlot(foundSlot || null)
      }
    }

    // Set default start time to current time
    const now = new Date()
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15) // Round to next 15 minutes
    setReservationData((prev) => ({
      ...prev,
      startTime: now.toISOString().slice(0, 16),
    }))
  }, [lotId, slotId, router])

  const calculateEndTime = () => {
    if (!reservationData.startTime || !reservationData.duration) return null
    const start = new Date(reservationData.startTime)
    const end = new Date(start.getTime() + Number.parseInt(reservationData.duration) * 60 * 60 * 1000)
    return end
  }

  const calculateTotalCost = () => {
    if (!lot || !reservationData.duration) return 0
    return lot.pricePerHour * Number.parseInt(reservationData.duration)
  }

  const handleInputChange = (field: string, value: string) => {
    setReservationData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validate form
      if (!reservationData.startTime || !reservationData.duration || !reservationData.vehicleInfo) {
        throw new Error("Please fill in all required fields")
      }

      const startTime = new Date(reservationData.startTime)
      const now = new Date()

      if (startTime < now) {
        throw new Error("Start time cannot be in the past")
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create reservation
      const reservation: Reservation = {
        id: `res-${Date.now()}`,
        userId: user.email,
        slotId: slot?.id || "",
        lotId: lot?.id || "",
        startTime,
        endTime: calculateEndTime()!,
        status: "active",
        totalCost: calculateTotalCost(),
      }

      // Store reservation (in real app, this would be API call)
      const existingReservations = JSON.parse(localStorage.getItem("reservations") || "[]")
      existingReservations.push(reservation)
      localStorage.setItem("reservations", JSON.stringify(existingReservations))

      // Redirect to confirmation
      router.push(`/reserve/confirmation?reservationId=${reservation.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!lot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Parking lot not found.</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const endTime = calculateEndTime()
  const totalCost = calculateTotalCost()

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => router.back()} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Reserve Parking</h1>
            <p className="text-muted-foreground">Complete your reservation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reservation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Reservation Details</CardTitle>
                <CardDescription>Fill in your parking reservation information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        value={reservationData.startTime}
                        onChange={(e) => handleInputChange("startTime", e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration *</Label>
                      <Select
                        value={reservationData.duration}
                        onValueChange={(value) => handleInputChange("duration", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">30 minutes</SelectItem>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="2">2 hours</SelectItem>
                          <SelectItem value="3">3 hours</SelectItem>
                          <SelectItem value="4">4 hours</SelectItem>
                          <SelectItem value="6">6 hours</SelectItem>
                          <SelectItem value="8">8 hours</SelectItem>
                          <SelectItem value="12">12 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleInfo">Vehicle Information *</Label>
                    <Input
                      id="vehicleInfo"
                      placeholder="e.g., Toyota Camry - ABC123"
                      value={reservationData.vehicleInfo}
                      onChange={(e) => handleInputChange("vehicleInfo", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requirements or notes..."
                      value={reservationData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select
                      value={reservationData.paymentMethod}
                      onValueChange={(value) => handleInputChange("paymentMethod", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit-card">Credit Card</SelectItem>
                        <SelectItem value="debit-card">Debit Card</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="apple-pay">Apple Pay</SelectItem>
                        <SelectItem value="google-pay">Google Pay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Reserve & Pay ${totalCost.toFixed(2)}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Reservation Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold">{lot.name}</h3>
                  <p className="text-sm text-muted-foreground">{lot.address}</p>
                </div>
                {slot && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Slot:</span>
                    <Badge variant="outline">{slot.number}</Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rate:</span>
                  <span className="font-semibold">${lot.pricePerHour}/hour</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time & Duration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reservationData.startTime && (
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Start:</span>
                      <span className="font-semibold">{new Date(reservationData.startTime).toLocaleString()}</span>
                    </div>
                    {endTime && (
                      <div className="flex justify-between text-sm">
                        <span>End:</span>
                        <span className="font-semibold">{endTime.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Duration:</span>
                  <span className="font-semibold">
                    {reservationData.duration} hour{Number.parseInt(reservationData.duration) !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Parking fee:</span>
                  <span>${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service fee:</span>
                  <span>$0.50</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-primary">${(totalCost + 0.5).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {reservationData.vehicleInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{reservationData.vehicleInfo}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
