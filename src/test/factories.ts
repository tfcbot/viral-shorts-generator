import { Id } from '@/convex/_generated/dataModel'

export const mockUser = {
  id: 'user-123',
  firstName: 'Test',
  lastName: 'User',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
}

export const mockVideo = {
  _id: 'video-123' as Id<'videos'>,
  userId: 'user-123',
  title: 'Test Video',
  prompt: 'A test video prompt',
  status: 'completed' as const,
  storageId: 'storage-123' as Id<'_storage'>,
  createdAt: Date.now(),
  completedAt: Date.now(),
  url: 'https://example.com/video.mp4',
  metadata: {
    duration: 10,
    aspectRatio: '16:9',
    fileSize: 1024000,
    model: 'kling-v2-master',
    resolution: '1280x720',
  },
}

export const mockGeneratingVideo = {
  ...mockVideo,
  _id: 'video-generating-123' as Id<'videos'>,
  status: 'generating' as const,
  storageId: undefined,
  completedAt: undefined,
  url: undefined,
}

export const mockFailedVideo = {
  ...mockVideo,
  _id: 'video-failed-123' as Id<'videos'>,
  status: 'failed' as const,
  error: 'Generation failed',
  storageId: undefined,
  completedAt: undefined,
  url: undefined,
}

export const mockRateLimit = {
  canCreateVideo: true,
  generatingCount: 1,
  maxGenerating: 5,
  dailyCount: 3,
  maxDaily: 20,
  timeUntilReset: 86400000, // 24 hours
}

export const mockVideoStats = {
  total: 10,
  generating: 2,
  completed: 7,
  failed: 1,
}

// Enhanced video with new state management fields
export const mockEnhancedVideo = {
  ...mockVideo,
  errorState: {
    hasError: false,
    errorType: '',
    errorMessage: '',
    lastErrorAt: 0,
    retryCount: 0,
  },
  urlState: {
    lastGenerated: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    needsRefresh: false,
  },
}

export const mockVideoWithError = {
  ...mockEnhancedVideo,
  _id: 'video-error-123' as Id<'videos'>,
  status: 'failed' as const,
  errorState: {
    hasError: true,
    errorType: 'generation',
    errorMessage: 'FAL.ai API error',
    lastErrorAt: Date.now(),
    retryCount: 1,
  },
}

export const mockVideoWithExpiredUrl = {
  ...mockEnhancedVideo,
  _id: 'video-expired-123' as Id<'videos'>,
  urlState: {
    lastGenerated: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
    expiresAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
    needsRefresh: true,
  },
}

