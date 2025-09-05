import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock NAICS data for testing
const mockNaicsData = [
  {
    code: "541511",
    title: "Custom Computer Programming Services",
    description: "This industry comprises establishments primarily engaged in writing, modifying, testing, and supporting software to meet the needs of a particular customer."
  },
  {
    code: "236220",
    title: "Commercial and Institutional Building Construction",
    description: "This industry comprises establishments primarily engaged in the construction (including new work, additions, alterations, maintenance, and repairs) of commercial and institutional buildings and related structures."
  },
  {
    code: "237110",
    title: "Water and Sewer Line and Related Structures Construction",
    description: "This industry comprises establishments primarily engaged in the construction of water and sewer lines, mains, pumping stations, and related water and sewer structures."
  },
  {
    code: "541330",
    title: "Engineering Services",
    description: "This industry comprises establishments primarily engaged in providing engineering services."
  },
  {
    code: "541618",
    title: "Other Management Consulting Services",
    description: "This industry comprises establishments primarily engaged in providing management consulting services (except administrative and general management consulting; human resources consulting; marketing consulting; or process, physical distribution and logistics consulting)."
  }
]

describe("NAICS Code Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("NAICS Search Functionality", () => {
    it("should search NAICS codes by title", () => {
      const searchTerm = "computer"
      const results = mockNaicsData.filter(naics =>
        naics.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        naics.description.toLowerCase().includes(searchTerm.toLowerCase())
      )

      expect(results).toHaveLength(1)
      expect(results[0].code).toBe("541511")
      expect(results[0].title).toContain("Computer Programming")
    })

    it("should search NAICS codes by description", () => {
      const searchTerm = "construction"
      const results = mockNaicsData.filter(naics =>
        naics.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        naics.description.toLowerCase().includes(searchTerm.toLowerCase())
      )

      expect(results.length).toBeGreaterThan(1)
      expect(results.some(r => r.code === "236220")).toBe(true)
      expect(results.some(r => r.code === "237110")).toBe(true)
    })

    it("should search NAICS codes by exact code", () => {
      const searchTerm = "541511"
      const results = mockNaicsData.filter(naics =>
        naics.code === searchTerm
      )

      expect(results).toHaveLength(1)
      expect(results[0].code).toBe("541511")
    })

    it("should return empty array for no matches", () => {
      const searchTerm = "nonexistent"
      const results = mockNaicsData.filter(naics =>
        naics.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        naics.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        naics.code === searchTerm
      )

      expect(results).toHaveLength(0)
    })

    it("should limit search results", () => {
      const searchTerm = "" // Empty search should return all
      const limit = 3
      const results = mockNaicsData.slice(0, limit)

      expect(results).toHaveLength(3)
    })

    it("should handle case-insensitive search", () => {
      const searchTerms = ["COMPUTER", "computer", "Computer", "CoMpUtEr"]
      
      searchTerms.forEach(searchTerm => {
        const results = mockNaicsData.filter(naics =>
          naics.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          naics.description.toLowerCase().includes(searchTerm.toLowerCase())
        )

        expect(results).toHaveLength(1)
        expect(results[0].code).toBe("541511")
      })
    })
  })

  describe("NAICS Code Validation", () => {
    it("should validate correct NAICS code format", () => {
      const validCodes = [
        "541511",
        "236220",
        "123456",
        "000000",
        "999999"
      ]

      const validateNaicsCode = (code: string) => {
        return /^\d{6}$/.test(code)
      }

      validCodes.forEach(code => {
        expect(validateNaicsCode(code)).toBe(true)
      })
    })

    it("should reject invalid NAICS code formats", () => {
      const invalidCodes = [
        "12345",   // too short
        "1234567", // too long
        "abcdef",  // letters
        "541a11",  // mixed
        "",        // empty
        "541-511", // with dash
        " 541511", // with space
        "541511 ", // trailing space
      ]

      const validateNaicsCode = (code: string) => {
        return /^\d{6}$/.test(code)
      }

      invalidCodes.forEach(code => {
        expect(validateNaicsCode(code)).toBe(false)
      })
    })

    it("should validate multiple NAICS codes", () => {
      const validMultipleCodes = [
        "541511,236220",
        "541511,236220,237110",
        "123456",
      ]

      const invalidMultipleCodes = [
        "541511,invalid",
        "541511,",
        ",541511", 
        "541511,,236220",
      ]

      const validateMultipleNaicsCodes = (codes: string) => {
        if (!codes) return false
        const codesArray = codes.split(",")
        return codesArray.every(code => {
          const trimmedCode = code.trim()
          return trimmedCode.length > 0 && /^\d{6}$/.test(trimmedCode)
        })
      }

      validMultipleCodes.forEach(codes => {
        expect(validateMultipleNaicsCodes(codes)).toBe(true)
      })

      invalidMultipleCodes.forEach(codes => {
        expect(validateMultipleNaicsCodes(codes)).toBe(false)
      })
    })
  })

  describe("NAICS Data Structure", () => {
    it("should have correct NAICS code structure", () => {
      const naicsCode = mockNaicsData[0]
      
      expect(naicsCode).toHaveProperty("code")
      expect(naicsCode).toHaveProperty("title")
      expect(naicsCode).toHaveProperty("description")
      
      expect(typeof naicsCode.code).toBe("string")
      expect(typeof naicsCode.title).toBe("string")
      expect(typeof naicsCode.description).toBe("string")
      
      expect(naicsCode.code).toHaveLength(6)
      expect(/^\d{6}$/.test(naicsCode.code)).toBe(true)
    })

    it("should format NAICS codes for display", () => {
      const formatNaicsForDisplay = (naics: typeof mockNaicsData[0]) => {
        return `${naics.code} - ${naics.title}`
      }

      const formatted = formatNaicsForDisplay(mockNaicsData[0])
      expect(formatted).toBe("541511 - Custom Computer Programming Services")
    })

    it("should group NAICS codes by category", () => {
      const groupByCategory = (codes: typeof mockNaicsData) => {
        return codes.reduce((acc, code) => {
          const category = code.code.substring(0, 3) // First 3 digits
          if (!acc[category]) acc[category] = []
          acc[category].push(code)
          return acc
        }, {} as Record<string, typeof mockNaicsData>)
      }

      const grouped = groupByCategory(mockNaicsData)
      
      expect(grouped["541"]).toHaveLength(3) // Three 541xxx codes
      expect(grouped["236"]).toHaveLength(1) // One 236xxx code
      expect(grouped["237"]).toHaveLength(1) // One 237xxx code
    })
  })

  describe("NAICS Selection Component Logic", () => {
    it("should handle single selection", () => {
      let selectedCodes: string[] = []
      
      const selectCode = (code: string) => {
        selectedCodes = [code]
      }

      selectCode("541511")
      expect(selectedCodes).toEqual(["541511"])
      
      selectCode("236220")
      expect(selectedCodes).toEqual(["236220"])
    })

    it("should handle multiple selection", () => {
      let selectedCodes: string[] = []
      
      const toggleCode = (code: string) => {
        if (selectedCodes.includes(code)) {
          selectedCodes = selectedCodes.filter(c => c !== code)
        } else {
          selectedCodes.push(code)
        }
      }

      toggleCode("541511")
      expect(selectedCodes).toEqual(["541511"])
      
      toggleCode("236220")
      expect(selectedCodes).toEqual(["541511", "236220"])
      
      toggleCode("541511") // Remove first one
      expect(selectedCodes).toEqual(["236220"])
    })

    it("should convert selected codes to string format", () => {
      const selectedCodes = ["541511", "236220", "237110"]
      const codesString = selectedCodes.join(",")
      
      expect(codesString).toBe("541511,236220,237110")
    })

    it("should parse codes string to array", () => {
      const codesString = "541511,236220,237110"
      const selectedCodes = codesString.split(",").filter(Boolean)
      
      expect(selectedCodes).toEqual(["541511", "236220", "237110"])
    })

    it("should handle empty codes string", () => {
      const codesString = ""
      const selectedCodes = codesString.split(",").filter(Boolean)
      
      expect(selectedCodes).toEqual([])
    })
  })

  describe("API Response Format", () => {
    it("should format API response correctly", () => {
      const searchQuery = "computer"
      const results = mockNaicsData.filter(naics =>
        naics.title.toLowerCase().includes(searchQuery.toLowerCase())
      )

      const apiResponse = {
        success: true,
        query: searchQuery,
        results: results.length,
        naics_codes: results,
      }

      expect(apiResponse.success).toBe(true)
      expect(apiResponse.query).toBe(searchQuery)
      expect(apiResponse.results).toBe(1)
      expect(apiResponse.naics_codes).toHaveLength(1)
      expect(apiResponse.naics_codes[0]).toEqual(mockNaicsData[0])
    })

    it("should handle pagination in API response", () => {
      const page = 1
      const limit = 2
      const offset = (page - 1) * limit
      
      const paginatedResults = mockNaicsData.slice(offset, offset + limit)
      
      const apiResponse = {
        success: true,
        naics_codes: paginatedResults,
        pagination: {
          page,
          limit,
          total: mockNaicsData.length,
          pages: Math.ceil(mockNaicsData.length / limit),
        },
      }

      expect(apiResponse.naics_codes).toHaveLength(2)
      expect(apiResponse.pagination.page).toBe(1)
      expect(apiResponse.pagination.total).toBe(5)
      expect(apiResponse.pagination.pages).toBe(3)
    })
  })
})