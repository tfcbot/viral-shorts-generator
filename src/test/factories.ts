// Enhanced test factories for comprehensive testing

export const mockVideo = {
  _id: 'video-123',
  title: 'Beautiful Sunset Video',
  prompt: 'A beautiful sunset over the ocean with waves crashing on the shore',
  status: 'completed' as const,
  url: 'https://example.com/video.mp4',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  createdAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
  updatedAt: Date.now() - 1000 * 60 * 30, // 30 minutes ago
  userId: 'user_123',
  metadata: {
    aspectRatio: '16:9',
    duration: 5,
    resolution: '1280x720',
    fileSize: 1024 * 1024 * 10, // 10MB
  },
  falRequestId: 'fal-request-123',
  storageId: 'storage-123',
}

export const mockGeneratingVideo = {
  _id: 'video-generating-456',
  title: 'Mountain Landscape Video',
  prompt: 'A majestic mountain landscape with snow-capped peaks and flowing rivers',
  status: 'generating' as const,
  url: null,
  thumbnailUrl: null,
  createdAt: Date.now() - 1000 * 60 * 10, // 10 minutes ago
  updatedAt: Date.now() - 1000 * 60 * 5, // 5 minutes ago
  userId: 'user_123',
  metadata: {
    aspectRatio: '9:16',
    duration: 10,
  },
  falRequestId: 'fal-request-456',
  storageId: null,
}

export const mockFailedVideo = {
  _id: 'video-failed-789',
  title: 'Failed Video Generation',
  prompt: 'A complex scene that failed to generate',
  status: 'failed' as const,
  url: null,
  thumbnailUrl: null,
  createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  updatedAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
  userId: 'user_123',
  metadata: {
    aspectRatio: '1:1',
    duration: 5,
  },
  falRequestId: 'fal-request-789',
  storageId: null,
  error: 'Generation failed due to content policy violation',
}

// Enhanced video objects for advanced testing
export const mockEnhancedVideo = {
  ...mockVideo,
  _id: 'video-enhanced-123',
  title: 'Enhanced Video with State',
  urlState: {
    lastGenerated: Date.now() - 1000 * 60 * 60, // 1 hour ago
    expiresAt: Date.now() + 1000 * 60 * 60 * 23, // 23 hours from now
    needsRefresh: false,
  },
  errorHistory: [],
  retryCount: 0,
}

export const mockVideoWithError = {
  ...mockFailedVideo,
  _id: 'video-with-error-456',
  title: 'Video with Error History',
  errorHistory: [
    {
      timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
      error: 'Network timeout',
      retryable: true,
    },
    {
      timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
      error: 'Content policy violation',
      retryable: false,
    },
  ],
  retryCount: 2,
}

export const mockVideoWithExpiredUrl = {
  ...mockVideo,
  _id: 'video-expired-url-789',
  title: 'Video with Expired URL',
  urlState: {
    lastGenerated: Date.now() - 1000 * 60 * 60 * 25, // 25 hours ago
    expiresAt: Date.now() - 1000 * 60 * 60, // 1 hour ago (expired)
    needsRefresh: true,
  },
  url: 'https://expired-url.example.com/video.mp4',
}

export const mockVideoStats = {
  total: 15,
  completed: 12,
  generating: 2,
  failed: 1,
  todayCount: 3,
  successRate: 80,
}

export const mockRateLimit = {
  canCreateVideo: true,
  videosGenerated: 3,
  maxVideos: 10,
  generatingCount: 1,
  maxGenerating: 3,
  timeUntilReset: 0,
  resetTime: Date.now() + 1000 * 60 * 60 * 24, // 24 hours from now
}

export const mockUserSession = {
  _id: 'session-123',
  userId: 'user_123',
  lastActivity: Date.now() - 1000 * 60 * 15, // 15 minutes ago
  preferences: {
    defaultAspectRatio: '16:9',
    autoRefreshInterval: 30000,
    notificationsEnabled: true,
  },
  stats: {
    totalVideosGenerated: 15,
    totalTimeSpent: 1000 * 60 * 60 * 5, // 5 hours
    favoriteAspectRatio: '16:9',
  },
}

// Factory functions for creating test data
export const createMockVideo = (overrides: Partial<typeof mockVideo> = {}) => ({
  ...mockVideo,
  ...overrides,
})

export const createMockGeneratingVideo = (overrides: Partial<typeof mockGeneratingVideo> = {}) => ({
  ...mockGeneratingVideo,
  ...overrides,
})

export const createMockFailedVideo = (overrides: Partial<typeof mockFailedVideo> = {}) => ({
  ...mockFailedVideo,
  ...overrides,
})

export const createMockVideoStats = (overrides: Partial<typeof mockVideoStats> = {}) => ({
  ...mockVideoStats,
  ...overrides,
})

export const createMockRateLimit = (overrides: Partial<typeof mockRateLimit> = {}) => ({
  ...mockRateLimit,
  ...overrides,
})

export const createMockUserSession = (overrides: Partial<typeof mockUserSession> = {}) => ({
  ...mockUserSession,
  ...overrides,
})

// Helper functions for common test scenarios
export const createRateLimitExceeded = () => createMockRateLimit({
  canCreateVideo: false,
  videosGenerated: 10,
  maxVideos: 10,
  timeUntilReset: 1000 * 60 * 60 * 12, // 12 hours
})

export const createTooManyGenerating = () => createMockRateLimit({
  canCreateVideo: false,
  generatingCount: 3,
  maxGenerating: 3,
})

export const createEmptyVideoList = () => []

export const createVideoList = (count: number = 5) => {
  const videos = []
  for (let i = 0; i < count; i++) {
    videos.push(createMockVideo({
      _id: `video-${i}`,
      title: `Test Video ${i}`,
      createdAt: Date.now() - (i * 1000 * 60 * 60), // Each video 1 hour older
    }))
  }
  return videos
}
