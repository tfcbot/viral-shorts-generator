import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudioPage from '@/app/dashboard/studio/page'
import VideosPage from '@/app/dashboard/videos/page'
import { mockUseQuery, mockUseAction } from '@/src/test/setup'
import { 
  mockRateLimit, 
  mockVideo, 
  mockGeneratingVideo, 
  mockVideoStats,
  createVideoList 
} from '@/src/test/factories'

describe('Convex Integration Tests', () => {
  const user = userEvent.setup()
  const mockGenerateVideo = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAction.mockReturnValue(mockGenerateVideo)
  })

  describe('Rate Limiting Integration', () => {
    it('should properly integrate rate limit data with UI', () => {
      mockUseQuery.mockReturnValue(mockRateLimit)
      
      render(<StudioPage />)
      
      // Should display rate limit information
      const remaining = mockRateLimit.maxVideos - mockRateLimit.videosGenerated
      expect(screen.getByText(new RegExp(`${remaining}.*remaining`, 'i'))).toBeInTheDocument()
      
      // Generate button should be enabled
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      expect(generateButton).not.toBeDisabled()
    })

    it('should handle rate limit exceeded state', () => {
      mockUseQuery.mockReturnValue({
        ...mockRateLimit,
        canCreateVideo: false,
        videosGenerated: 10,
        maxVideos: 10,
      })
      
      render(<StudioPage />)
      
      // Generate button should be disabled
      const generateButton = screen.getByRole('button', { name: /daily limit reached/i })
      expect(generateButton).toBeDisabled()
    })

    it('should handle too many generating videos state', () => {
      mockUseQuery.mockReturnValue({
        ...mockRateLimit,
        canCreateVideo: false,
        generatingCount: 3,
        maxGenerating: 3,
      })
      
      render(<StudioPage />)
      
      // Generate button should be disabled
      const generateButton = screen.getByRole('button', { name: /too many generating/i })
      expect(generateButton).toBeDisabled()
    })
  })

  describe('Video Generation Integration', () => {
    it('should integrate video generation action with form data', async () => {
      mockUseQuery.mockReturnValue(mockRateLimit)
      mockGenerateVideo.mockResolvedValue({
        success: true,
        videoId: 'new-video-123',
        requestId: 'fal-request-new'
      })
      
      render(<StudioPage />)
      
      // Fill out form
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      await user.type(promptTextarea, 'A beautiful mountain landscape with flowing rivers')
      
      const aspectRatioSelect = screen.getByLabelText(/aspect ratio/i)
      await user.selectOptions(aspectRatioSelect, '9:16')
      
      const durationSelect = screen.getByLabelText(/duration/i)
      await user.selectOptions(durationSelect, '10')
      
      // Submit form
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      // Should call action with correct data
      await waitFor(() => {
        expect(mockGenerateVideo).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt: 'A beautiful mountain landscape with flowing rivers',
            aspectRatio: '9:16',
            duration: '10'
          })
        )
      })
    })

    it('should handle video generation errors', async () => {
      mockUseQuery.mockReturnValue(mockRateLimit)
      mockGenerateVideo.mockRejectedValue(new Error('Generation failed'))
      
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      await user.type(promptTextarea, 'A beautiful landscape')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Videos List Integration', () => {
    it('should integrate video list data with UI', () => {
      const videoList = createVideoList(3)
      
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName.includes('listUserVideos')) {
          return videoList
        }
        if (queryName.includes('getVideoStats')) {
          return mockVideoStats
        }
        return mockRateLimit
      })
      
      render(<VideosPage />)
      
      // Should display videos
      expect(screen.getByText('Test Video 0')).toBeInTheDocument()
      expect(screen.getByText('Test Video 1')).toBeInTheDocument()
      expect(screen.getByText('Test Video 2')).toBeInTheDocument()
    })

    it('should handle empty video list', () => {
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName.includes('listUserVideos')) {
          return []
        }
        if (queryName.includes('getVideoStats')) {
          return { total: 0, completed: 0, generating: 0, failed: 0 }
        }
        return mockRateLimit
      })
      
      render(<VideosPage />)
      
      // Should show empty state
      expect(screen.getByText(/no videos/i)).toBeInTheDocument()
    })

    it('should display video statistics correctly', () => {
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName.includes('listUserVideos')) {
          return [mockVideo, mockGeneratingVideo]
        }
        if (queryName.includes('getVideoStats')) {
          return {
            total: 2,
            completed: 1,
            generating: 1,
            failed: 0,
            todayCount: 2,
            successRate: 50
          }
        }
        return mockRateLimit
      })
      
      render(<VideosPage />)
      
      // Should display correct statistics
      expect(screen.getByText(/total.*2/i)).toBeInTheDocument()
      expect(screen.getByText(/completed.*1/i)).toBeInTheDocument()
      expect(screen.getByText(/generating.*1/i)).toBeInTheDocument()
    })
  })

  describe('Real-time Updates Integration', () => {
    it('should handle video status updates', () => {
      const { rerender } = render(<VideosPage />)
      
      // Initial state - video generating
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName.includes('listUserVideos')) {
          return [mockGeneratingVideo]
        }
        return mockRateLimit
      })
      
      rerender(<VideosPage />)
      expect(screen.getByText(/generating/i)).toBeInTheDocument()
      
      // Updated state - video completed
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName.includes('listUserVideos')) {
          return [{
            ...mockGeneratingVideo,
            status: 'completed',
            url: 'https://example.com/completed-video.mp4'
          }]
        }
        return mockRateLimit
      })
      
      rerender(<VideosPage />)
      expect(screen.getByText(/completed/i)).toBeInTheDocument()
    })

    it('should handle rate limit updates', () => {
      const { rerender } = render(<StudioPage />)
      
      // Initial state - can create videos
      mockUseQuery.mockReturnValue(mockRateLimit)
      rerender(<StudioPage />)
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      expect(generateButton).not.toBeDisabled()
      
      // Updated state - rate limit reached
      mockUseQuery.mockReturnValue({
        ...mockRateLimit,
        canCreateVideo: false,
        videosGenerated: 10,
        maxVideos: 10
      })
      
      rerender(<StudioPage />)
      
      const disabledButton = screen.getByRole('button', { name: /daily limit reached/i })
      expect(disabledButton).toBeDisabled()
    })
  })

  describe('Error Boundary Integration', () => {
    it('should handle Convex query errors gracefully', () => {
      // Mock query error
      mockUseQuery.mockImplementation(() => {
        throw new Error('Convex query failed')
      })
      
      // Should not crash the app
      expect(() => render(<StudioPage />)).not.toThrow()
    })

    it('should handle Convex action errors gracefully', async () => {
      mockUseQuery.mockReturnValue(mockRateLimit)
      mockGenerateVideo.mockRejectedValue(new Error('Convex action failed'))
      
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      await user.type(promptTextarea, 'A beautiful landscape')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      // Should handle error without crashing
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Consistency Integration', () => {
    it('should maintain data consistency across components', () => {
      const videoList = createVideoList(5)
      const stats = {
        total: 5,
        completed: 4,
        generating: 1,
        failed: 0,
        todayCount: 2,
        successRate: 80
      }
      
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName.includes('listUserVideos')) {
          return videoList
        }
        if (queryName.includes('getVideoStats')) {
          return stats
        }
        return mockRateLimit
      })
      
      render(<VideosPage />)
      
      // Video count should match between list and stats
      expect(screen.getByText(/total.*5/i)).toBeInTheDocument()
      
      // Should show all videos in the list
      expect(screen.getByText('Test Video 0')).toBeInTheDocument()
      expect(screen.getByText('Test Video 4')).toBeInTheDocument()
    })
  })
})

