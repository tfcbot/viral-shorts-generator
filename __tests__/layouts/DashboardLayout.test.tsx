import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardLayout from '@/app/dashboard/layout'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => 
    <a href={href} {...props}>{children}</a>,
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}))

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
  UserButton: () => <div data-testid="user-button">User Button</div>,
}))

describe('Dashboard Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the dashboard layout with navigation', () => {
    render(
      <DashboardLayout>
        <div data-testid="dashboard-content">Dashboard Content</div>
      </DashboardLayout>
    )

    // Should render navigation elements
    expect(screen.getByText('Viral Shorts Generator')).toBeInTheDocument()
    expect(screen.getByText('Studio')).toBeInTheDocument()
    expect(screen.getByText('Videos')).toBeInTheDocument()
    
    // Should render user button
    expect(screen.getByTestId('user-button')).toBeInTheDocument()
    
    // Should render children
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
  })

  it('should render navigation links with correct hrefs', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    )

    const studioLink = screen.getByRole('link', { name: /studio/i })
    const videosLink = screen.getByRole('link', { name: /videos/i })

    expect(studioLink).toHaveAttribute('href', '/dashboard/studio')
    expect(videosLink).toHaveAttribute('href', '/dashboard/videos')
  })

  it('should highlight active navigation item', () => {
    const mockUsePathname = vi.mocked(require('next/navigation').usePathname)
    mockUsePathname.mockReturnValue('/dashboard/studio')

    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    )

    // Studio should be highlighted (active)
    const studioLink = screen.getByRole('link', { name: /studio/i })
    expect(studioLink).toHaveClass('bg-blue-50')
  })

  it('should render mobile navigation toggle', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    )

    // Should have mobile menu button
    const menuButton = screen.getByRole('button', { name: /toggle navigation/i })
    expect(menuButton).toBeInTheDocument()
  })
})

