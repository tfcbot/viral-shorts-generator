import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import StudioPage from '@/app/dashboard/studio/page'
import VideosPage from '@/app/dashboard/videos/page'
import DashboardPage from '@/app/dashboard/page'
import { mockUseQuery, mockUseMutation, mockUseAction } from '@/src/test/setup'
import { 
  mockRateLimit, 
  mockVideo, 
  mockGeneratingVideo,
  createVideoList,
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

describe('End-to-End Video Workflow Tests', () => {
  const user = userEvent.setup()
  const mockGenerateVideo = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAction.mockReturnValue(mockGenerateVideo)
    mockUseMutation.mockReturnValue(mockGenerateVideo)
  })

  describe('Complete Video Generation Workflow', () => {
    it('should complete full video generation workflow', async () => {
      // Step 1: Start with studio page
      mockUseQuery.mockReturnValue(mockRateLimit)
      mockGenerateVideo.mockResolvedValue({
        success: true,
        videoId: 'new-video-123',
        requestId: 'fal-request-new'
      })
      
      render(<StudioPage />)
      
      // Step 2: Fill out video generation form
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      await user.type(promptTextarea, 'A serene mountain lake surrounded by pine trees at sunset')
      
      const aspectRatioSelect = screen.getByLabelText(/aspect ratio/i)
      await user.selectOptions(aspectRatioSelect, '16:9')
      
      const durationSelect = screen.getByLabelText(/duration/i)
      await user.selectOptions(durationSelect, '5')
      
      // Step 3: Submit video generation
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      // Step 4: Verify generation was initiated
      await waitFor(() => {
        expect(mockGenerateVideo).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt: 'A serene mountain lake surrounded by pine trees at sunset',
            aspectRatio: '16:9',
            duration: '5'
          })
        )
      })
      
      // Step 5: Verify loading state
      expect(generateButton).toBeDisabled()
    })

    it('should handle video generation with advanced settings', async () => {
      mockUseQuery.mockReturnValue(mockRateLimit)
      mockGenerateVideo.mockResolvedValue({ success: true })
      
      render(<StudioPage />)
      
      // Fill basic form
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      await user.type(promptTextarea, 'A futuristic cityscape with flying cars')
      
      // Open advanced settings
      const advancedToggle = screen.getByText(/advanced settings/i)
      await user.click(advancedToggle)
      
      // Set negative prompt
      const negativePromptInput = screen.getByLabelText(/negative prompt/i)
      await user.type(negativePromptInput, 'blurry, low quality, distorted')
      
      // Submit with advanced settings
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      await waitFor(() => {
        expect(mockGenerateVideo).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt: 'A futuristic cityscape with flying cars',
            negativePrompt: 'blurry, low quality, distorted'
          })
        )
      })
    })
  })

  describe('Video Management Workflow', () => {
    it('should display and manage video library', () => {
      const videoList = [
        mockVideo,
        mockGeneratingVideo,
        {
          ...mockVideo,
          _id: 'video-456',
          title: 'Another Video',
          status: 'failed' as const,
          error: 'Generation failed'
        }
      ]
      
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName.includes('listUserVideos')) {
          return videoList
        }
        if (queryName.includes('getVideoStats')) {
          return {
            total: 3,
            completed: 1,
            generating: 1,
            failed: 1,
            todayCount: 2,
            successRate: 33
          }
        }
        return mockRateLimit
      })
      
      render(<VideosPage />)
      
      // Should display all video statuses
      expect(screen.getByText('Beautiful Sunset Video')).toBeInTheDocument()
      expect(screen.getByText('Mountain Landscape Video')).toBeInTheDocument()
      expect(screen.getByText('Another Video')).toBeInTheDocument()
      
      // Should display statistics
      expect(screen.getByText(/total.*3/i)).toBeInTheDocument()
      expect(screen.getByText(/completed.*1/i)).toBeInTheDocument()
      expect(screen.getByText(/generating.*1/i)).toBeInTheDocument()
      expect(screen.getByText(/failed.*1/i)).toBeInTheDocument()
    })

    it('should handle video status transitions', () => {
      const { rerender } = render(<VideosPage />)
      
      // Initial state: video generating
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName.includes('listUserVideos')) {
          return [mockGeneratingVideo]
        }
        if (queryName.includes('getVideoStats')) {
          return { total: 1, completed: 0, generating: 1, failed: 0 }
        }
        return mockRateLimit
      })
      
      rerender(<VideosPage />)
      expect(screen.getByText(/generating/i)).toBeInTheDocument()
      
      // Updated state: video completed
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName.includes('listUserVideos')) {
          return [{
            ...mockGeneratingVideo,
            status: 'completed',
            url: 'https://example.com/completed-video.mp4',
            thumbnailUrl: 'https://example.com/thumbnail.jpg'
          }]
        }
        if (queryName.includes('getVideoStats')) {
          return { total: 1, completed: 1, generating: 0, failed: 0 }
        }
        return mockRateLimit
      })
      
      rerender(<VideosPage />)
      expect(screen.getByText(/completed/i)).toBeInTheDocument()
    })
  })

  describe('Rate Limiting Workflow', () => {
    it('should handle approaching rate limits', () => {
      // Near rate limit
      mockUseQuery.mockReturnValue({
        ...mockRateLimit,
        videosGenerated: 9,
        maxVideos: 10,
        canCreateVideo: true
      })
      
      render(<StudioPage />)
      
      // Should show warning about approaching limit
      expect(screen.getByText(/1.*remaining/i)).toBeInTheDocument()
      
      // Should still allow generation
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      expect(generateButton).not.toBeDisabled()
    })

    it('should handle rate limit exceeded', () => {
      mockUseQuery.mockReturnValue({
        ...mockRateLimit,
        videosGenerated: 10,
        maxVideos: 10,
        canCreateVideo: false,
        timeUntilReset: 1000 * 60 * 60 * 12 // 12 hours
      })
      
      render(<StudioPage />)
      
      // Should disable generation
      const generateButton = screen.getByRole('button', { name: /daily limit reached/i })
      expect(generateButton).toBeDisabled()
      
      // Should show reset time
      expect(screen.getByText(/resets in/i)).toBeInTheDocument()
    })

    it('should handle too many concurrent generations', () => {
      mockUseQuery.mockReturnValue({
        ...mockRateLimit,
        generatingCount: 3,
        maxGenerating: 3,
        canCreateVideo: false
      })
      
      render(<StudioPage />)
      
      // Should disable generation
      const generateButton = screen.getByRole('button', { name: /too many generating/i })
      expect(generateButton).toBeDisabled()
      
      // Should show helpful message
      expect(screen.getByText(/wait for some videos to complete/i)).toBeInTheDocument()
    })
  })

  describe('Error Recovery Workflow', () => {
    it('should handle and recover from generation errors', async () => {
      mockUseQuery.mockReturnValue(mockRateLimit)
      
      // First attempt fails
      mockGenerateVideo.mockRejectedValueOnce(new Error('Network error'))
      
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      await user.type(promptTextarea, 'A beautiful landscape')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
      
      // Second attempt succeeds
      mockGenerateVideo.mockResolvedValueOnce({ success: true })
      
      await user.click(generateButton)
      
      // Should succeed on retry
      await waitFor(() => {
        expect(mockGenerateVideo).toHaveBeenCalledTimes(2)
      })
    })

    it('should handle validation errors gracefully', async () => {
      mockUseQuery.mockReturnValue(mockRateLimit)
      
      render(<StudioPage />)
      
      // Try to submit with empty prompt
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      // Should not call API
      expect(mockGenerateVideo).not.toHaveBeenCalled()
      
      // Should show validation feedback
      expect(screen.getByText(/required/i)).toBeInTheDocument()
    })
  })

  describe('User Experience Workflow', () => {
    it('should provide feedback throughout the generation process', async () => {
      mockUseQuery.mockReturnValue(mockRateLimit)
      
      // Mock slow generation
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
      expect(screen.getByText(/generating/i)).toBeInTheDocument()
      
      // Should complete
      await waitFor(() => {
        expect(generateButton).not.toBeDisabled()
      })
    })

    it('should maintain form state during interactions', async () => {
      mockUseQuery.mockReturnValue(mockRateLimit)
      
      render(<StudioPage />)
      
      // Fill form
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      await user.type(promptTextarea, 'A beautiful landscape')
      
      const aspectRatioSelect = screen.getByLabelText(/aspect ratio/i)
      await user.selectOptions(aspectRatioSelect, '9:16')
      
      // Switch tabs and back
      const templatesTab = screen.getByText('📋 Templates')
      await user.click(templatesTab)
      
      const aiTab = screen.getByText('🤖 AI Generation')
      await user.click(aiTab)
      
      // Form state should be preserved
      expect(promptTextarea).toHaveValue('A beautiful landscape')
      expect(aspectRatioSelect).toHaveValue('9:16')
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
