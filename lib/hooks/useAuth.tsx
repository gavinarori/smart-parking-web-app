"use client"

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react"
import type { UserSession } from "@/lib/models/User"
import {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  isTokenExpired,
} from "@/lib/auth-client"

/* ------------------ TYPES ------------------ */

interface AuthContextType {
  user: UserSession | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  phone: string
  vehicleInfo: string
  rfidTag: string
  password: string
}

/* ------------------ CONTEXT ------------------ */

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/* ------------------ PROVIDER ------------------ */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  /* ------------------ CHECK AUTH ON LOAD ------------------ */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getStoredToken()

        if (!token) {
          setUser(null)
          return
        }

        if (isTokenExpired(token)) {
          removeStoredToken()
          setUser(null)
          return
        }

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          removeStoredToken()
          setUser(null)
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error("Auth check failed:", error)
        removeStoredToken()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  /* ------------------ LOGIN ------------------ */
  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Login failed")
    }

    if (data.token) {
      setStoredToken(data.token)
    }

    setUser(data.user)
  }

  /* ------------------ REGISTER ------------------ */
  const register = async (userData: RegisterData) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Registration failed")
    }

    if (data.token) {
      setStoredToken(data.token)
    }

    setUser(data.user)
  }

  /* ------------------ LOGOUT ------------------ */
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } finally {
      removeStoredToken()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/* ------------------ HOOK ------------------ */

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}