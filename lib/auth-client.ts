// Client-side auth utilities (no server dependencies)
export interface UserSession {
  id: string
  email: string
  name: string
  phone: string
  vehicleInfo: string
}

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth-token')
}

export const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('auth-token', token)
}

export const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth-token')
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch {
    return true
  }
}
