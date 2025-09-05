// NAICS Code data structure
export interface NaicsCode {
  code: string
  title: string
  description: string
  category?: string
}

// Sample NAICS codes relevant to government contracting
export const NAICS_CODES: NaicsCode[] = [
  // Professional, Scientific, and Technical Services (541xxx)
  {
    code: "541511",
    title: "Custom Computer Programming Services",
    description: "This industry comprises establishments primarily engaged in writing, modifying, testing, and supporting software to meet the needs of a particular customer.",
    category: "Professional Services"
  },
  {
    code: "541512",
    title: "Computer Systems Design Services", 
    description: "This industry comprises establishments primarily engaged in planning and designing computer systems that integrate computer hardware, software, and communication technologies.",
    category: "Professional Services"
  },
  {
    code: "541513",
    title: "Computer Facilities Management Services",
    description: "This industry comprises establishments primarily engaged in providing on-site management and operation of clients' computer systems and/or data processing facilities.",
    category: "Professional Services"
  },
  {
    code: "541330",
    title: "Engineering Services",
    description: "This industry comprises establishments primarily engaged in providing engineering services.",
    category: "Professional Services"
  },
  {
    code: "541618",
    title: "Other Management Consulting Services",
    description: "This industry comprises establishments primarily engaged in providing management consulting services (except administrative and general management consulting; human resources consulting; marketing consulting; or process, physical distribution and logistics consulting).",
    category: "Professional Services"
  },
  {
    code: "541690",
    title: "Other Scientific and Technical Consulting Services",
    description: "This industry comprises establishments primarily engaged in providing advice and assistance to businesses and other organizations on scientific and technical issues (except law, engineering, architecture, mental health, facilities support, process, physical distribution and logistics, and other management consulting).",
    category: "Professional Services"
  },

  // Construction (23xxxx)
  {
    code: "236220",
    title: "Commercial and Institutional Building Construction",
    description: "This industry comprises establishments primarily engaged in the construction (including new work, additions, alterations, maintenance, and repairs) of commercial and institutional buildings and related structures.",
    category: "Construction"
  },
  {
    code: "237110",
    title: "Water and Sewer Line and Related Structures Construction", 
    description: "This industry comprises establishments primarily engaged in the construction of water and sewer lines, mains, pumping stations, and related water and sewer structures.",
    category: "Construction"
  },
  {
    code: "237310",
    title: "Highway, Street, and Bridge Construction",
    description: "This industry comprises establishments primarily engaged in the construction of highways, streets, roads, bridges, elevated highways, and related structures.",
    category: "Construction"
  },
  {
    code: "238210",
    title: "Electrical Contractors and Other Wiring Installation Contractors",
    description: "This industry comprises establishments primarily engaged in installing and servicing electrical wiring and equipment.",
    category: "Construction"
  },

  // Manufacturing (3xxxxx)
  {
    code: "336411",
    title: "Aircraft Manufacturing",
    description: "This industry comprises establishments primarily engaged in manufacturing or assembling complete aircraft.",
    category: "Manufacturing"
  },
  {
    code: "334511",
    title: "Search, Detection, Navigation, Guidance, Aeronautical, and Nautical System and Instrument Manufacturing",
    description: "This industry comprises establishments primarily engaged in manufacturing search, detection, navigation, guidance, aeronautical, and nautical systems and instruments.",
    category: "Manufacturing"
  },

  // Administrative and Support Services (561xxx)
  {
    code: "561210",
    title: "Facilities Support Services",
    description: "This industry comprises establishments primarily engaged in providing operating staff to perform a combination of support services within a client's facilities.",
    category: "Support Services"
  },
  {
    code: "561612",
    title: "Security Guards and Patrol Services",
    description: "This industry comprises establishments primarily engaged in providing guard and patrol services, such as bodyguard, guard dog, parking security and security guard services.",
    category: "Support Services"
  },
  {
    code: "561730",
    title: "Landscaping Services",
    description: "This industry comprises establishments primarily engaged in providing landscape care and maintenance services and/or installing trees, shrubs, plants, lawns, or gardens.",
    category: "Support Services"
  },

  // Health Care and Social Assistance (62xxxx)
  {
    code: "621111",
    title: "Offices of Physicians (except Mental Health Specialists)",
    description: "This industry comprises establishments of health practitioners having the degree of M.D. (Doctor of medicine) primarily engaged in the independent practice of general or specialized medicine.",
    category: "Healthcare"
  },

  // Transportation and Warehousing (48xxxx-49xxxx)
  {
    code: "481111",
    title: "Scheduled Passenger Air Transportation",
    description: "This industry comprises establishments primarily engaged in providing air transportation of passengers or passengers and freight over regular routes and on regular schedules.",
    category: "Transportation"
  },
  {
    code: "484110",
    title: "General Freight Trucking, Local",
    description: "This industry comprises establishments primarily engaged in providing local general freight trucking.",
    category: "Transportation"
  },

  // Information (51xxxx)
  {
    code: "518210",
    title: "Data Processing, Hosting, and Related Services",
    description: "This industry comprises establishments primarily engaged in providing infrastructure for hosting or data processing services.",
    category: "Information Technology"
  },

  // Retail Trade (44xxxx-45xxxx)
  {
    code: "423430",
    title: "Computer and Computer Peripheral Equipment and Software Merchant Wholesalers",
    description: "This industry comprises establishments primarily engaged in the merchant wholesale distribution of computers, computer peripheral equipment, loaded computer boards, and computer software.",
    category: "Wholesale Trade"
  },

  // Educational Services (61xxxx)
  {
    code: "611710",
    title: "Educational Support Services",
    description: "This industry comprises establishments primarily engaged in providing non-instructional services that support educational processes or systems.",
    category: "Education"
  }
]

