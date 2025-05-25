import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardPage from '@/app/dashboard/page'
import { mockUseQuery } from '@/src/test/setup'
import { 
  mockVideo, 
  mockGeneratingVideo, 
  mockVideoStats,
  mockRateLimit,
  mockUserSession 
} from '@/src/test/factories'

describe('Dashboard Page', () => {
  const user = userEvent.setup()

  const mockVideos = [mockVideo, mockGeneratingVideo]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockUseQuery.mockImplementation((endpoint) => {
      switch (endpoint) {
        case 'listUserVideos':
          return mockVideos
        case 'getVideoStats':
          return mockVideoStats
        case 'checkRateLimit':
          return mockRateLimit
        case 'getUserSession':
          return mockUserSession
        case 'getGeneratingVideosStatus':
          return [mockGeneratingVideo]
        default:
          return null
      }
    })
  })

  describe('Page Rendering', () => {
    it('should render the dashboard header', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    })

    it('should render navigation links', () => {
      render(<DashboardPage />)
      
      expect(screen.getByRole('link', { name: /studio/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /videos/i })).toBeInTheDocument()
    })

    it('should render quick stats cards', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText('Total Videos')).toBeInTheDocument()
      expect(screen.getByText('Videos Generated Today')).toBeInTheDocument()
      expect(screen.getByText('Success Rate')).toBeInTheDocument()
    })
  })

  describe('Statistics Display', () => {
    it('should display correct video statistics', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText(mockVideoStats.total.toString())).toBeInTheDocument()
      expect(screen.getByText(mockVideoStats.completed.toString())).toBeInTheDocument()
      expect(screen.getByText(mockVideoStats.generating.toString())).toBeInTheDocument()
    })

    it('should display rate limit information', () => {
      render(<DashboardPage />)
      
      const remaining = mockRateLimit.maxVideos - mockRateLimit.videosGenerated
      expect(screen.getByText(remaining.toString())).toBeInTheDocument()
      expect(screen.getByText(/videos remaining/i)).toBeInTheDocument()
    })

    it('should calculate and display success rate', () => {
      render(<DashboardPage />)
      
      const successRate = Math.round((mockVideoStats.completed / mockVideoStats.total) * 100)
      expect(screen.getByText(`${successRate}%`)).toBeInTheDocument()
    })
  })

  describe('Recent Videos Section', () => {
    it('should render recent videos section', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText('Recent Videos')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /view all videos/i })).toBeInTheDocument()
    })

    it('should display recent videos', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument()
      expect(screen.getByText(mockGeneratingVideo.title)).toBeInTheDocument()
    })

    it('should show video status badges', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Generating')).toBeInTheDocument()
    })

    it('should limit displayed videos to recent ones', () => {
      const manyVideos = Array.from({ length: 10 }, (_, i) => ({
        ...mockVideo,
        _id: `video-${i}`,
        title: `Video ${i}`,
        createdAt: Date.now() - (i * 1000 * 60 * 60) // Each video 1 hour older
      }))
      
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === 'listUserVideos') return manyVideos
        if (endpoint === 'getVideoStats') return { ...mockVideoStats, total: 10 }
        return mockRateLimit
      })
      
      render(<DashboardPage />)
      
      // Should only show first few videos (e.g., 5)
      expect(screen.getByText('Video 0')).toBeInTheDocument()
      expect(screen.getByText('Video 4')).toBeInTheDocument()
      expect(screen.queryByText('Video 9')).not.toBeInTheDocument()
    })
  })

  describe('Quick Actions', () => {
    it('should render create video button', () => {
      render(<DashboardPage />)
      
      const createButton = screen.getByRole('link', { name: /create new video/i })
      expect(createButton).toBeInTheDocument()
      expect(createButton).toHaveAttribute('href', '/dashboard/studio')
    })

    it('should render view all videos button', () => {
      render(<DashboardPage />)
      
      const viewAllButton = screen.getByRole('link', { name: /view all videos/i })
      expect(viewAllButton).toBeInTheDocument()
      expect(viewAllButton).toHaveAttribute('href', '/dashboard/videos')
    })
  })

  describe('Activity Feed', () => {
    it('should show generating videos status', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText(/currently generating/i)).toBeInTheDocument()
      expect(screen.getByText(mockGeneratingVideo.title)).toBeInTheDocument()
    })

    it('should show empty state when no activity', () => {
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === 'getGeneratingVideosStatus') return []
        if (endpoint === 'listUserVideos') return [mockVideo] // Only completed videos
        return mockVideoStats
      })
      
      render(<DashboardPage />)
      
      expect(screen.getByText(/no current activity/i)).toBeInTheDocument()
    })
  })

  describe('User Session Integration', () => {
    it('should display user preferences', () => {
      render(<DashboardPage />)
      
      // Should show user's default settings
      if (mockUserSession.preferences?.defaultAspectRatio) {
        expect(screen.getByText(mockUserSession.preferences.defaultAspectRatio)).toBeInTheDocument()
      }
    })

    it('should show last activity timestamp', () => {
      render(<DashboardPage />)
      
      if (mockUserSession.lastActivity) {
        const lastActivity = new Date(mockUserSession.lastActivity).toLocaleDateString()
        expect(screen.getByText(lastActivity)).toBeInTheDocument()
      }
    })
  })

  describe('Loading States', () => {
    it('should show loading state while fetching data', () => {
      mockUseQuery.mockImplementation(() => undefined) // Simulate loading
      
      render(<DashboardPage />)
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should show skeleton loaders for stats', () => {
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === 'getVideoStats') return undefined
        return mockRateLimit
      })
      
      render(<DashboardPage />)
      
      // Should show loading placeholders
      const skeletons = screen.getAllByTestId(/skeleton/i)
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle stats loading errors', () => {
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === 'getVideoStats') throw new Error('Failed to load stats')
        return mockRateLimit
      })
      
      render(<DashboardPage />)
      
      expect(screen.getByText(/failed to load statistics/i)).toBeInTheDocument()
    })

    it('should handle videos loading errors', () => {
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === 'listUserVideos') throw new Error('Failed to load videos')
        return mockVideoStats
      })
      
      render(<DashboardPage />)
      
      expect(screen.getByText(/failed to load recent videos/i)).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should render properly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<DashboardPage />)
      
      // Should still render main elements
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Total Videos')).toBeInTheDocument()
    })
  })

  describe('Real-time Updates', () => {
    it('should update when new videos are generated', async () => {
      render(<DashboardPage />)
      
      // Simulate new video completion
      const updatedStats = {
        ...mockVideoStats,
        completed: mockVideoStats.completed + 1,
        total: mockVideoStats.total + 1
      }
      
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === 'getVideoStats') return updatedStats
        return mockVideos
      })
      
      // Re-render to simulate real-time update
      render(<DashboardPage />)
      
      expect(screen.getByText(updatedStats.completed.toString())).toBeInTheDocument()
    })

    it('should update generating videos status', async () => {
      render(<DashboardPage />)
      
      // Simulate video completion
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === 'getGeneratingVideosStatus') return []
        return mockVideoStats
      })
      
      // Re-render to simulate real-time update
      render(<DashboardPage />)
      
      expect(screen.getByText(/no current activity/i)).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate to studio page', async () => {
      render(<DashboardPage />)
      
      const studioLink = screen.getByRole('link', { name: /studio/i })
      expect(studioLink).toHaveAttribute('href', '/dashboard/studio')
    })

    it('should navigate to videos page', async () => {
      render(<DashboardPage />)
      
      const videosLink = screen.getByRole('link', { name: /videos/i })
      expect(videosLink).toHaveAttribute('href', '/dashboard/videos')
    })
  })
})

