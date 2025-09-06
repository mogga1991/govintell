import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { searchNaicsCodes, getNaicsCategories } from "@/lib/naics-data"

// Query parameter validation schema
const searchParamsSchema = z.object({
  q: z.string().optional(),
  query: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  page: z.coerce.number().min(1).optional().default(1),
  offset: z.coerce.number().min(0).optional(),
  category: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const params = searchParamsSchema.parse({
      q: searchParams.get("q") || undefined,
      query: searchParams.get("query") || undefined, 
      limit: searchParams.get("limit") || undefined,
      page: searchParams.get("page") || undefined,
      offset: searchParams.get("offset") || undefined,
      category: searchParams.get("category") || undefined,
    })

    // Use either 'q' or 'query' parameter for search
    const query = params.q || params.query || ""
    
    // Calculate offset from page if not provided directly
    const offset = params.offset ?? (params.page - 1) * params.limit
    
    // Search NAICS codes
    const result = searchNaicsCodes(query, params.limit, offset)
    
    // Filter by category if specified
    let filteredCodes = result.codes
    if (params.category) {
      filteredCodes = result.codes.filter(code => 
        code.category?.toLowerCase() === params.category?.toLowerCase()
      )
    }

    // Calculate pagination info
    const totalPages = Math.ceil(result.total / params.limit)
    const hasNextPage = params.page < totalPages
    const hasPrevPage = params.page > 1

    return NextResponse.json({
      success: true,
      query,
      category: params.category,
      results: filteredCodes.length,
      naics_codes: filteredCodes,
      pagination: {
        page: params.page,
        limit: params.limit,
        offset,
        total: result.total,
        pages: totalPages,
        has_next: hasNextPage,
        has_prev: hasPrevPage,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          code: "INVALID_PARAMS",
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error("NAICS search error:", error)
    return NextResponse.json(
      { error: "Internal server error", code: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}

// Also support POST for complex search queries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const searchSchema = z.object({
      query: z.string().optional().default(""),
      limit: z.number().min(1).max(100).optional().default(20),
      offset: z.number().min(0).optional().default(0),
      category: z.string().optional(),
      codes: z.array(z.string()).optional(), // Search for specific codes
    })

    const params = searchSchema.parse(body)
    
    // If specific codes are requested, return those
    if (params.codes && params.codes.length > 0) {
      const { getNaicsCodes } = await import("@/lib/naics-data")
      const foundCodes = getNaicsCodes(params.codes)
      
      return NextResponse.json({
        success: true,
        query: params.query,
        requested_codes: params.codes,
        results: foundCodes.length,
        naics_codes: foundCodes,
      })
    }

    // Otherwise perform search
    const result = searchNaicsCodes(params.query, params.limit, params.offset)
    
    let filteredCodes = result.codes
    if (params.category) {
      filteredCodes = result.codes.filter(code => 
        code.category?.toLowerCase() === params.category?.toLowerCase()
      )
    }

    return NextResponse.json({
      success: true,
      query: params.query,
      category: params.category,
      results: filteredCodes.length,
      naics_codes: filteredCodes,
      total: result.total,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          code: "INVALID_BODY",
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error("NAICS search error:", error)
    return NextResponse.json(
      { error: "Internal server error", code: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}

// GET /api/naics/search/categories - Get all available categories
export async function OPTIONS(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  if (searchParams.get("action") === "categories") {
    try {
      const categories = getNaicsCategories()
      
      return NextResponse.json({
        success: true,
        categories,
      })
    } catch (error) {
      console.error("NAICS categories error:", error)
      return NextResponse.json(
        { error: "Internal server error", code: "SERVER_ERROR" },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(
    { error: "Not found", code: "NOT_FOUND" },
    { status: 404 }
  )
}