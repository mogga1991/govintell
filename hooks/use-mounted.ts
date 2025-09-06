import { useEffect, useState } from 'react'

/**
 * Hook to check if component is mounted on client side.
 * Useful for avoiding hydration mismatches with SSR.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}