import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

// Mark route as dynamic (prevents static rendering error)
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token =
      authHeader?.replace("Bearer ", "") ||
      request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
