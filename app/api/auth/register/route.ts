import { type NextRequest, NextResponse } from "next/server"
import { createUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, rfidTag, vehicleInfo, password } =
      await request.json()

    if (!name || !email || !phone || !rfidTag || !vehicleInfo || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const user = await createUser({
      name,
      email,
      phone,
      rfidTag,
      vehicleInfo,
      password,
    })

    const userSession = {
      id: user._id!.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      rfidTag: user.rfidTag,
      vehicleInfo: user.vehicleInfo,
    }

    const token = generateToken(userSession)

    const response = NextResponse.json({
      message: "Registration successful",
      user: userSession,
      token,
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)

    if (error instanceof Error && error.message === "User already exists") {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
