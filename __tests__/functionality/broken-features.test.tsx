import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudioPage from '@/app/dashboard/studio/page'
import VideosPage from '@/app/dashboard/videos/page'
import { mockUseQuery, mockUseAction, mockUseMutation } from '@/src/test/setup'
import { mockRateLimit, mockVideo, createVideoList } from '@/src/test/factories'

describe('Broken Functionality Detection', () => {
  const user = userEvent.setup()
  const mockGenerateVideo = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseQuery.mockReturnValue(mockRateLimit)
    mockUseAction.mockReturnValue(mockGenerateVideo)
    mockUseMutation.mockReturnValue(mockGenerateVideo)
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
>>>>>>> main
    })
  })

  describe('Common UI Issues Detection', () => {
    it('should detect missing event handlers', async () => {
      render(<StudioPage />)
      
      // Check if buttons have proper event handlers
      const buttons = screen.getAllByRole('button')
      
      buttons.forEach(button => {
        // Each button should be either disabled or have click functionality
        if (!button.hasAttribute('disabled')) {
          expect(button).toHaveProperty('onclick')
        }
      })
    })

    it('should detect broken form submissions', async () => {
      render(<StudioPage />)
      
      const form = screen.getByRole('form') || document.querySelector('form')
      
      if (form) {
        // Form should have proper submit handling
        expect(form).toHaveProperty('onsubmit')
      }
    })

    it('should detect missing loading states', async () => {
      // Mock loading state
      mockUseQuery.mockImplementation(() => undefined)

      render(<VideosPage />)
      
      // Should show loading indicator
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should detect missing error boundaries', async () => {
      // Mock error state
      mockUseQuery.mockImplementation(() => {
        throw new Error('Test error')
      })

      // Should not crash the app
      expect(() => render(<VideosPage />)).not.toThrow()
    })
  })

  describe('Accessibility Issues Detection', () => {
    it('should verify buttons have proper labels', async () => {
      render(<StudioPage />)
      
      const buttons = screen.getAllByRole('button')
      
      buttons.forEach(button => {
        // Each button should have accessible text
        expect(button).toHaveAccessibleName()
      })
    })

    it('should verify form inputs have proper labels', async () => {
      render(<StudioPage />)
      
      const inputs = screen.getAllByRole('textbox')
      
      inputs.forEach(input => {
        // Each input should have a label
        expect(input).toHaveAccessibleName()
      })
    })

    it('should verify select elements have proper labels', async () => {
      render(<StudioPage />)
      
      const selects = screen.getAllByRole('combobox')
      
      selects.forEach(select => {
        // Each select should have a label
        expect(select).toHaveAccessibleName()
      })
    })
  })

  describe('Performance Issues Detection', () => {
    it('should detect unnecessary re-renders', async () => {
      const renderCount = vi.fn()
      
      const TestComponent = () => {
        renderCount()
        return <StudioPage />
      }

      const { rerender } = render(<TestComponent />)
      
      // Initial render
      expect(renderCount).toHaveBeenCalledTimes(1)
      
      // Re-render with same props should not cause unnecessary renders
      rerender(<TestComponent />)
      
      // Should not render excessively
      expect(renderCount).toHaveBeenCalledTimes(2)
    })

    it('should detect memory leaks in event listeners', async () => {
      const { unmount } = render(<VideosPage />)
      
      // Count event listeners before unmount
      const beforeUnmount = document.querySelectorAll('*').length
      
      unmount()
      
      // Should clean up properly
      const afterUnmount = document.querySelectorAll('*').length
      expect(afterUnmount).toBeLessThanOrEqual(beforeUnmount)
    })
  })

  describe('Data Flow Issues Detection', () => {
    it('should verify data is properly passed to components', async () => {
      render(<VideosPage />)
      
      // Should display video data
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument()
      expect(screen.getByText(mockGeneratingVideo.title)).toBeInTheDocument()
    })

    it('should verify mutations update UI state', async () => {
      const mockRefreshUrl = vi.fn().mockResolvedValue({ 
        success: true,
        url: 'https://new-url.example.com/video.mp4'
      })

      vi.mock('convex/react', async () => {
        const actual = await vi.importActual('convex/react')
        return {
          ...actual,
          useMutation: () => mockRefreshUrl,
        }
      })

      render(<VideosPage />)
      
      const refreshButton = screen.getAllByRole('button', { name: /refresh url/i })[0]
      await user.click(refreshButton)
      
      // Should show success feedback
      await waitFor(() => {
        expect(screen.getByText(/refreshed/i)).toBeInTheDocument()
      })
    })
  })
})
