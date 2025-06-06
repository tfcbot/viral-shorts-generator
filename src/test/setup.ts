import { beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom'
import React from 'react'
import { render as originalRender } from '@testing-library/react'

// Make React available globally for mocks
global.React = React

// Global mock for Convex with proper provider
const mockUseQuery = vi.fn()
const mockUseMutation = vi.fn()
const mockUseAction = vi.fn()

// Mock ConvexProvider to avoid client setup issues
const MockConvexProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'convex-provider' }, children)
}

vi.mock('convex/react', () => ({
  useQuery: mockUseQuery,
  useMutation: () => mockUseMutation,
  useAction: () => mockUseAction,
  useConvexAuth: vi.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
  })),
  ConvexProvider: MockConvexProvider,
  ConvexReactClient: vi.fn(() => ({})),
}))

// Global mock for API
vi.mock('@/convex/_generated/api', () => ({
  api: {
    videos: {
      listUserVideos: 'listUserVideos',
      getVideoStats: 'getVideoStats', 
      checkRateLimit: 'checkRateLimit',
      getVideo: 'getVideo',
      refreshVideoUrl: 'refreshVideoUrl',
      // Enhanced state management endpoints
      getGeneratingVideosStatus: 'getGeneratingVideosStatus',
      getUserSession: 'getUserSession',
      retryVideoGeneration: 'retryVideoGeneration',
      updateUserPreferences: 'updateUserPreferences',
      updateUserActivity: 'updateUserActivity',
      cleanupExpiredUrls: 'cleanupExpiredUrls',
      // Core mutations
      createVideoRecord: 'createVideoRecord',
      updateVideoStatus: 'updateVideoStatus',
      updateVideoWithStorage: 'updateVideoWithStorage',
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
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => React.createElement('div', { 'data-testid': 'toaster' }),
}))

// Test wrapper that provides all necessary context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(MockConvexProvider, null, children)
}

// Override the render function to automatically wrap with providers
const customRender = (ui: React.ReactElement, options = {}) => {
  return originalRender(ui, { wrapper: TestWrapper, ...options })
}

// Re-export everything from testing-library/react
export * from '@testing-library/react'

// Override render
export { customRender as render }

// Export mocks for use in tests
export { mockUseQuery, mockUseMutation, mockUseAction }

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
