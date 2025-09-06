import { beforeAll, vi } from "vitest"
import "@testing-library/jest-dom"

// Mock environment variables
beforeAll(() => {
  vi.stubEnv("DATABASE_URL", "mysql://test:test@localhost:3306/test")
  vi.stubEnv("NEXTAUTH_SECRET", "test-secret")
  vi.stubEnv("NEXTAUTH_URL", "http://localhost:3000")
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
})