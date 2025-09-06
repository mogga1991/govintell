import { getServerSession } from "next-auth/next"
import { headers, cookies } from "next/headers"

import { authOptions } from "@/lib/auth"

export async function getCurrentUser() {
  // Pre-await the dynamic APIs to avoid Next.js 15 compatibility issues
  await headers()
  await cookies()
  
  const session = await getServerSession(authOptions)

  return session?.user
}
