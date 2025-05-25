import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ConvexClientProvider from '@/components/ConvexClientProvider'

// Mock Convex
vi.mock('convex/react', () => ({
  ConvexProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="convex-provider">{children}</div>
  ),
  ConvexReactClient: vi.fn(() => ({
    setAuth: vi.fn(),
    clearAuth: vi.fn(),
  })),
}))

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(() => ({
    getToken: vi.fn().mockResolvedValue('mock-token'),
    isSignedIn: true,
    userId: 'user_123',
  })),
}))

describe('ConvexClientProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render children within ConvexProvider', () => {
    render(
      <ConvexClientProvider>
        <div data-testid="test-child">Test Child</div>
      </ConvexClientProvider>
    )

    expect(screen.getByTestId('convex-provider')).toBeInTheDocument()
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('should handle multiple children', () => {
    render(
      <ConvexClientProvider>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </ConvexClientProvider>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })

  it('should not crash with no children', () => {
    expect(() => render(<ConvexClientProvider />)).not.toThrow()
  })
})

