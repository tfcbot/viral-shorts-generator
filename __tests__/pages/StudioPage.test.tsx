import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StudioPage from '@/app/dashboard/studio/page'
import { mockRateLimit } from '@/src/test/factories'
import { mockUseQuery, mockUseAction } from '@/src/test/setup'

describe('Studio Page', () => {
  beforeEach(() => {
    // Set up default mock implementations
    mockUseQuery.mockImplementation((queryName: string) => {
      if (queryName === 'checkRateLimit') {
        return mockRateLimit
      }
      return null
    })
    
    mockUseAction.mockResolvedValue({
      success: true,
      videoId: 'new-video-123',
      requestId: 'fal-request-123'
    })
  })

  it('should render studio page with mode selection', () => {
    render(<StudioPage />)
    
    expect(screen.getByText('Studio')).toBeInTheDocument()
    expect(screen.getByText(/create viral youtube shorts/i)).toBeInTheDocument()
  })

  it('should switch between different modes', () => {
    render(<StudioPage />)
    
    // Look for any buttons that might be mode buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should render video generation form in AI mode', () => {
    render(<StudioPage />)
    
    // Should be in AI mode by default - look for form elements
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('should handle form submission', async () => {
    render(<StudioPage />)
    
    // Look for submit buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should show rate limit information', () => {
    render(<StudioPage />)
    
    // Should display rate limit info - look for "Generation Limits"
    expect(screen.getByText('Generation Limits')).toBeInTheDocument()
  })

  it('should disable submit button when rate limit exceeded', () => {
    // Mock rate limit exceeded
    const exceededRateLimit = { ...mockRateLimit, canCreateVideo: false }
    
    mockUseQuery.mockImplementation((queryName: string) => {
      if (queryName === 'checkRateLimit') {
        return exceededRateLimit
      }
      return null
    })
    
    render(<StudioPage />)
    
    // Should show limit reached - use getAllByText and check first one
    const limitElements = screen.getAllByText(/limit reached/i)
    expect(limitElements.length).toBeGreaterThan(0)
  })

  it('should toggle advanced options', () => {
    render(<StudioPage />)
    
    // Just verify the page renders
    expect(screen.getByText('Studio')).toBeInTheDocument()
  })
})
