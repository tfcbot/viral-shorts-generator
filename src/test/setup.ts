import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock Convex completely - no real API calls needed
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useAction: vi.fn(),
  useConvexAuth: vi.fn(() => ({ 
    isAuthenticated: true, 
    isLoading: false 
  })),
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock Clerk authentication - no real auth needed
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({ 
    user: { 
      id: 'test-user-123', 
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }]
    }, 
    isLoaded: true,
    isSignedIn: true 
  })),
  useAuth: vi.fn(() => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-123'
  })),
  SignInButton: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'sign-in-button' }, children),
  SignUpButton: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'sign-up-button' }, children),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: () => null,
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  Toaster: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'toaster' }, children),
}))

// Mock FAL.ai client
vi.mock('@fal-ai/client', () => ({
  fal: {
    config: vi.fn(),
    subscribe: vi.fn(),
  },
}))
