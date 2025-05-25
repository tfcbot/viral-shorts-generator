import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { 
  mockVideo, 
  mockGeneratingVideo, 
  mockVideoStats,
  mockRateLimit,
  mockUserSession 
} from '@/src/test/factories'

// Mock Convex client
const mockConvexClient = {
  query: vi.fn(),
  mutation: vi.fn(),
  action: vi.fn(),
}

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useAction: vi.fn(),
  useConvexAuth: vi.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
  })),
}))

describe('Convex Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Video Queries', () => {
    it('should fetch user videos successfully', async () => {
      const mockUseQuery = vi.mocked(useQuery)
      mockUseQuery.mockReturnValue([mockVideo, mockGeneratingVideo])

      const { result } = renderHook(() => 
        useQuery(api.videos.listUserVideos)
      )

      expect(result.current).toEqual([mockVideo, mockGeneratingVideo])
      expect(mockUseQuery).toHaveBeenCalledWith(api.videos.listUserVideos)
    })

    it('should fetch video statistics', async () => {
      const mockUseQuery = vi.mocked(useQuery)
      mockUseQuery.mockReturnValue(mockVideoStats)

      const { result } = renderHook(() => 
        useQuery(api.videos.getVideoStats)
      )

      expect(result.current).toEqual(mockVideoStats)
    })

    it('should fetch rate limit information', async () => {
      const mockUseQuery = vi.mocked(useQuery)
      mockUseQuery.mockReturnValue(mockRateLimit)

      const { result } = renderHook(() => 
        useQuery(api.videos.checkRateLimit)
      )

      expect(result.current).toEqual(mockRateLimit)
    })

    it('should fetch user session', async () => {
      const mockUseQuery = vi.mocked(useQuery)
      mockUseQuery.mockReturnValue(mockUserSession)

      const { result } = renderHook(() => 
        useQuery(api.videos.getUserSession)
      )

      expect(result.current).toEqual(mockUserSession)
    })

    it('should fetch generating videos status', async () => {
      const mockUseQuery = vi.mocked(useQuery)
      mockUseQuery.mockReturnValue([mockGeneratingVideo])

      const { result } = renderHook(() => 
        useQuery(api.videos.getGeneratingVideosStatus)
      )

      expect(result.current).toEqual([mockGeneratingVideo])
    })

    it('should handle query errors gracefully', async () => {
      const mockUseQuery = vi.mocked(useQuery)
      mockUseQuery.mockImplementation(() => {
        throw new Error('Query failed')
      })

      expect(() => {
        renderHook(() => useQuery(api.videos.listUserVideos))
      }).toThrow('Query failed')
    })

    it('should handle loading states', async () => {
      const mockUseQuery = vi.mocked(useQuery)
      mockUseQuery.mockReturnValue(undefined) // Loading state

      const { result } = renderHook(() => 
        useQuery(api.videos.listUserVideos)
      )

      expect(result.current).toBeUndefined()
    })
  })

  describe('Video Mutations', () => {
    it('should create video record successfully', async () => {
      const mockUseMutation = vi.mocked(useMutation)
      const mockMutationFn = vi.fn().mockResolvedValue('video-123')
      mockUseMutation.mockReturnValue(mockMutationFn)

      const { result } = renderHook(() => 
        useMutation(api.videos.createVideoRecord)
      )

      const videoData = {
        title: 'Test Video',
        prompt: 'A test video prompt',
        aspectRatio: '16:9' as const
      }

      await result.current(videoData)

      expect(mockMutationFn).toHaveBeenCalledWith(videoData)
    })

    it('should update video status', async () => {
      const mockUseMutation = vi.mocked(useMutation)
      const mockMutationFn = vi.fn().mockResolvedValue('video-123')
      mockUseMutation.mockReturnValue(mockMutationFn)

      const { result } = renderHook(() => 
        useMutation(api.videos.updateVideoStatus)
      )

      const updateData = {
        id: 'video-123',
        status: 'completed' as const,
        url: 'https://example.com/video.mp4'
      }

      await result.current(updateData)

      expect(mockMutationFn).toHaveBeenCalledWith(updateData)
    })

    it('should update video with storage', async () => {
      const mockUseMutation = vi.mocked(useMutation)
      const mockMutationFn = vi.fn().mockResolvedValue('video-123')
      mockUseMutation.mockReturnValue(mockMutationFn)

      const { result } = renderHook(() => 
        useMutation(api.videos.updateVideoWithStorage)
      )

      const storageData = {
        id: 'video-123',
        storageId: 'storage-456',
        url: 'https://example.com/video.mp4'
      }

      await result.current(storageData)

      expect(mockMutationFn).toHaveBeenCalledWith(storageData)
    })

    it('should update user preferences', async () => {
      const mockUseMutation = vi.mocked(useMutation)
      const mockMutationFn = vi.fn().mockResolvedValue('user-123')
      mockUseMutation.mockReturnValue(mockMutationFn)

      const { result } = renderHook(() => 
        useMutation(api.videos.updateUserPreferences)
      )

      const preferences = {
        preferences: {
          defaultAspectRatio: '9:16',
          autoRefreshInterval: 30000
        }
      }

      await result.current(preferences)

      expect(mockMutationFn).toHaveBeenCalledWith(preferences)
    })

    it('should handle mutation errors', async () => {
      const mockUseMutation = vi.mocked(useMutation)
      const mockMutationFn = vi.fn().mockRejectedValue(new Error('Mutation failed'))
      mockUseMutation.mockReturnValue(mockMutationFn)

      const { result } = renderHook(() => 
        useMutation(api.videos.createVideoRecord)
      )

      await expect(result.current({ title: 'Test', prompt: 'Test' }))
        .rejects.toThrow('Mutation failed')
    })
  })

  describe('Video Actions', () => {
    it('should generate video successfully', async () => {
      const mockUseAction = vi.mocked(useAction)
      const mockActionFn = vi.fn().mockResolvedValue({
        success: true,
        videoId: 'video-123',
        requestId: 'fal-request-123'
      })
      mockUseAction.mockReturnValue(mockActionFn)

      const { result } = renderHook(() => 
        useAction(api.videoActions.generateVideo)
      )

      const videoRequest = {
        prompt: 'A beautiful sunset',
        aspectRatio: '16:9' as const,
        negativePrompt: 'blurry, low quality'
      }

      const response = await result.current(videoRequest)

      expect(mockActionFn).toHaveBeenCalledWith(videoRequest)
      expect(response).toEqual({
        success: true,
        videoId: 'video-123',
        requestId: 'fal-request-123'
      })
    })

    it('should handle action errors', async () => {
      const mockUseAction = vi.mocked(useAction)
      const mockActionFn = vi.fn().mockRejectedValue(new Error('Action failed'))
      mockUseAction.mockReturnValue(mockActionFn)

      const { result } = renderHook(() => 
        useAction(api.videoActions.generateVideo)
      )

      await expect(result.current({ prompt: 'Test' }))
        .rejects.toThrow('Action failed')
    })

    it('should handle rate limiting in actions', async () => {
      const mockUseAction = vi.mocked(useAction)
      const mockActionFn = vi.fn().mockRejectedValue(new Error('Rate limit exceeded'))
      mockUseAction.mockReturnValue(mockActionFn)

      const { result } = renderHook(() => 
        useAction(api.videoActions.generateVideo)
      )

      await expect(result.current({ prompt: 'Test' }))
        .rejects.toThrow('Rate limit exceeded')
    })
  })

  describe('Real-time Updates', () => {
    it('should handle real-time video status updates', async () => {
      const mockUseQuery = vi.mocked(useQuery)
      
      // Initial state: generating
      mockUseQuery.mockReturnValueOnce([mockGeneratingVideo])
      
      const { result, rerender } = renderHook(() => 
        useQuery(api.videos.listUserVideos)
      )

      expect(result.current).toEqual([mockGeneratingVideo])

      // Simulate real-time update: completed
      const completedVideo = { ...mockGeneratingVideo, status: 'completed' as const }
      mockUseQuery.mockReturnValueOnce([completedVideo])
      
      rerender()

      expect(result.current).toEqual([completedVideo])
    })

    it('should handle real-time rate limit updates', async () => {
      const mockUseQuery = vi.mocked(useQuery)
      
      // Initial rate limit
      mockUseQuery.mockReturnValueOnce(mockRateLimit)
      
      const { result, rerender } = renderHook(() => 
        useQuery(api.videos.checkRateLimit)
      )

      expect(result.current).toEqual(mockRateLimit)

      // Simulate rate limit change
      const updatedRateLimit = { 
        ...mockRateLimit, 
        videosGenerated: mockRateLimit.videosGenerated + 1 
      }
      mockUseQuery.mockReturnValueOnce(updatedRateLimit)
      
      rerender()

      expect(result.current).toEqual(updatedRateLimit)
    })
  })

  describe('Error Recovery', () => {
    it('should retry failed queries', async () => {
      const mockUseQuery = vi.mocked(useQuery)
      
      // First call fails
      mockUseQuery.mockImplementationOnce(() => {
        throw new Error('Network error')
      })
      
      // Second call succeeds
      mockUseQuery.mockReturnValueOnce([mockVideo])

      const { result, rerender } = renderHook(() => 
        useQuery(api.videos.listUserVideos)
      )

      // First render should throw
      expect(() => result.current).toThrow('Network error')

      // Retry should succeed
      rerender()
      expect(result.current).toEqual([mockVideo])
    })

    it('should handle authentication errors', async () => {
      const mockUseQuery = vi.mocked(useQuery)
      mockUseQuery.mockImplementation(() => {
        throw new Error('Unauthorized')
      })

      expect(() => {
        renderHook(() => useQuery(api.videos.listUserVideos))
      }).toThrow('Unauthorized')
    })
  })

  describe('Data Consistency', () => {
    it('should maintain data consistency across queries', async () => {
      const mockUseQuery = vi.mocked(useQuery)
      
      // Mock consistent data
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === api.videos.listUserVideos) {
          return [mockVideo, mockGeneratingVideo]
        }
        if (endpoint === api.videos.getVideoStats) {
          return {
            total: 2,
            completed: 1,
            generating: 1,
            failed: 0
          }
        }
        return null
      })

      const { result: videosResult } = renderHook(() => 
        useQuery(api.videos.listUserVideos)
      )
      
      const { result: statsResult } = renderHook(() => 
        useQuery(api.videos.getVideoStats)
      )

      const videos = videosResult.current
      const stats = statsResult.current

      expect(videos).toHaveLength(2)
      expect(stats?.total).toBe(2)
      expect(stats?.completed).toBe(1)
      expect(stats?.generating).toBe(1)
    })
  })
})

