import { beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom'
import React from 'react'

// Make React available globally for mocks
global.React = React

// Global mock for Convex
const mockUseQuery = vi.fn()
const mockUseMutation = vi.fn()
const mockUseAction = vi.fn()

vi.mock('convex/react', () => ({
  useQuery: mockUseQuery,
  useMutation: () => mockUseMutation,
  useAction: () => mockUseAction,
  useConvexAuth: vi.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
  })),
}))

// Global mock for API
vi.mock('@/convex/_generated/api', () => ({
  api: {
    videos: {
      listUserVideos: 'listUserVideos',
      getVideoStats: 'getVideoStats', 
      checkRateLimit: 'checkRateLimit',
      getVideo: 'getVideo',
      refreshVideoUrl: 'refreshVideoUrl'
    },
    videoActions: {
      generateVideo: 'generateVideo'
    }
  }
}))

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({
    user: {
      id: 'user_123',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
    isLoaded: true,
  })),
  useAuth: vi.fn(() => ({
    isSignedIn: true,
    userId: 'user_123',
  })),
  UserButton: ({ children }: { children?: React.ReactNode }) => React.createElement('div', { 'data-testid': 'user-button' }, children),
  SignInButton: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'sign-in-button' }, children),
  SignUpButton: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'sign-up-button' }, children),
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => 
    React.createElement('a', { href, ...props }, children),
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => React.createElement('div', { 'data-testid': 'toaster' }),
}))

// Export mocks for use in tests
export { mockUseQuery, mockUseMutation, mockUseAction }

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
