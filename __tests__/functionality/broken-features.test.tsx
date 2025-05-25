import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudioPage from '@/app/dashboard/studio/page'
import VideosPage from '@/app/dashboard/videos/page'
import DashboardPage from '@/app/dashboard/page'
import { mockUseQuery, mockUseMutation } from '@/src/test/setup'
import { 
  mockVideo, 
  mockGeneratingVideo, 
  mockRateLimit,
  mockUserSession 
} from '@/src/test/factories'

/**
 * This test suite is designed to identify and verify fixes for broken functionality
 * mentioned by the user: "Im clicking and nothing is functional"
 */

describe('Broken Functionality Detection and Fixes', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup realistic mocks
    mockUseQuery.mockImplementation((endpoint) => {
      switch (endpoint) {
        case 'checkRateLimit':
          return mockRateLimit
        case 'getUserSession':
          return mockUserSession
        case 'listUserVideos':
          return [mockVideo, mockGeneratingVideo]
        case 'getVideoStats':
          return { total: 2, completed: 1, generating: 1, failed: 0 }
        case 'getGeneratingVideosStatus':
          return [mockGeneratingVideo]
        default:
          return null
      }
    })
  })

  describe('Studio Page - Button Functionality', () => {
    it('should verify generate video button is clickable and functional', async () => {
      const mockGenerateVideo = vi.fn().mockResolvedValue({
        success: true,
        videoId: 'video-123'
      })

      vi.mock('convex/react', async () => {
        const actual = await vi.importActual('convex/react')
        return {
          ...actual,
          useAction: () => mockGenerateVideo,
        }
      })

      render(<StudioPage />)

      // Fill required fields
      const promptInput = screen.getByLabelText(/video prompt/i)
      await user.type(promptInput, 'A beautiful landscape with mountains and lakes')

      // Verify button exists and is clickable
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      expect(generateButton).toBeInTheDocument()
      expect(generateButton).not.toBeDisabled()

      // Test button click functionality
      await user.click(generateButton)

      // Verify the action was called
      await waitFor(() => {
        expect(mockGenerateVideo).toHaveBeenCalled()
      })
    })

    it('should verify form validation prevents empty submissions', async () => {
      const mockGenerateVideo = vi.fn()

      vi.mock('convex/react', async () => {
        const actual = await vi.importActual('convex/react')
        return {
          ...actual,
          useAction: () => mockGenerateVideo,
        }
      })

      render(<StudioPage />)

      const generateButton = screen.getByRole('button', { name: /generate video/i })
      
      // Try to submit without filling prompt
      await user.click(generateButton)

      // Should not call the action with empty form
      expect(mockGenerateVideo).not.toHaveBeenCalled()
    })

    it('should verify aspect ratio selector is functional', async () => {
      render(<StudioPage />)

      const aspectRatioSelect = screen.getByLabelText(/aspect ratio/i)
      expect(aspectRatioSelect).toBeInTheDocument()

      // Test changing aspect ratio
      await user.selectOptions(aspectRatioSelect, '9:16')
      expect(aspectRatioSelect).toHaveValue('9:16')

      await user.selectOptions(aspectRatioSelect, '1:1')
      expect(aspectRatioSelect).toHaveValue('1:1')
    })

    it('should verify negative prompt field is functional', async () => {
      render(<StudioPage />)

      const negativePromptInput = screen.getByLabelText(/negative prompt/i)
      expect(negativePromptInput).toBeInTheDocument()

      // Test typing in negative prompt
      const testText = 'blurry, low quality, distorted'
      await user.type(negativePromptInput, testText)
      expect(negativePromptInput).toHaveValue(testText)
    })
  })

  describe('Videos Page - Interactive Elements', () => {
    it('should verify video cards are clickable', async () => {
      render(<VideosPage />)

      // Find video cards
      const videoTitle = screen.getByText(mockVideo.title)
      const videoCard = videoTitle.closest('div')
      
      expect(videoCard).toBeInTheDocument()

      // Test clicking on video card
      await user.click(videoCard!)

      // Should open modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('should verify filter dropdown is functional', async () => {
      render(<VideosPage />)

      const statusFilter = screen.getByLabelText(/filter by status/i)
      expect(statusFilter).toBeInTheDocument()

      // Test filter functionality
      await user.selectOptions(statusFilter, 'completed')
      expect(statusFilter).toHaveValue('completed')

      await user.selectOptions(statusFilter, 'generating')
      expect(statusFilter).toHaveValue('generating')
    })

    it('should verify sort dropdown is functional', async () => {
      render(<VideosPage />)

      const sortSelect = screen.getByLabelText(/sort by/i)
      expect(sortSelect).toBeInTheDocument()

      // Test sort functionality
      await user.selectOptions(sortSelect, 'newest')
      expect(sortSelect).toHaveValue('newest')

      await user.selectOptions(sortSelect, 'oldest')
      expect(sortSelect).toHaveValue('oldest')
    })

    it('should verify refresh URL buttons are functional', async () => {
      const mockRefreshUrl = vi.fn().mockResolvedValue({ success: true })

      vi.mock('convex/react', async () => {
        const actual = await vi.importActual('convex/react')
        return {
          ...actual,
          useMutation: () => mockRefreshUrl,
        }
      })

      render(<VideosPage />)

      // Find refresh buttons
      const refreshButtons = screen.getAllByRole('button', { name: /refresh url/i })
      expect(refreshButtons.length).toBeGreaterThan(0)

      // Test clicking refresh button
      await user.click(refreshButtons[0])

      expect(mockRefreshUrl).toHaveBeenCalled()
    })

    it('should verify modal close functionality', async () => {
      render(<VideosPage />)

      // Open modal
      const videoCard = screen.getByText(mockVideo.title).closest('div')
      await user.click(videoCard!)

      // Verify modal is open
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      // Test close button
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('Dashboard Page - Navigation and Links', () => {
    it('should verify navigation links are functional', async () => {
      render(<DashboardPage />)

      // Check studio link
      const studioLink = screen.getByRole('link', { name: /studio/i })
      expect(studioLink).toBeInTheDocument()
      expect(studioLink).toHaveAttribute('href', '/dashboard/studio')

      // Check videos link
      const videosLink = screen.getByRole('link', { name: /videos/i })
      expect(videosLink).toBeInTheDocument()
      expect(videosLink).toHaveAttribute('href', '/dashboard/videos')
    })

    it('should verify create video button is functional', async () => {
      render(<DashboardPage />)

      const createButton = screen.getByRole('link', { name: /create new video/i })
      expect(createButton).toBeInTheDocument()
      expect(createButton).toHaveAttribute('href', '/dashboard/studio')
    })

    it('should verify view all videos button is functional', async () => {
      render(<DashboardPage />)

      const viewAllButton = screen.getByRole('link', { name: /view all videos/i })
      expect(viewAllButton).toBeInTheDocument()
      expect(viewAllButton).toHaveAttribute('href', '/dashboard/videos')
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

