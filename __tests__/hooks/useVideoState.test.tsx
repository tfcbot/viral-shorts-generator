import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVideoState } from '@/src/hooks/useVideoState'
import { 
  mockVideo, 
  mockGeneratingVideo, 
  mockFailedVideo, 
  mockVideoStats, 
  mockRateLimit,
  mockGeneratingVideosStatus,
  mockUserSession 
} from '@/src/test/factories'
import { mockUseQuery, mockUseMutation } from '@/src/test/setup'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useVideoState Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('[]')
    
    // Set up default mock implementations
    mockUseQuery.mockImplementation((queryName: string) => {
      switch (queryName) {
        case 'listUserVideos':
          return [mockVideo, mockGeneratingVideo, mockFailedVideo]
        case 'getVideoStats':
          return mockVideoStats
        case 'checkRateLimit':
          return mockRateLimit
        case 'getGeneratingVideosStatus':
          return mockGeneratingVideosStatus
        case 'getUserSession':
          return mockUserSession
        default:
          return null
      }
    })
    
    mockUseMutation.mockResolvedValue({ success: true })
  })

  it('should return video data and stats', () => {
    const { result } = renderHook(() => useVideoState())
    
    expect(result.current.videos).toHaveLength(3)
    expect(result.current.stats).toEqual(mockVideoStats)
    expect(result.current.rateLimit).toEqual(mockRateLimit)
    expect(result.current.generatingVideos).toEqual(mockGeneratingVideosStatus)
    expect(result.current.userSession).toEqual(mockUserSession)
  })

  it('should provide computed values correctly', () => {
    const { result } = renderHook(() => useVideoState())
    
    expect(result.current.hasGeneratingVideos).toBe(true)
    expect(result.current.canCreateVideo).toBe(true)
    expect(result.current.isAtRateLimit).toBe(false)
    expect(result.current.completedVideos).toHaveLength(1)
    expect(result.current.failedVideos).toHaveLength(1)
  })

  it('should filter videos by status correctly', () => {
    const { result } = renderHook(() => useVideoState())
    
    const completedVideos = result.current.getVideosByStatus('completed')
    const generatingVideos = result.current.getVideosByStatus('generating')
    const failedVideos = result.current.getVideosByStatus('failed')
    
    expect(completedVideos).toHaveLength(1)
    expect(generatingVideos).toHaveLength(1)
    expect(failedVideos).toHaveLength(1)
    
    expect(completedVideos[0].status).toBe('completed')
    expect(generatingVideos[0].status).toBe('generating')
    expect(failedVideos[0].status).toBe('failed')
  })

  it('should get video by ID correctly', () => {
    const { result } = renderHook(() => useVideoState())
    
    const video = result.current.getVideoById(mockVideo._id)
    expect(video).toEqual(mockVideo)
    
    const nonExistentVideo = result.current.getVideoById('non-existent' as any)
    expect(nonExistentVideo).toBeUndefined()
  })

  it('should get video logs correctly', () => {
    const { result } = renderHook(() => useVideoState())
    
    const logs = result.current.getVideoLogs(mockVideo._id)
    expect(logs).toEqual(mockVideo.processingLogs)
    
    const emptyLogs = result.current.getVideoLogs('non-existent' as any)
    expect(emptyLogs).toEqual([])
  })

  it('should detect when video needs URL refresh', () => {
    const { result } = renderHook(() => useVideoState())
    
    // Video with recent completion should not need refresh
    const recentVideo = { ...mockVideo, completedAt: Date.now() - 1000 }
    expect(result.current.needsUrlRefresh(recentVideo)).toBe(false)
    
    // Video completed more than 5 hours ago should need refresh
    const oldVideo = { 
      ...mockVideo, 
      completedAt: Date.now() - (6 * 60 * 60 * 1000),
      urlCached: true 
    }
    expect(result.current.needsUrlRefresh(oldVideo)).toBe(true)
    
    // Video without URL should not need refresh
    const videoWithoutUrl = { ...mockVideo, url: undefined }
    expect(result.current.needsUrlRefresh(videoWithoutUrl)).toBe(false)
  })

  it('should handle retry video functionality', async () => {
    const { result } = renderHook(() => useVideoState())
    
    await act(async () => {
      const retryResult = await result.current.retryVideo(mockFailedVideo._id)
      expect(retryResult.success).toBe(true)
    })
    
    expect(mockUseMutation).toHaveBeenCalledWith({ id: mockFailedVideo._id })
  })

  it('should handle update preferences functionality', async () => {
    const { result } = renderHook(() => useVideoState())
    
    const newPreferences = {
      autoRefreshInterval: 60000,
      notificationsEnabled: false,
    }
    
    await act(async () => {
      await result.current.updatePreferences(newPreferences)
    })
    
    expect(mockUseMutation).toHaveBeenCalledWith({ preferences: newPreferences })
  })

  it('should handle refresh videos functionality', async () => {
    const { result } = renderHook(() => useVideoState())
    
    expect(result.current.isRefreshing).toBe(false)
    
    await act(async () => {
      await result.current.refreshVideos()
    })
    
    // Should update lastRefresh timestamp
    expect(result.current.lastRefresh).toBeGreaterThan(Date.now() - 1000)
  })

  it('should handle rate limit exceeded state', () => {
    const rateLimitExceeded = {
      ...mockRateLimit,
      canCreateVideo: false,
      generatingCount: 5,
    }
    
    // Reset and set up new mock implementation
    mockUseQuery.mockImplementation((queryName: string) => {
      switch (queryName) {
        case 'listUserVideos':
          return [mockVideo, mockGeneratingVideo, mockFailedVideo]
        case 'getVideoStats':
          return mockVideoStats
        case 'checkRateLimit':
          return rateLimitExceeded
        case 'getGeneratingVideosStatus':
          return mockGeneratingVideosStatus
        case 'getUserSession':
          return mockUserSession
        default:
          return null
      }
    })
    
    const { result } = renderHook(() => useVideoState())
    
    expect(result.current.canCreateVideo).toBe(false)
    expect(result.current.isAtRateLimit).toBe(true)
  })

  it('should handle auto-refresh with custom interval', () => {
    vi.useFakeTimers()
    
    const { result } = renderHook(() => 
      useVideoState({ 
        autoRefresh: true, 
        refreshInterval: 10000 // 10 seconds
      })
    )
    
    const initialRefresh = result.current.lastRefresh
    
    // Fast-forward time by 10 seconds
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    
    // Should have updated the refresh timestamp
    expect(result.current.lastRefresh).toBeGreaterThan(initialRefresh)
    
    vi.useRealTimers()
  })

  it('should handle disabled auto-refresh', () => {
    vi.useFakeTimers()
    
    const { result } = renderHook(() => 
      useVideoState({ autoRefresh: false })
    )
    
    const initialRefresh = result.current.lastRefresh
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(60000)
    })
    
    // Should not have updated since auto-refresh is disabled
    expect(result.current.lastRefresh).toBe(initialRefresh)
    
    vi.useRealTimers()
  })
})
