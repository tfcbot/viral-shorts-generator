import React from 'react'
import { render } from '@testing-library/react'
import { ConvexProvider } from 'convex/react'
import { ConvexReactClient } from 'convex/react'

// Create a mock Convex client for testing
const mockConvexClient = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || 'https://mock-convex-url.convex.cloud')

// Test wrapper that provides all necessary context
export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConvexProvider client={mockConvexClient}>
      {children}
    </ConvexProvider>
  )
}

// Helper function to render components with all providers
export const renderWithProviders = (ui: React.ReactElement) => {
  return {
    ...render(ui, { wrapper: TestWrapper }),
  }
}

// Re-export testing utilities
export * from '@testing-library/react'
export { renderWithProviders as render }
