export interface UserProfile {
  id: string
  name?: string | null
  email?: string | null
  company_name?: string | null
  naics_codes?: string | null
  psc_codes?: string | null
  location?: string | null
  state?: string | null
  city?: string | null
  business_type?: string | null
  profile_completed: boolean
  business_verified: boolean
  createdAt?: Date
  updatedAt?: Date
}