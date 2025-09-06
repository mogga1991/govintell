import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { UserProfile } from '@/types/user-profile'
import { ProfileProgressBanner, useProfileBannerDismissal } from '@/components/profile-progress-banner'

const mockUserComplete: UserProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  emailVerified: new Date(),
  image: null,
  company_name: 'Test Company',
  naics_codes: '541511,541512',
  psc_codes: 'D301,D307',
  createdAt: new Date(),
  updatedAt: new Date()
}

const mockUserIncomplete: UserProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  emailVerified: new Date(),
  image: null,
  company_name: null,
  naics_codes: null,
  psc_codes: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

const mockUserPartial: UserProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  emailVerified: new Date(),
  image: null,
  company_name: 'Test Company',
  naics_codes: null,
  psc_codes: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

// Mock Next.js navigation
const mockPush = vi.fn()
const mockPathname = '/dashboard'

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

describe('ProfileProgressBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when profile is complete', () => {
    const { container } = render(
      <ProfileProgressBanner user={mockUserComplete} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('should render banner when profile is incomplete', () => {
    render(<ProfileProgressBanner user={mockUserIncomplete} />)
    
    expect(screen.getByText(/complete your business profile/i)).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /complete now/i })).toBeInTheDocument()
  })

  it('should show correct percentage and message for partial completion', () => {
    render(<ProfileProgressBanner user={mockUserPartial} />)
    
    expect(screen.getByText(/33% complete/i)).toBeInTheDocument()
    expect(screen.getByText(/add your naics codes/i)).toBeInTheDocument()
  })

  it('should render dismiss button when dismissible is true', () => {
    render(
      <ProfileProgressBanner 
        user={mockUserIncomplete} 
        dismissible={true}
      />
    )
    
    expect(screen.getByRole('button', { name: /dismiss banner/i })).toBeInTheDocument()
  })

  it('should handle dismiss functionality', () => {
    const onDismiss = vi.fn()
    render(
      <ProfileProgressBanner 
        user={mockUserIncomplete} 
        dismissible={true}
        onDismiss={onDismiss}
      />
    )
    
    const dismissButton = screen.getByRole('button', { name: /dismiss banner/i })
    fireEvent.click(dismissButton)
    
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('should not show dismiss button when dismissible is false', () => {
    render(
      <ProfileProgressBanner 
        user={mockUserIncomplete} 
        dismissible={false}
      />
    )
    
    expect(screen.queryByRole('button', { name: /dismiss banner/i })).not.toBeInTheDocument()
  })

  it('should handle page visibility correctly', () => {
    // Test showOnPages prop
    const { rerender } = render(
      <ProfileProgressBanner 
        user={mockUserIncomplete}
        showOnPages={['/dashboard']}
      />
    )
    
    expect(screen.getByText(/complete your business profile/i)).toBeInTheDocument()
    
    // Test hideOnPages prop
    rerender(
      <ProfileProgressBanner 
        user={mockUserIncomplete}
        hideOnPages={['/dashboard']}
      />
    )
    
    expect(screen.queryByText(/complete your business profile/i)).not.toBeInTheDocument()
  })

  it('should generate correct message for missing fields', () => {
    // Test single missing field
    const userSingleMissing: UserProfile = {
      ...mockUserIncomplete,
      company_name: 'Test Company',
      naics_codes: '541511'
    }
    
    render(<ProfileProgressBanner user={userSingleMissing} />)
    expect(screen.getByText(/add your psc codes/i)).toBeInTheDocument()
    
    // Test multiple missing fields
    render(<ProfileProgressBanner user={mockUserIncomplete} />)
    expect(screen.getByText(/add your company name and naics codes/i)).toBeInTheDocument()
  })

  it('should have correct link to settings page', () => {
    render(<ProfileProgressBanner user={mockUserIncomplete} />)
    
    const completeLink = screen.getByRole('link', { name: /complete now/i })
    expect(completeLink).toHaveAttribute('href', '/dashboard/settings')
  })

  it('should apply custom className', () => {
    const customClass = 'custom-banner-class'
    render(
      <ProfileProgressBanner 
        user={mockUserIncomplete}
        className={customClass}
      />
    )
    
    const banner = screen.getByRole('alert')
    expect(banner).toHaveClass(customClass)
  })

  it('should hide when dismissed and dismissible is true', () => {
    const { rerender } = render(
      <ProfileProgressBanner 
        user={mockUserIncomplete} 
        dismissible={true}
      />
    )
    
    expect(screen.getByText(/complete your business profile/i)).toBeInTheDocument()
    
    const dismissButton = screen.getByRole('button', { name: /dismiss banner/i })
    fireEvent.click(dismissButton)
    
    // Re-render to trigger state update
    rerender(
      <ProfileProgressBanner 
        user={mockUserIncomplete} 
        dismissible={true}
      />
    )
    
    expect(screen.queryByText(/complete your business profile/i)).not.toBeInTheDocument()
  })
})

describe('useProfileBannerDismissal', () => {
  it('should handle banner dismissal state correctly', () => {
    const { result } = renderHook(() => useProfileBannerDismissal())
    
    // Initially, no banners should be dismissed
    expect(result.current.isBannerDismissed('banner1')).toBe(false)
    
    // Dismiss a banner
    act(() => {
      result.current.dismissBanner('banner1')
    })
    
    // Banner should now be dismissed
    expect(result.current.isBannerDismissed('banner1')).toBe(true)
    
    // Other banners should not be affected
    expect(result.current.isBannerDismissed('banner2')).toBe(false)
  })

  it('should not add duplicate dismissed banners', () => {
    const { result } = renderHook(() => useProfileBannerDismissal())
    
    // Dismiss the same banner multiple times
    act(() => {
      result.current.dismissBanner('banner1')
      result.current.dismissBanner('banner1')
      result.current.dismissBanner('banner1')
    })
    
    expect(result.current.isBannerDismissed('banner1')).toBe(true)
  })

  it('should handle multiple banner dismissals', () => {
    const { result } = renderHook(() => useProfileBannerDismissal())
    
    act(() => {
      result.current.dismissBanner('banner1')
      result.current.dismissBanner('banner2')
      result.current.dismissBanner('banner3')
    })
    
    expect(result.current.isBannerDismissed('banner1')).toBe(true)
    expect(result.current.isBannerDismissed('banner2')).toBe(true)
    expect(result.current.isBannerDismissed('banner3')).toBe(true)
    expect(result.current.isBannerDismissed('banner4')).toBe(false)
  })
})