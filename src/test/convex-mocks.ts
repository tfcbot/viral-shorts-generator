import { vi } from 'vitest'
import { 
  mockVideo, 
  mockGeneratingVideo, 
  mockFailedVideo, 
  mockRateLimit, 
  mockVideoStats
} from './factories'

export const createConvexMocks = () => {
  const mockDatabase = {
    videos: [mockVideo, mockGeneratingVideo, mockFailedVideo],
    enhancedVideos: [mockVideo, mockGeneratingVideo, mockFailedVideo],
  }

  const mockQueries = {
    'videos.listUserVideos': () => mockDatabase.videos,
    'videos.getVideo': (args: { id: string }) => 
      mockDatabase.videos.find(v => v._id === args.id),
    'videos.getVideoWithState': (args: { id: string }) =>
      mockDatabase.enhancedVideos.find(v => v._id === args.id),
    'videos.getVideoWithFreshUrl': (args: { id: string }) => {
      const video = mockDatabase.enhancedVideos.find(v => v._id === args.id)
      if (!video) return null
      return {
        ...video,
        url: 'https://fresh-url.example.com/video.mp4',
        lastUrlRefresh: Date.now(),
      }
    },
    'videos.refreshVideoUrl': (args: { id: string }) => {
      const video = mockDatabase.videos.find(v => v._id === args.id)
      if (!video) return null
      return {
        ...video,
        url: 'https://refreshed-url.example.com/video.mp4',
        refreshedAt: Date.now(),
      }
    },
    'videos.checkRateLimit': () => mockRateLimit,
    'videos.getRealTimeRateLimit': () => ({
      ...mockRateLimit,
      lastUpdated: Date.now(),
    }),
    'videos.getVideoStats': () => mockVideoStats,
  }

  const mockMutations = {
    'videos.createVideoRecord': vi.fn().mockImplementation((args) => {
      const newVideo = { 
        ...args, 
        _id: `video-${Date.now()}`,
        status: 'generating',
        createdAt: Date.now(),
      }
      mockDatabase.videos.push(newVideo)
      return newVideo._id
    }),
    'videos.updateVideoStatus': vi.fn().mockImplementation((args) => {
      const video = mockDatabase.videos.find(v => v._id === args.id)
      if (video) {
        Object.assign(video, args)
      }
      return args.id
    }),
    'videos.updateVideoWithStorage': vi.fn().mockImplementation((args) => {
      const video = mockDatabase.videos.find(v => v._id === args.id)
      if (video) {
        Object.assign(video, args)
      }
      return args.id
    }),
    'videos.updateVideoError': vi.fn().mockImplementation((args) => {
      const video = mockDatabase.enhancedVideos.find(v => v._id === args.id)
      if (video) {
        Object.assign(video, args)
      }
      return args.id
    }),
    'videos.ensureFreshVideoUrl': vi.fn().mockImplementation((args) => {
      const video = mockDatabase.enhancedVideos.find(v => v._id === args.id)
      if (video) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (video as any).urlState = {
          lastGenerated: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          needsRefresh: false,
        }
      }
      return args.id
    }),
  }

  const mockActions = {
    'videoActions.generateVideo': vi.fn().mockResolvedValue({
      success: true,
      videoId: 'video-new-123',
      requestId: 'fal-request-123',
    }),
    'videoActions.generateVideoWithErrorTracking': vi.fn().mockResolvedValue({
      success: true,
      videoId: 'video-new-123',
      requestId: 'fal-request-123',
    }),
  }

  return { mockQueries, mockMutations, mockActions, mockDatabase }
}

// Helper to setup Convex mocks in tests
export const setupConvexMocks = () => {
  const mocks = createConvexMocks()
  
  // Return the mocks for manual setup in tests
  return mocks
}
