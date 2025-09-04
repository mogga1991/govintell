import { beforeAll, vi } from "vitest"

// Mock environment variables
beforeAll(() => {
  vi.stubEnv("DATABASE_URL", "mysql://test:test@localhost:3306/test")
  vi.stubEnv("NEXTAUTH_SECRET", "test-secret")
  vi.stubEnv("NEXTAUTH_URL", "http://localhost:3000")
})