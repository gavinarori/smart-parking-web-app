"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { mockParkingLots } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Car, MapPin, Calendar } from "lucide-react"

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/login")
    }
  }, [router])

  // Mock analytics data
  const weeklyUsage = [
    { day: "Mon", reservations: 45, revenue: 225 },
    { day: "Tue", reservations: 52, revenue: 280 },
    { day: "Wed", reservations: 38, revenue: 190 },
    { day: "Thu", reservations: 61, revenue: 305 },
    { day: "Fri", reservations: 78, revenue: 390 },
    { day: "Sat", reservations: 85, revenue: 425 },
    { day: "Sun", reservations: 42, revenue: 210 },
  ]

  const monthlyTrends = [
    { month: "Jan", occupancy: 65, revenue: 12500 },
    { month: "Feb", occupancy: 72, revenue: 14200 },
    { month: "Mar", occupancy: 68, revenue: 13600 },
    { month: "Apr", occupancy: 75, revenue: 15000 },
    { month: "May", occupancy: 82, revenue: 16400 },
    { month: "Jun", occupancy: 78, revenue: 15600 },
  ]

  const lotPerformance = mockParkingLots.map((lot) => ({
    name: lot.name,
    occupancy: Math.round((lot.occupiedSlots / lot.totalSlots) * 100),
    revenue: lot.pricePerHour * lot.occupiedSlots * 8, // Assume 8 hours average
    totalSlots: lot.totalSlots,
  }))

  const peakHours = [
    { hour: "6 AM", usage: 15 },
    { hour: "7 AM", usage: 35 },
    { hour: "8 AM", usage: 75 },
    { hour: "9 AM", usage: 85 },
    { hour: "10 AM", usage: 65 },
    { hour: "11 AM", usage: 55 },
    { hour: "12 PM", usage: 70 },
    { hour: "1 PM", usage: 80 },
    { hour: "2 PM", usage: 60 },
    { hour: "3 PM", usage: 45 },
    { hour: "4 PM", usage: 55 },
    { hour: "5 PM", usage: 85 },
    { hour: "6 PM", usage: 90 },
    { hour: "7 PM", usage: 70 },
    { hour: "8 PM", usage: 40 },
  ]

  const statusDistribution = [
    { name: "Available", value: mockParkingLots.reduce((sum, lot) => sum + lot.availableSlots, 0), color: "#15803d" },
    { name: "Occupied", value: mockParkingLots.reduce((sum, lot) => sum + lot.occupiedSlots, 0), color: "#dc2626" },
    { name: "Reserved", value: mockParkingLots.reduce((sum, lot) => sum + lot.reservedSlots, 0), color: "#84cc16" },
  ]

  const totalRevenue = weeklyUsage.reduce((sum, day) => sum + day.revenue, 0)
  const totalReservations = weeklyUsage.reduce((sum, day) => sum + day.reservations, 0)
  const averageOccupancy = Math.round(
    lotPerformance.reduce((sum, lot) => sum + lot.occupancy, 0) / lotPerformance.length,
  )

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Parking system insights and performance metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +12.5% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{totalReservations}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +8.2% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Occupancy</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{averageOccupancy}%</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                -2.1% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockParkingLots.length}</div>
              <p className="text-xs text-muted-foreground">parking lots managed</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Reservations</CardTitle>
                  <CardDescription>Number of reservations per day this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="reservations" fill="#15803d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Slot Status Distribution</CardTitle>
                  <CardDescription>Current parking slot availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {statusDistribution.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm">
                          {entry.name}: {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Peak Usage Hours</CardTitle>
                <CardDescription>Parking usage throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="usage" stroke="#84cc16" fill="#84cc16" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Revenue</CardTitle>
                  <CardDescription>Daily revenue for this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                      <Bar dataKey="revenue" fill="#15803d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Revenue trends over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                      <Line type="monotone" dataKey="revenue" stroke="#15803d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Trends</CardTitle>
                <CardDescription>Monthly occupancy rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, "Occupancy"]} />
                    <Line type="monotone" dataKey="occupancy" stroke="#84cc16" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lotPerformance.map((lot) => (
                <Card key={lot.name}>
                  <CardHeader>
                    <CardTitle className="text-lg">{lot.name}</CardTitle>
                    <CardDescription>Performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Occupancy Rate</span>
                      <Badge variant={lot.occupancy > 80 ? "default" : lot.occupancy > 60 ? "secondary" : "outline"}>
                        {lot.occupancy}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Daily Revenue</span>
                      <span className="font-semibold">${lot.revenue}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Slots</span>
                      <span className="font-semibold">{lot.totalSlots}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${lot.occupancy}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
