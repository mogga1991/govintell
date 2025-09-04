import { User } from "next-auth"
import { JWT } from "next-auth/jwt"

type UserId = string

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId
    company_name?: string
    naics_codes?: string
    profile_completed: boolean
    business_verified: boolean
  }
}

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId
      company_name?: string
      naics_codes?: string
      profile_completed: boolean
      business_verified: boolean
    }
  }

  interface User {
    id: UserId
    company_name?: string
    naics_codes?: string
    profile_completed: boolean
    business_verified: boolean
  }
}
