import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple test component
function TestComponent() {
  return <div>Test Infrastructure Working</div>
}

describe('Test Infrastructure', () => {
  it('should render test components correctly', () => {
    render(<TestComponent />)
    expect(screen.getByText('Test Infrastructure Working')).toBeInTheDocument()
  })

  it('should have access to mocked Convex hooks', () => {
    const { useQuery } = require('convex/react')
    expect(useQuery).toBeDefined()
    expect(typeof useQuery).toBe('function')
  })

  it('should have access to mocked Clerk hooks', () => {
    const { useUser } = require('@clerk/nextjs')
    expect(useUser).toBeDefined()
    expect(typeof useUser).toBe('function')
  })

  it('should have access to test factories', () => {
    const { mockVideo, mockRateLimit } = require('../src/test/factories')
    expect(mockVideo).toBeDefined()
    expect(mockRateLimit).toBeDefined()
    expect(mockVideo._id).toBeDefined()
    expect(mockRateLimit.canCreateVideo).toBeDefined()
  })
})
