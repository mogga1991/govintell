import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT as BaseJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      company_name?: string | null
      naics_codes?: string | null
      psc_codes?: string | null
      profile_completed: boolean
      business_verified: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    company_name?: string | null
    naics_codes?: string | null
    psc_codes?: string | null
    profile_completed: boolean
    business_verified: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT extends BaseJWT {
    id: string
    company_name?: string | null
    naics_codes?: string | null
    psc_codes?: string | null
    profile_completed: boolean
    business_verified: boolean
  }
}
