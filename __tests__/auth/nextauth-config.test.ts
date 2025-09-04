import { describe, it, expect, vi, beforeEach } from "vitest"
import { authOptions } from "@/lib/auth"

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

vi.mock("@/env.mjs", () => ({
  env: {
    GITHUB_CLIENT_ID: "test_github_client_id",
    GITHUB_CLIENT_SECRET: "test_github_client_secret",
    POSTMARK_API_TOKEN: "test_postmark_token",
    SMTP_FROM: "noreply@test.com",
    POSTMARK_SIGN_IN_TEMPLATE: "123",
    POSTMARK_ACTIVATION_TEMPLATE: "456",
  },
}))

vi.mock("@/config/site", () => ({
  siteConfig: {
    name: "Test Site",
  },
}))

vi.mock("postmark", () => ({
  Client: vi.fn().mockImplementation(() => ({
    sendEmailWithTemplate: vi.fn().mockResolvedValue({ ErrorCode: 0 }),
  })),
}))

describe("NextAuth Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Auth Options", () => {
    it("should have correct basic configuration", () => {
      expect(authOptions.session.strategy).toBe("jwt")
      expect(authOptions.pages?.signIn).toBe("/login")
      expect(authOptions.providers).toHaveLength(3) // GitHub, Credentials, Email
    })

    it("should include GitHub provider with correct config", () => {
      const githubProvider = authOptions.providers.find(
        (p: any) => p.id === "github"
      )
      expect(githubProvider).toBeDefined()
      expect(githubProvider?.options?.clientId).toBe("test_github_client_id")
      expect(githubProvider?.options?.clientSecret).toBe("test_github_client_secret")
    })

    it("should include Email provider with correct config", () => {
      const emailProvider = authOptions.providers.find(
        (p: any) => p.id === "email"
      )
      expect(emailProvider).toBeDefined()
      expect(emailProvider?.options?.from).toBe("noreply@test.com")
    })

    it("should include Credentials provider with correct config", () => {
      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === "credentials"
      )
      expect(credentialsProvider).toBeDefined()
      expect(credentialsProvider?.name).toBe("Credentials")
      expect(credentialsProvider?.options?.credentials).toBeDefined()
    })
  })

  describe("JWT Callback", () => {
    it("should return token with user id when no db user found", async () => {
      const { db } = await import("@/lib/db")
      db.user.findFirst = vi.fn().mockResolvedValue(null)

      const mockUser = { id: "test-user-id" }
      const mockToken = { email: "test@example.com" }

      const result = await authOptions.callbacks?.jwt?.({
        token: mockToken,
        user: mockUser,
        account: null,
        profile: undefined,
        trigger: "signIn",
        isNewUser: false,
        session: undefined,
      })

      expect(result).toEqual({
        ...mockToken,
        id: "test-user-id",
      })
    })

    it("should return token with db user data when user exists", async () => {
      const { db } = await import("@/lib/db")
      const mockDbUser = {
        id: "db-user-id",
        name: "John Contractor",
        email: "john@contractor.com",
        image: "https://example.com/avatar.jpg",
        company_name: "ABC Contracting",
        naics_codes: "541511,236220",
        profile_completed: true,
        business_verified: false,
      }

      db.user.findFirst = vi.fn().mockResolvedValue(mockDbUser)

      const mockToken = { 
        email: "john@contractor.com",
        sub: "existing-id" 
      }

      const result = await authOptions.callbacks?.jwt?.({
        token: mockToken,
        user: null,
        account: null,
        profile: undefined,
        trigger: "update",
        isNewUser: false,
        session: undefined,
      })

      expect(result).toEqual({
        ...mockToken,
        id: mockDbUser.id,
        name: mockDbUser.name,
        email: mockDbUser.email,
        picture: mockDbUser.image,
        company_name: mockDbUser.company_name,
        naics_codes: mockDbUser.naics_codes,
        profile_completed: mockDbUser.profile_completed,
        business_verified: mockDbUser.business_verified,
      })
    })
  })

  describe("Session Callback", () => {
    it("should populate session user with token data", async () => {
      const mockToken = {
        id: "user-123",
        name: "Jane Contractor",
        email: "jane@example.com",
        picture: "https://example.com/jane.jpg",
        company_name: "XYZ Corp",
        naics_codes: "541511",
        profile_completed: true,
        business_verified: false,
      }

      const mockSession = {
        user: {
          name: "Old Name",
          email: "old@email.com",
          image: null,
        },
        expires: "2024-01-01",
      }

      const result = await authOptions.callbacks?.session?.({
        session: mockSession,
        token: mockToken,
        user: undefined,
      })

      expect(result.user).toEqual({
        id: mockToken.id,
        name: mockToken.name,
        email: mockToken.email,
        image: mockToken.picture,
        company_name: mockToken.company_name,
        naics_codes: mockToken.naics_codes,
        profile_completed: mockToken.profile_completed,
        business_verified: mockToken.business_verified,
      })
    })
  })

  describe("Provider Integration", () => {
    it("should handle email verification flow correctly", async () => {
      const { Client } = await import("postmark")
      const mockClient = new Client("test-token")
      
      const emailProvider = authOptions.providers.find(
        (p: any) => p.id === "email"
      )
      
      expect(emailProvider?.options?.sendVerificationRequest).toBeDefined()
      expect(typeof emailProvider?.options?.sendVerificationRequest).toBe("function")
    })
  })
})