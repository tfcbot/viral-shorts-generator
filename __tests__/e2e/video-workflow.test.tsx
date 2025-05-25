import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
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

// Mock navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard/studio',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock video generation action
const mockGenerateVideo = vi.fn()
const mockRefreshUrl = vi.fn()

vi.mock('convex/react', async () => {
  const actual = await vi.importActual('convex/react')
  return {
    ...actual,
    useAction: () => mockGenerateVideo,
    useMutation: () => mockRefreshUrl,
  }
})

// Wrapper component for routing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('End-to-End Video Workflow', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockUseQuery.mockImplementation((endpoint) => {
      switch (endpoint) {
        case 'checkRateLimit':
          return mockRateLimit
        case 'getUserSession':
          return mockUserSession
        case 'listUserVideos':
          return [mockVideo]
        case 'getVideoStats':
          return { total: 1, completed: 1, generating: 0, failed: 0 }
        case 'getGeneratingVideosStatus':
          return []
        default:
          return null
      }
    })

    mockGenerateVideo.mockResolvedValue({
      success: true,
      videoId: 'video-new-123',
      requestId: 'fal-request-123'
    })

    mockRefreshUrl.mockResolvedValue({ success: true })
  })

  describe('Complete Video Generation Workflow', () => {
    it('should complete full video generation workflow', async () => {
      // Step 1: Start on Studio page
      render(<StudioPage />, { wrapper: TestWrapper })
      
      expect(screen.getByText('Create Your Viral Short')).toBeInTheDocument()

      // Step 2: Fill out the form
      const promptInput = screen.getByLabelText(/video prompt/i)
      const aspectRatioSelect = screen.getByLabelText(/aspect ratio/i)
      const negativePromptInput = screen.getByLabelText(/negative prompt/i)

      await user.type(promptInput, 'A beautiful sunset over the ocean with waves crashing')
      await user.selectOptions(aspectRatioSelect, '16:9')
      await user.type(negativePromptInput, 'blurry, low quality, distorted')

      // Step 3: Submit the form
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)

      // Step 4: Verify video generation was called
      await waitFor(() => {
        expect(mockGenerateVideo).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt: 'A beautiful sunset over the ocean with waves crashing',
            aspectRatio: '16:9',
            negativePrompt: 'blurry, low quality, distorted'
          })
        )
      })

      // Step 5: Verify success message
      await waitFor(() => {
        expect(screen.getByText(/video generation started/i)).toBeInTheDocument()
      })
    })

    it('should handle video generation with rate limiting', async () => {
      // Setup rate limit reached
      const rateLimitExceeded = {
        ...mockRateLimit,
        videosGenerated: 10,
        maxVideos: 10,
        canGenerate: false
      }
      
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === 'checkRateLimit') return rateLimitExceeded
        return mockUserSession
      })

      render(<StudioPage />, { wrapper: TestWrapper })

      // Should show rate limit warning
      expect(screen.getByText(/rate limit reached/i)).toBeInTheDocument()
      
      // Generate button should be disabled
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      expect(generateButton).toBeDisabled()

      // Should not allow form submission
      await user.click(generateButton)
      expect(mockGenerateVideo).not.toHaveBeenCalled()
    })
  })

  describe('Video Management Workflow', () => {
    it('should view and manage videos', async () => {
      // Setup videos data
      const videos = [mockVideo, mockGeneratingVideo]
      mockUseQuery.mockImplementation((endpoint) => {
        switch (endpoint) {
          case 'listUserVideos':
            return videos
          case 'getVideoStats':
            return { total: 2, completed: 1, generating: 1, failed: 0 }
          case 'getGeneratingVideosStatus':
            return [mockGeneratingVideo]
          default:
            return null
        }
      })

      render(<VideosPage />, { wrapper: TestWrapper })

      // Should display videos
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument()
      expect(screen.getByText(mockGeneratingVideo.title)).toBeInTheDocument()

      // Should show status badges
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Generating')).toBeInTheDocument()

      // Test filtering
      const statusFilter = screen.getByLabelText(/filter by status/i)
      await user.selectOptions(statusFilter, 'completed')

      // Should filter to completed videos only
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument()
      expect(screen.queryByText(mockGeneratingVideo.title)).not.toBeInTheDocument()
    })

    it('should refresh video URLs', async () => {
      render(<VideosPage />, { wrapper: TestWrapper })

      // Find and click refresh button
      const refreshButton = screen.getAllByRole('button', { name: /refresh url/i })[0]
      await user.click(refreshButton)

      // Should call refresh mutation
      expect(mockRefreshUrl).toHaveBeenCalledWith({ id: mockVideo._id })

      // Should show success feedback
      await waitFor(() => {
        expect(screen.getByText(/url refreshed/i)).toBeInTheDocument()
      })
    })

    it('should open video modal and play video', async () => {
      render(<VideosPage />, { wrapper: TestWrapper })

      // Click on video to open modal
      const videoCard = screen.getByText(mockVideo.title).closest('div')
      await user.click(videoCard!)

      // Should open modal
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument()

      // Should show video player
      const videoPlayer = screen.getByRole('video')
      expect(videoPlayer).toBeInTheDocument()
      expect(videoPlayer).toHaveAttribute('src', mockVideo.url)

      // Should show video metadata
      expect(screen.getByText(mockVideo.prompt)).toBeInTheDocument()
    })
  })

  describe('Dashboard Overview Workflow', () => {
    it('should display dashboard overview with navigation', async () => {
      render(<DashboardPage />, { wrapper: TestWrapper })

      // Should show dashboard header
      expect(screen.getByText('Dashboard')).toBeInTheDocument()

      // Should show statistics
      expect(screen.getByText('Total Videos')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Total count

      // Should show navigation links
      const studioLink = screen.getByRole('link', { name: /studio/i })
      const videosLink = screen.getByRole('link', { name: /videos/i })
      
      expect(studioLink).toHaveAttribute('href', '/dashboard/studio')
      expect(videosLink).toHaveAttribute('href', '/dashboard/videos')

      // Should show recent videos
      expect(screen.getByText('Recent Videos')).toBeInTheDocument()
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument()
    })

    it('should navigate between pages', async () => {
      render(<DashboardPage />, { wrapper: TestWrapper })

      // Click on studio link
      const studioLink = screen.getByRole('link', { name: /create new video/i })
      await user.click(studioLink)

      // Should navigate to studio (mocked)
      expect(studioLink).toHaveAttribute('href', '/dashboard/studio')
    })
  })

  describe('Error Handling Workflows', () => {
    it('should handle video generation errors gracefully', async () => {
      mockGenerateVideo.mockRejectedValue(new Error('Generation failed'))

      render(<StudioPage />, { wrapper: TestWrapper })

      // Fill form and submit
      const promptInput = screen.getByLabelText(/video prompt/i)
      await user.type(promptInput, 'A test video')

      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to generate video/i)).toBeInTheDocument()
      })

      // Form should be re-enabled for retry
      expect(generateButton).not.toBeDisabled()
    })

    it('should handle network errors in video loading', async () => {
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === 'listUserVideos') throw new Error('Network error')
        return null
      })

      render(<VideosPage />, { wrapper: TestWrapper })

      // Should show error message
      expect(screen.getByText(/failed to load videos/i)).toBeInTheDocument()
    })

    it('should handle URL refresh errors', async () => {
      mockRefreshUrl.mockRejectedValue(new Error('Refresh failed'))

      render(<VideosPage />, { wrapper: TestWrapper })

      // Click refresh button
      const refreshButton = screen.getAllByRole('button', { name: /refresh url/i })[0]
      await user.click(refreshButton)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to refresh url/i)).toBeInTheDocument()
      })
    })
  })

  describe('Real-time Updates Workflow', () => {
    it('should handle real-time video status updates', async () => {
      // Start with generating video
      mockUseQuery.mockImplementation((endpoint) => {
        switch (endpoint) {
          case 'listUserVideos':
            return [mockGeneratingVideo]
          case 'getGeneratingVideosStatus':
            return [mockGeneratingVideo]
          case 'getVideoStats':
            return { total: 1, completed: 0, generating: 1, failed: 0 }
          default:
            return null
        }
      })

      const { rerender } = render(<VideosPage />, { wrapper: TestWrapper })

      // Should show generating status
      expect(screen.getByText('Generating')).toBeInTheDocument()

      // Simulate video completion
      const completedVideo = { ...mockGeneratingVideo, status: 'completed' as const }
      mockUseQuery.mockImplementation((endpoint) => {
        switch (endpoint) {
          case 'listUserVideos':
            return [completedVideo]
          case 'getGeneratingVideosStatus':
            return []
          case 'getVideoStats':
            return { total: 1, completed: 1, generating: 0, failed: 0 }
          default:
            return null
        }
      })

      rerender(<VideosPage />)

      // Should show completed status
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })
  })

  describe('User Session Workflow', () => {
    it('should handle user preferences updates', async () => {
      const mockUpdatePreferences = vi.fn().mockResolvedValue('success')
      
      // Mock the preferences update mutation
      vi.mocked(mockUseMutation).mockReturnValue(mockUpdatePreferences)

      render(<DashboardPage />, { wrapper: TestWrapper })

      // Should display current preferences
      if (mockUserSession.preferences?.defaultAspectRatio) {
        expect(screen.getByText(mockUserSession.preferences.defaultAspectRatio)).toBeInTheDocument()
      }

      // Test preferences update (would be in a settings component)
      // This is a placeholder for when settings UI is implemented
    })

    it('should handle authentication state changes', async () => {
      // Mock unauthenticated state
      vi.mock('@clerk/nextjs', () => ({
        useUser: vi.fn(() => ({
          user: null,
          isLoaded: true,
        })),
        useAuth: vi.fn(() => ({
          isSignedIn: false,
          userId: null,
        })),
      }))

      render(<DashboardPage />, { wrapper: TestWrapper })

      // Should handle unauthenticated state appropriately
      // (This would typically redirect to login)
    })
  })
})

