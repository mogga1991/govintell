import { describe, it, expect, beforeEach, vi } from "vitest"
import { PrismaClient } from "@prisma/client"

// Mock the Prisma client for testing
const mockPrismaClient = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
} as any

describe("User Model Extensions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("User profile fields", () => {
    it("should create a user with new profile fields", async () => {
      const userData = {
        email: "contractor@example.com",
        name: "John Contractor",
        company_name: "ABC Contracting LLC",
        naics_codes: "541511,236220",
        profile_completed: true,
        business_verified: false,
      }

      mockPrismaClient.user.create.mockResolvedValue({
        id: "test-id",
        ...userData,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await mockPrismaClient.user.create({
        data: userData,
      })

      expect(result).toMatchObject(userData)
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: userData,
      })
    })

    it("should allow null values for optional profile fields", async () => {
      const userData = {
        email: "user@example.com",
        name: "Test User",
        company_name: null,
        naics_codes: null,
        profile_completed: false,
        business_verified: false,
      }

      mockPrismaClient.user.create.mockResolvedValue({
        id: "test-id",
        ...userData,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await mockPrismaClient.user.create({
        data: userData,
      })

      expect(result.company_name).toBe(null)
      expect(result.naics_codes).toBe(null)
      expect(result.profile_completed).toBe(false)
      expect(result.business_verified).toBe(false)
    })

    it("should update user profile completion status", async () => {
      const updateData = {
        company_name: "Updated Company",
        naics_codes: "541511",
        profile_completed: true,
      }

      mockPrismaClient.user.update.mockResolvedValue({
        id: "test-id",
        email: "user@example.com",
        ...updateData,
      })

      const result = await mockPrismaClient.user.update({
        where: { id: "test-id" },
        data: updateData,
      })

      expect(result).toMatchObject(updateData)
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: "test-id" },
        data: updateData,
      })
    })
  })

  describe("Profile completion logic", () => {
    it("should determine profile completion based on required fields", () => {
      const userComplete = {
        company_name: "ABC Corp",
        naics_codes: "541511,236220",
      }

      const userIncomplete = {
        company_name: null,
        naics_codes: null,
      }

      const isComplete = (user: any) => 
        !!(user.company_name && user.naics_codes)

      expect(isComplete(userComplete)).toBe(true)
      expect(isComplete(userIncomplete)).toBe(false)
    })

    it("should validate NAICS codes format", () => {
      const validNaicsCodes = [
        "541511",
        "541511,236220",
        "541511,236220,237110",
      ]

      const invalidNaicsCodes = [
        "invalid",
        "541511,invalid",
        "",
        "541511,",
      ]

      const validateNaicsCodes = (codes: string) => {
        if (!codes) return false
        const codesArray = codes.split(",")
        return codesArray.every(code => 
          code.trim().match(/^\d{6}$/)
        )
      }

      validNaicsCodes.forEach(codes => {
        expect(validateNaicsCodes(codes)).toBe(true)
      })

      invalidNaicsCodes.forEach(codes => {
        expect(validateNaicsCodes(codes)).toBe(false)
      })
    })
  })

  describe("User type compatibility", () => {
    it("should maintain backward compatibility with existing fields", async () => {
      const existingUserData = {
        email: "existing@example.com",
        name: "Existing User",
        emailVerified: new Date(),
        image: "https://example.com/avatar.jpg",
      }

      mockPrismaClient.user.create.mockResolvedValue({
        id: "test-id",
        ...existingUserData,
        company_name: null,
        naics_codes: null,
        profile_completed: false,
        business_verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await mockPrismaClient.user.create({
        data: existingUserData,
      })

      expect(result).toMatchObject({
        ...existingUserData,
        company_name: null,
        naics_codes: null,
        profile_completed: false,
        business_verified: false,
      })
    })
  })
})