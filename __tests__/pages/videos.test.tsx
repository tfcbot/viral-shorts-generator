import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VideosPage from '@/app/dashboard/videos/page'
import { mockUseQuery, mockUseMutation } from '@/src/test/setup'
import { 
  mockVideo, 
  mockGeneratingVideo, 
  mockFailedVideo,
  mockVideoStats,
  mockUserSession 
} from '@/src/test/factories'

// Mock the refresh URL mutation
const mockRefreshUrl = vi.fn()

vi.mock('convex/react', async () => {
  const actual = await vi.importActual('convex/react')
  return {
    ...actual,
    useMutation: () => mockRefreshUrl,
  }
})

describe('Videos Page', () => {
  const user = userEvent.setup()

  const mockVideos = [mockVideo, mockGeneratingVideo, mockFailedVideo]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockUseQuery.mockImplementation((endpoint) => {
      switch (endpoint) {
        case 'listUserVideos':
          return mockVideos
        case 'getVideoStats':
          return mockVideoStats
        case 'getUserSession':
          return mockUserSession
        case 'getGeneratingVideosStatus':
          return [mockGeneratingVideo]
        default:
          return null
      }
    })

    mockRefreshUrl.mockResolvedValue({ success: true })
  })

  describe('Page Rendering', () => {
    it('should render the videos page header', () => {
      render(<VideosPage />)
      
      expect(screen.getByText('Your Videos')).toBeInTheDocument()
      expect(screen.getByText(/manage and view your generated videos/i)).toBeInTheDocument()
    })

    it('should render video statistics', () => {
      render(<VideosPage />)
      
      expect(screen.getByText('Total Videos')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Generating')).toBeInTheDocument()
    })

    it('should render filter and sort controls', () => {
      render(<VideosPage />)
      
      expect(screen.getByLabelText(/filter by status/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument()
    })
  })

  describe('Video List', () => {
    it('should render all videos', () => {
      render(<VideosPage />)
      
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument()
      expect(screen.getByText(mockGeneratingVideo.title)).toBeInTheDocument()
      expect(screen.getByText(mockFailedVideo.title)).toBeInTheDocument()
    })

    it('should show video status badges', () => {
      render(<VideosPage />)
      
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Generating')).toBeInTheDocument()
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })

    it('should show video metadata', () => {
      render(<VideosPage />)
      
      // Check for creation dates
      expect(screen.getByText(new Date(mockVideo.createdAt).toLocaleDateString())).toBeInTheDocument()
      
      // Check for aspect ratios
      if (mockVideo.metadata?.aspectRatio) {
        expect(screen.getByText(`Aspect: ${mockVideo.metadata.aspectRatio}`)).toBeInTheDocument()
      }
    })

    it('should render video thumbnails for completed videos', () => {
      render(<VideosPage />)
      
      const videoElements = screen.getAllByRole('img', { name: /video thumbnail/i })
      expect(videoElements.length).toBeGreaterThan(0)
    })
  })

  describe('Video Filtering', () => {
    it('should filter videos by status', async () => {
      render(<VideosPage />)
      
      const statusFilter = screen.getByLabelText(/filter by status/i)
      await user.selectOptions(statusFilter, 'completed')
      
      // Should only show completed videos
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument()
      expect(screen.queryByText(mockGeneratingVideo.title)).not.toBeInTheDocument()
    })

    it('should filter videos by generating status', async () => {
      render(<VideosPage />)
      
      const statusFilter = screen.getByLabelText(/filter by status/i)
      await user.selectOptions(statusFilter, 'generating')
      
      // Should only show generating videos
      expect(screen.getByText(mockGeneratingVideo.title)).toBeInTheDocument()
      expect(screen.queryByText(mockVideo.title)).not.toBeInTheDocument()
    })

    it('should filter videos by failed status', async () => {
      render(<VideosPage />)
      
      const statusFilter = screen.getByLabelText(/filter by status/i)
      await user.selectOptions(statusFilter, 'failed')
      
      // Should only show failed videos
      expect(screen.getByText(mockFailedVideo.title)).toBeInTheDocument()
      expect(screen.queryByText(mockVideo.title)).not.toBeInTheDocument()
    })

    it('should show all videos when filter is set to all', async () => {
      render(<VideosPage />)
      
      const statusFilter = screen.getByLabelText(/filter by status/i)
      await user.selectOptions(statusFilter, 'all')
      
      // Should show all videos
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument()
      expect(screen.getByText(mockGeneratingVideo.title)).toBeInTheDocument()
      expect(screen.getByText(mockFailedVideo.title)).toBeInTheDocument()
    })
  })

  describe('Video Sorting', () => {
    it('should sort videos by newest first', async () => {
      render(<VideosPage />)
      
      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'newest')
      
      // Verify sorting order (newest first)
      const videoTitles = screen.getAllByTestId(/video-title/i)
      expect(videoTitles[0]).toHaveTextContent(mockGeneratingVideo.title) // Most recent
    })

    it('should sort videos by oldest first', async () => {
      render(<VideosPage />)
      
      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'oldest')
      
      // Verify sorting order (oldest first)
      const videoTitles = screen.getAllByTestId(/video-title/i)
      expect(videoTitles[0]).toHaveTextContent(mockVideo.title) // Oldest
    })
  })

  describe('Video Actions', () => {
    it('should open video modal when clicking on a video', async () => {
      render(<VideosPage />)
      
      const videoCard = screen.getByText(mockVideo.title).closest('div')
      await user.click(videoCard!)
      
      // Should open modal with video details
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument()
    })

    it('should show refresh URL button for completed videos', () => {
      render(<VideosPage />)
      
      // Look for refresh buttons
      const refreshButtons = screen.getAllByRole('button', { name: /refresh url/i })
      expect(refreshButtons.length).toBeGreaterThan(0)
    })

    it('should handle URL refresh action', async () => {
      render(<VideosPage />)
      
      const refreshButton = screen.getAllByRole('button', { name: /refresh url/i })[0]
      await user.click(refreshButton)
      
      expect(mockRefreshUrl).toHaveBeenCalledWith({ id: mockVideo._id })
    })

    it('should show retry button for failed videos', () => {
      render(<VideosPage />)
      
      // Look for retry buttons
      const retryButtons = screen.getAllByRole('button', { name: /retry/i })
      expect(retryButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Video Modal', () => {
    beforeEach(async () => {
      render(<VideosPage />)
      
      // Open modal by clicking on a video
      const videoCard = screen.getByText(mockVideo.title).closest('div')
      await user.click(videoCard!)
    })

    it('should display video details in modal', () => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument()
      expect(screen.getByText(mockVideo.prompt)).toBeInTheDocument()
    })

    it('should show video player for completed videos', () => {
      const videoPlayer = screen.getByRole('video')
      expect(videoPlayer).toBeInTheDocument()
      expect(videoPlayer).toHaveAttribute('src', mockVideo.url)
    })

    it('should show video metadata in modal', () => {
      if (mockVideo.metadata?.aspectRatio) {
        expect(screen.getByText('Aspect Ratio')).toBeInTheDocument()
        expect(screen.getByText(mockVideo.metadata.aspectRatio)).toBeInTheDocument()
      }
      
      if (mockVideo.metadata?.duration) {
        expect(screen.getByText('Duration')).toBeInTheDocument()
      }
    })

    it('should close modal when clicking close button', async () => {
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should close modal when clicking outside', async () => {
      const modal = screen.getByRole('dialog')
      const backdrop = modal.parentElement
      
      if (backdrop) {
        await user.click(backdrop)
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      }
    })
  })

  describe('Empty States', () => {
    it('should show empty state when no videos exist', () => {
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === 'listUserVideos') return []
        if (endpoint === 'getVideoStats') return { ...mockVideoStats, total: 0 }
        return null
      })
      
      render(<VideosPage />)
      
      expect(screen.getByText(/no videos found/i)).toBeInTheDocument()
      expect(screen.getByText(/create your first video/i)).toBeInTheDocument()
    })

    it('should show empty state when filter returns no results', async () => {
      render(<VideosPage />)
      
      const statusFilter = screen.getByLabelText(/filter by status/i)
      await user.selectOptions(statusFilter, 'completed')
      
      // If no completed videos, should show empty state
      if (!mockVideos.some(v => v.status === 'completed')) {
        expect(screen.getByText(/no videos match your filter/i)).toBeInTheDocument()
      }
    })
  })

  describe('Loading States', () => {
    it('should show loading state while fetching videos', () => {
      mockUseQuery.mockImplementation(() => undefined) // Simulate loading
      
      render(<VideosPage />)
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should show loading state during URL refresh', async () => {
      mockRefreshUrl.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ success: true }), 100)
      ))
      
      render(<VideosPage />)
      
      const refreshButton = screen.getAllByRole('button', { name: /refresh url/i })[0]
      await user.click(refreshButton)
      
      expect(screen.getByText(/refreshing/i)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle video loading errors', () => {
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === 'listUserVideos') throw new Error('Failed to load videos')
        return null
      })
      
      render(<VideosPage />)
      
      expect(screen.getByText(/failed to load videos/i)).toBeInTheDocument()
    })

    it('should handle URL refresh errors', async () => {
      mockRefreshUrl.mockRejectedValue(new Error('Refresh failed'))
      
      render(<VideosPage />)
      
      const refreshButton = screen.getAllByRole('button', { name: /refresh url/i })[0]
      await user.click(refreshButton)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to refresh url/i)).toBeInTheDocument()
      })
    })
  })

  describe('Real-time Updates', () => {
    it('should update generating videos status', async () => {
      render(<VideosPage />)
      
      // Simulate status update
      const updatedGeneratingVideo = {
        ...mockGeneratingVideo,
        status: 'completed' as const,
        url: 'https://example.com/completed-video.mp4'
      }
      
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === 'listUserVideos') return [mockVideo, updatedGeneratingVideo, mockFailedVideo]
        if (endpoint === 'getGeneratingVideosStatus') return []
        return mockVideoStats
      })
      
      // Re-render to simulate real-time update
      render(<VideosPage />)
      
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })
  })
})

