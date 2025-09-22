"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { PWAInstallButton } from "@/components/pwa-install-button"
import { mockParkingLots } from "@/lib/mock-data"
import { MapPin, Car, Clock, Map, BarChart3 } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  const totalAvailableSlots = mockParkingLots.reduce((sum, lot) => sum + lot.availableSlots, 0)
  const nearbyLots = mockParkingLots.slice(0, 3) // Show top 3 lots

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (loading || !user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">SmartPark Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}!</p>
          </div>
          <div className="flex gap-2">
            <PWAInstallButton />
            <NotificationsDropdown userId={user.email} />
            <Button asChild variant="outline">
              <Link href="/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/map">
                <Map className="h-4 w-4 mr-2" />
                Map View
              </Link>
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Available Spots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalAvailableSlots}</div>
              <p className="text-sm text-muted-foreground">spots available nearby</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">2</div>
              <p className="text-sm text-muted-foreground">current bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">$45.50</div>
              <p className="text-sm text-muted-foreground">total spent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" size="sm">
                <Link href="/parking">Find Parking</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent" size="sm">
                <Link href="/reservations">My Bookings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Nearby Parking Lots
            </CardTitle>
            <CardDescription>Real-time availability in your area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nearbyLots.map((lot) => (
                <div key={lot.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Car className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{lot.name}</h3>
                      <p className="text-sm text-muted-foreground">{lot.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">{lot.availableSlots} available</div>
                    <div className="text-sm text-muted-foreground">${lot.pricePerHour}/hour</div>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild className="w-full mt-4 bg-transparent" variant="outline">
              <Link href="/parking">View All Locations</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              System Features
            </CardTitle>
            <CardDescription>Available functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Real-time parking availability with Google Maps integration</li>
              <li>✓ Advanced parking spot reservations and payments</li>
              <li>✓ Push notifications for available spots and reminders</li>
              <li>✓ Detailed analytics and parking usage insights</li>
              <li>✓ Multi-location parking management system</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
