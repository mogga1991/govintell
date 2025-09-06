import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { User } from '@prisma/client'
import { ProfileCompletionCard } from '@/components/profile-completion-card'

const mockUserComplete: User = {
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

const mockUserIncomplete: User = {
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

const mockUserPartial: User = {
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

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

describe('ProfileCompletionCard', () => {
  it('should not render when profile is complete', () => {
    const { container } = render(
      <ProfileCompletionCard user={mockUserComplete} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render progress bar and missing fields when profile is incomplete', () => {
    render(<ProfileCompletionCard user={mockUserIncomplete} />)
    
    expect(screen.getByText(/complete your profile/i)).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('should show correct percentage for partial completion', () => {
    render(<ProfileCompletionCard user={mockUserPartial} />)
    
    expect(screen.getByText('33%')).toBeInTheDocument()
    expect(screen.getByText(/company name/i)).not.toBeInTheDocument()
    expect(screen.getByText(/NAICS codes/i)).toBeInTheDocument()
  })

  it('should render complete profile button', () => {
    render(<ProfileCompletionCard user={mockUserIncomplete} />)
    
    const completeButton = screen.getByRole('link', { name: /complete profile/i })
    expect(completeButton).toHaveAttribute('href', '/dashboard/settings')
  })

  it('should be dismissible when dismissible prop is true', () => {
    const onDismiss = vi.fn()
    render(
      <ProfileCompletionCard 
        user={mockUserIncomplete} 
        dismissible={true}
        onDismiss={onDismiss}
      />
    )
    
    const dismissButton = screen.getByRole('button', { name: /dismiss/i })
    fireEvent.click(dismissButton)
    
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('should not show dismiss button when dismissible is false', () => {
    render(
      <ProfileCompletionCard 
        user={mockUserIncomplete} 
        dismissible={false}
      />
    )
    
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
  })

  it('should render custom title when provided', () => {
    const customTitle = 'Custom Profile Title'
    render(
      <ProfileCompletionCard 
        user={mockUserIncomplete} 
        title={customTitle}
      />
    )
    
    expect(screen.getByText(customTitle)).toBeInTheDocument()
  })

  it('should show compact view when compact prop is true', () => {
    render(
      <ProfileCompletionCard 
        user={mockUserIncomplete} 
        compact={true}
      />
    )
    
    // In compact mode, missing fields details should not be shown
    expect(screen.queryByText(/add the following/i)).not.toBeInTheDocument()
  })

  it('should show different variants correctly', () => {
    const { rerender } = render(
      <ProfileCompletionCard 
        user={mockUserIncomplete} 
        variant="default"
      />
    )
    
    expect(screen.getByRole('alert')).toBeInTheDocument()
    
    rerender(
      <ProfileCompletionCard 
        user={mockUserIncomplete} 
        variant="minimal"
      />
    )
    
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should handle missing fields correctly', () => {
    render(<ProfileCompletionCard user={mockUserIncomplete} />)
    
    // Should show all missing required fields
    const fieldNames = ['company name', 'NAICS codes']
    fieldNames.forEach(field => {
      expect(screen.getByText(new RegExp(field, 'i'))).toBeInTheDocument()
    })
  })

  it('should apply custom className', () => {
    const customClass = 'custom-test-class'
    render(
      <ProfileCompletionCard 
        user={mockUserIncomplete} 
        className={customClass}
      />
    )
    
    const card = screen.getByRole('alert')
    expect(card).toHaveClass(customClass)
  })
})