/**
 * Search NAICS codes by query
 */
export function searchNaicsCodes(
  query: string = "",
  limit: number = 20,
  offset: number = 0
): { codes: NaicsCode[]; total: number } {
  if (!query || query.trim() === "") {
    // Return all codes if no query
    const codes = NAICS_CODES.slice(offset, offset + limit)
    return { codes, total: NAICS_CODES.length }
  }

  const searchQuery = query.toLowerCase().trim()
  
  // Search by code, title, or description
  const filteredCodes = NAICS_CODES.filter(naics =>
    naics.code === searchQuery ||
    naics.title.toLowerCase().includes(searchQuery) ||
    naics.description.toLowerCase().includes(searchQuery) ||
    (naics.category && naics.category.toLowerCase().includes(searchQuery))
  )

  const paginatedCodes = filteredCodes.slice(offset, offset + limit)
  
  return {
    codes: paginatedCodes,
    total: filteredCodes.length
  }
}

/**
 * Get NAICS code by exact code
 */
export function getNaicsCode(code: string): NaicsCode | undefined {
  return NAICS_CODES.find(naics => naics.code === code)
}

/**
 * Get multiple NAICS codes by codes array
 */
export function getNaicsCodes(codes: string[]): NaicsCode[] {
  return codes
    .map(code => getNaicsCode(code))
    .filter((naics): naics is NaicsCode => naics !== undefined)
}

/**
 * Validate NAICS code format
 */
export function isValidNaicsCode(code: string): boolean {
  return /^\d{6}$/.test(code)
}

/**
 * Validate multiple NAICS codes format
 */
export function areValidNaicsCodes(codes: string): boolean {
  if (!codes) return false
  const codesArray = codes.split(",")
  return codesArray.every(code => isValidNaicsCode(code.trim()))
}

/**
 * Format NAICS codes string to array
 */
export function parseNaicsCodes(codes: string | null): string[] {
  if (!codes) return []
  return codes.split(",").map(code => code.trim()).filter(Boolean)
}

/**
 * Format NAICS codes array to string
 */
export function formatNaicsCodes(codes: string[]): string {
  return codes.join(",")
}

/**
 * Get NAICS categories
 */
export function getNaicsCategories(): string[] {
  const categories = NAICS_CODES
    .map(naics => naics.category)
    .filter((category): category is string => category !== undefined)
  
  return Array.from(new Set(categories)).sort()
}

/**
 * Filter NAICS codes by category
 */
export function getNaicsByCategory(category: string): NaicsCode[] {
  return NAICS_CODES.filter(naics => naics.category === category)
}