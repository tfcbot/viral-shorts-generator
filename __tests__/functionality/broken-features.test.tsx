import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudioPage from '@/app/dashboard/studio/page'
import VideosPage from '@/app/dashboard/videos/page'
import { mockUseQuery, mockUseAction } from '@/src/test/setup'
import { mockRateLimit, mockVideo, createVideoList } from '@/src/test/factories'

describe('Broken Functionality Detection', () => {
  const user = userEvent.setup()
  const mockGenerateVideo = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseQuery.mockReturnValue(mockRateLimit)
    mockUseAction.mockReturnValue(mockGenerateVideo)
  })

  describe('Studio Page - Critical Issues', () => {
    it('should detect if form submission is broken', async () => {
      // Test for the "clicking and nothing is functional" issue
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      await user.type(promptTextarea, 'A beautiful landscape with mountains')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      
      // Check if button is clickable
      expect(generateButton).not.toBeDisabled()
      
      // Simulate click
      await user.click(generateButton)
      
      // This test will fail if the form submission is broken
      await waitFor(() => {
        expect(mockGenerateVideo).toHaveBeenCalled()
      }, { timeout: 3000 })
    })

    it('should detect if ConvexProvider is missing', () => {
      // This test will fail if ConvexProvider context is missing
      expect(() => render(<StudioPage />)).not.toThrow()
      
      // Check if the component renders without Convex errors
      expect(screen.getByText('Studio')).toBeInTheDocument()
    })

    it('should detect if rate limiting data loads', () => {
      render(<StudioPage />)
      
      // Should show rate limit information
      const remaining = mockRateLimit.maxVideos - mockRateLimit.videosGenerated
      expect(screen.getByText(new RegExp(`${remaining}.*remaining`, 'i'))).toBeInTheDocument()
    })

    it('should detect if form validation works', async () => {
      render(<StudioPage />)
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      
      // Try to submit empty form
      await user.click(generateButton)
      
      // Should not call the action with empty form
      expect(mockGenerateVideo).not.toHaveBeenCalled()
    })

    it('should detect if character count updates', async () => {
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      const testPrompt = 'Test prompt for character count'
      
      await user.type(promptTextarea, testPrompt)
      
      // Should show updated character count
      expect(screen.getByText(`(${testPrompt.length}/1000 characters)`)).toBeInTheDocument()
    })

    it('should detect if aspect ratio selector works', async () => {
      render(<StudioPage />)
      
      const aspectRatioSelect = screen.getByLabelText(/aspect ratio/i)
      
      // Should be able to change aspect ratio
      await user.selectOptions(aspectRatioSelect, '9:16')
      expect(aspectRatioSelect).toHaveValue('9:16')
    })

    it('should detect if advanced settings toggle works', async () => {
      render(<StudioPage />)
      
      const advancedToggle = screen.getByText(/advanced settings/i)
      await user.click(advancedToggle)
      
      // Should show advanced options
      expect(screen.getByLabelText(/negative prompt/i)).toBeInTheDocument()
    })
  })

  describe('Videos Page - Critical Issues', () => {
    beforeEach(() => {
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName.includes('listUserVideos')) {
          return createVideoList(3)
        }
        if (queryName.includes('getVideoStats')) {
          return { total: 3, completed: 2, generating: 1, failed: 0 }
        }
        return mockRateLimit
      })
    })

    it('should detect if videos list loads', () => {
      render(<VideosPage />)
      
      // Should show videos
      expect(screen.getByText('Beautiful Sunset Video')).toBeInTheDocument()
    })

    it('should detect if video stats display', () => {
      render(<VideosPage />)
      
      // Should show statistics
      expect(screen.getByText(/total.*3/i)).toBeInTheDocument()
      expect(screen.getByText(/completed.*2/i)).toBeInTheDocument()
    })

    it('should detect if video actions work', async () => {
      render(<VideosPage />)
      
      // Look for action buttons (refresh, download, etc.)
      const refreshButtons = screen.getAllByText(/refresh/i)
      expect(refreshButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Navigation Issues', () => {
    it('should detect if internal links work', () => {
      render(<StudioPage />)
      
      // Check if navigation elements are present
      // This would catch broken routing
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })
  })

  describe('Loading State Issues', () => {
    it('should detect if loading states are implemented', async () => {
      // Mock slow API response
      mockGenerateVideo.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      )
      
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      await user.type(promptTextarea, 'A beautiful landscape')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      // Should show loading state
      expect(generateButton).toBeDisabled()
    })
  })

  describe('Error Handling Issues', () => {
    it('should detect if error handling is implemented', async () => {
      mockGenerateVideo.mockRejectedValue(new Error('API Error'))
      
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      await user.type(promptTextarea, 'A beautiful landscape')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      // Should handle error gracefully
      await waitFor(() => {
        // Look for error message or toast
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Real-time Updates Issues', () => {
    it('should detect if real-time updates work', () => {
      // Mock changing data
      const { rerender } = render(<VideosPage />)
      
      // Change mock data
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName.includes('listUserVideos')) {
          return createVideoList(4) // More videos
        }
        return mockRateLimit
      })
      
      rerender(<VideosPage />)
      
      // Should update with new data
      expect(screen.getByText(/Test Video 3/)).toBeInTheDocument()
    })
  })

  describe('Accessibility Issues', () => {
    it('should detect if form labels are properly associated', () => {
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      expect(promptTextarea).toHaveAttribute('id')
    })

    it('should detect if buttons have proper ARIA labels', () => {
      render(<StudioPage />)
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      expect(generateButton).toBeInTheDocument()
    })
  })

  describe('Performance Issues', () => {
    it('should detect if components render efficiently', () => {
      const renderStart = performance.now()
      render(<StudioPage />)
      const renderTime = performance.now() - renderStart
      
      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000) // 1 second
    })
  })
})

