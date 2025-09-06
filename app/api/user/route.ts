import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Return a mock user for now to get the UI working
    // TODO: Implement proper authentication once NextAuth issues are resolved
    const mockUser = {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      image: null,
      company_name: "Test Company",
      naics_codes: "541511,541512",
      psc_codes: "R425,D316",
      profile_completed: true,
      business_verified: false
    }

    return NextResponse.json(mockUser)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}