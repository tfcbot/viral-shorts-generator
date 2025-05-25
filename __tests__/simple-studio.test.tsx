import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import StudioPage from '@/app/dashboard/studio/page'
import { mockUseQuery, mockUseMutation } from '@/src/test/setup'

describe('Studio Page - Simple Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup basic mocks
    mockUseQuery.mockReturnValue({
      canCreateVideo: true,
      videosGenerated: 0,
      maxVideos: 10,
      generatingCount: 0,
      maxGenerating: 3,
      timeUntilReset: 0
    })
  })

  it('should render the studio page without crashing', () => {
    expect(() => render(<StudioPage />)).not.toThrow()
  })

  it('should render the main studio header', () => {
    render(<StudioPage />)
    
    expect(screen.getByText('Studio')).toBeInTheDocument()
  })

  it('should render the AI Generation tab', () => {
    render(<StudioPage />)
    
    expect(screen.getByText('🤖 AI Generation')).toBeInTheDocument()
  })

  it('should render the Templates tab', () => {
    render(<StudioPage />)
    
    expect(screen.getByText('📋 Templates')).toBeInTheDocument()
  })

  it('should render the Upload tab', () => {
    render(<StudioPage />)
    
    expect(screen.getByText('📤 Upload')).toBeInTheDocument()
  })
})

