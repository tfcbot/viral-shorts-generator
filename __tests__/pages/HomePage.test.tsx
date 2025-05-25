import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => 
    <a href={href} {...props}>{children}</a>,
}))

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-in-button">{children}</div>
  ),
  SignUpButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-up-button">{children}</div>
  ),
  useAuth: vi.fn(() => ({
    isSignedIn: false,
    userId: null,
  })),
}))

describe('Home Page', () => {
  it('should render the home page with main content', () => {
    render(<HomePage />)

    // Should render main heading
    expect(screen.getByText(/viral shorts generator/i)).toBeInTheDocument()
    
    // Should render description
    expect(screen.getByText(/create engaging short videos/i)).toBeInTheDocument()
    
    // Should render call-to-action buttons
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument()
    expect(screen.getByTestId('sign-up-button')).toBeInTheDocument()
  })

  it('should render feature highlights', () => {
    render(<HomePage />)

    // Should show key features
    expect(screen.getByText(/ai-powered/i)).toBeInTheDocument()
    expect(screen.getByText(/multiple formats/i)).toBeInTheDocument()
    expect(screen.getByText(/fast generation/i)).toBeInTheDocument()
  })

  it('should have proper navigation for authenticated users', () => {
    // Mock authenticated state
    const mockUseAuth = vi.mocked(require('@clerk/nextjs').useAuth)
    mockUseAuth.mockReturnValue({
      isSignedIn: true,
      userId: 'user_123',
    })

    render(<HomePage />)

    // Should show dashboard link for authenticated users
    const dashboardLink = screen.getByRole('link', { name: /go to dashboard/i })
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
  })

  it('should render hero section with proper styling', () => {
    render(<HomePage />)

    // Should have hero section
    const heroSection = screen.getByRole('main')
    expect(heroSection).toBeInTheDocument()
    
    // Should have gradient background
    expect(heroSection).toHaveClass('bg-gradient-to-br')
  })
})

