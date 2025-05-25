import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RootLayout from '@/app/layout'

// Mock Next.js font
vi.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-font',
  }),
}))

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="clerk-provider">{children}</div>
  ),
}))

// Mock ConvexClientProvider
vi.mock('@/components/ConvexClientProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="convex-provider">{children}</div>
  ),
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}))

describe('Root Layout', () => {
  it('should render the root layout with all providers', () => {
    render(
      <RootLayout>
        <div data-testid="app-content">App Content</div>
      </RootLayout>
    )

    // Should render all providers
    expect(screen.getByTestId('clerk-provider')).toBeInTheDocument()
    expect(screen.getByTestId('convex-provider')).toBeInTheDocument()
    expect(screen.getByTestId('toaster')).toBeInTheDocument()
    
    // Should render children
    expect(screen.getByTestId('app-content')).toBeInTheDocument()
  })

  it('should have correct document structure', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    )

    // Should have html and body elements with correct classes
    const html = container.querySelector('html')
    const body = container.querySelector('body')
    
    expect(html).toHaveClass('inter-font')
    expect(body).toHaveClass('bg-slate-50', 'dark:bg-slate-900')
  })

  it('should include metadata in head', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    )

    // Check if title is set correctly
    expect(document.title).toBe('Viral Shorts Generator')
  })
})

