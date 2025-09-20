"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import type { UserSession } from "@/lib/models/User"
import { getStoredToken, setStoredToken, removeStoredToken, isTokenExpired } from "@/lib/auth-client"

interface AuthContextType {
  user: UserSession | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

interface RegisterData {
  name: string
  email: string
  phone: string
  vehicleInfo: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check localStorage first
      const token = getStoredToken()
      if (token && !isTokenExpired(token)) {
        const response = await fetch("/api/auth/me", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // Token is invalid, remove it
          removeStoredToken()
        }
      } else if (token && isTokenExpired(token)) {
        // Token is expired, remove it
        removeStoredToken()
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      removeStoredToken()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Login failed")
    }

    // Store token in localStorage
    if (data.token) {
      setStoredToken(data.token)
    }
    setUser(data.user)
  }

  const register = async (userData: RegisterData) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Registration failed")
    }

    // Store token in localStorage
    if (data.token) {
      setStoredToken(data.token)
    }
    setUser(data.user)
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    // Clear token from localStorage
    removeStoredToken()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
