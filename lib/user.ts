import { User } from "@prisma/client"
import { REQUIRED_PROFILE_FIELDS, ProfileRequiredFields } from "@/types/user"

/**
 * Check if user profile is complete based on required fields
 */
export function checkProfileCompletion(user: User) {
  const missingFields: string[] = []
  
  REQUIRED_PROFILE_FIELDS.forEach((field: ProfileRequiredFields) => {
    if (!user[field]) {
      missingFields.push(field)
    }
  })

  const completionPercentage = Math.round(
    ((REQUIRED_PROFILE_FIELDS.length - missingFields.length) / REQUIRED_PROFILE_FIELDS.length) * 100
  )

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage,
  }
}

/**
 * Validate NAICS codes format
 */
export function validateNaicsCodes(codes: string): boolean {
  if (!codes) return false
  
  const codesArray = codes.split(",")
  return codesArray.every(code => 
    code.trim().match(/^\d{6}$/)
  )
}

/**
 * Format NAICS codes for display
 */
export function formatNaicsCodes(codes: string | null): string[] {
  if (!codes) return []
  return codes.split(",").map(code => code.trim()).filter(Boolean)
}

/**
 * Get user display name with fallback
 */
export function getUserDisplayName(user: User): string {
  return user.name || user.email?.split("@")[0] || "User"
}

/**
 * Get company display name with fallback
 */
export function getCompanyDisplayName(user: User): string {
  return user.company_name || "Your Company"
}