import { NextRequest, NextResponse } from "next/server"
import { searchPscCodes, PSC_CODES, type PscCode } from "@/lib/psc-data"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const category = searchParams.get("category")
    const limit = parseInt(searchParams.get("limit") || "50")

    let results: PscCode[] = []

    if (query) {
      // Search PSC codes by query
      results = searchPscCodes(query)
    } else if (category) {
      // Filter by category
      results = PSC_CODES.filter(psc => 
        psc.category?.toLowerCase() === category.toLowerCase()
      )
    } else {
      // Return all PSC codes
      results = PSC_CODES
    }

    // Limit results
    results = results.slice(0, limit)

    return NextResponse.json({
      success: true,
      psc_codes: results,
      total: results.length
    })
  } catch (error) {
    console.error("PSC search error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to search PSC codes",
        psc_codes: [],
        total: 0
      },
      { status: 500 }
    )
  }
}