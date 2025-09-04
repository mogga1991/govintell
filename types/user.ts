import { User } from "@prisma/client"

// Extended user type with profile completion status
export type UserWithProfile = User & {
  profileCompletionPercentage: number
  missingFields: string[]
}

// User profile update data
export interface UserProfileUpdate {
  company_name?: string
  naics_codes?: string
}

// User profile status for frontend components
export interface UserProfileStatus {
  profile_completed: boolean
  business_verified: boolean
  missing_fields: string[]
  completion_percentage: number
}

// NAICS code structure for frontend
export interface NaicsCode {
  code: string
  title: string
  description: string
}

// Form validation types
export interface UserProfileFormData {
  company_name: string
  naics_codes: string
}

// API response types
export interface ProfileStatusResponse {
  profile_completed: boolean
  missing_fields: string[]
  completion_percentage: number
}

export interface ProfileUpdateResponse {
  success: boolean
  user: {
    company_name: string
    naics_codes: string
    profile_completed: boolean
  }
}

export interface NaicsSearchResponse {
  naics_codes: NaicsCode[]
}

// Utility type for profile completion logic
export type ProfileRequiredFields = "company_name" | "naics_codes"

export const REQUIRED_PROFILE_FIELDS: ProfileRequiredFields[] = [
  "company_name", 
  "naics_codes"
]

// Helper function type definitions
export type ProfileCompletionChecker = (user: User) => {
  isComplete: boolean
  missingFields: string[]
  completionPercentage: number
}