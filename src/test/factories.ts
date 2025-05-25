import { Id } from "@/convex/_generated/dataModel";

// Enhanced mock video data with new schema fields
export const mockVideo = {
  _id: "test-video-123" as Id<"videos">,
  userId: "user_123",
  title: "Beautiful Sunset Video",
  prompt: "A beautiful sunset over the ocean with waves crashing on the shore",
  status: "completed" as const,
  createdAt: Date.now() - 3600000, // 1 hour ago
  completedAt: Date.now() - 1800000, // 30 minutes ago
  url: "https://example.com/video.mp4",
  urlCached: true,
  thumbnailUrl: "https://example.com/thumbnail.jpg",
  metadata: {
    duration: 5,
    aspectRatio: "16:9",
    fileSize: 1024000,
    model: "kling-v2-master",
    resolution: "1280x720",
  },
  // Enhanced schema fields
  lastUrlRefresh: Date.now() - 1800000,
  urlExpiresAt: Date.now() + 18000000, // 5 hours from now
  retryCount: 0,
  processingLogs: [
    {
      timestamp: Date.now() - 3600000,
      message: "Video generation started",
      level: "info" as const,
    },
    {
      timestamp: Date.now() - 1800000,
      message: "Video generation completed",
      level: "info" as const,
    },
  ],
  falRequestId: "fal-request-123",
  falStatus: "COMPLETED",
  storageId: "storage-123",
};

export const mockGeneratingVideo = {
  _id: "test-video-generating" as Id<"videos">,
  userId: "user_123",
  title: "Mountain Landscape Video",
  prompt: "A majestic mountain landscape with snow-capped peaks and flowing rivers",
  status: "generating" as const,
  createdAt: Date.now() - 600000, // 10 minutes ago
  retryCount: 0,
  metadata: {
    aspectRatio: "9:16",
    duration: 10,
  },
  processingLogs: [
    {
      timestamp: Date.now() - 600000,
      message: "Video generation started",
      level: "info" as const,
    },
    {
      timestamp: Date.now() - 300000,
      message: "Queue status: IN_PROGRESS",
      level: "info" as const,
    },
  ],
  falRequestId: "fal-request-generating",
  falStatus: "IN_PROGRESS",
  queuePosition: 2,
  storageId: null,
};

export const mockFailedVideo = {
  _id: "test-video-failed" as Id<"videos">,
  userId: "user_123",
  title: "Failed Video Generation",
  prompt: "A complex scene that failed to generate",
  status: "failed" as const,
  createdAt: Date.now() - 7200000, // 2 hours ago
  error: "Generation failed due to content policy violation",
  retryCount: 1,
  lastRetryAt: Date.now() - 3600000,
  metadata: {
    aspectRatio: "1:1",
    duration: 5,
  },
  processingLogs: [
    {
      timestamp: Date.now() - 7200000,
      message: "Video generation started",
      level: "info" as const,
    },
    {
      timestamp: Date.now() - 3600000,
      message: "Retry attempt 1 started",
      level: "info" as const,
    },
    {
      timestamp: Date.now() - 3600000,
      message: "Generation failed: Generation timeout",
      level: "error" as const,
    },
  ],
  falRequestId: "fal-request-failed",
  falStatus: "FAILED",
  storageId: null,
};

export const mockVideoStats = {
  total: 15,
  generating: 2,
  completed: 12,
  failed: 1,
  todayCount: 3,
  successRate: 80,
};

export const mockRateLimit = {
  canCreateVideo: true,
  videosGenerated: 3,
  maxVideos: 10,
  generatingCount: 1,
  maxGenerating: 5,
  dailyCount: 3,
  maxDaily: 20,
  timeUntilReset: 86400000, // 24 hours
  resetTime: Date.now() + 1000 * 60 * 60 * 24, // 24 hours from now
  recentVideos: [
    {
      id: "test-video-123" as Id<"videos">,
      status: "completed" as const,
      createdAt: Date.now() - 3600000,
    },
    {
      id: "test-video-generating" as Id<"videos">,
      status: "generating" as const,
      createdAt: Date.now() - 600000,
    },
  ],
};

export const mockRateLimitExceeded = {
  ...mockRateLimit,
  canCreateVideo: false,
  generatingCount: 5,
  dailyCount: 20,
  videosGenerated: 10,
  maxVideos: 10,
  timeUntilReset: 1000 * 60 * 60 * 12, // 12 hours
};

export const mockGeneratingVideosStatus = [
  {
    id: "test-video-generating" as Id<"videos">,
    title: "Generating Video",
    createdAt: Date.now() - 600000,
    falRequestId: "fal-request-generating",
    falStatus: "IN_PROGRESS",
    queuePosition: 2,
    processingLogs: [
      {
        timestamp: Date.now() - 600000,
        message: "Video generation started",
        level: "info" as const,
      },
      {
        timestamp: Date.now() - 300000,
        message: "Queue status: IN_PROGRESS",
        level: "info" as const,
      },
    ],
    retryCount: 0,
  },
];

export const mockUserSession = {
  _id: "test-session-123" as Id<"userSessions">,
  userId: "user_123",
  lastActivity: Date.now(),
  activeVideos: ["test-video-generating" as Id<"videos">],
  preferences: {
    autoRefreshInterval: 30000,
    notificationsEnabled: true,
    defaultAspectRatio: "16:9",
    defaultDuration: "5",
  },
  stats: {
    totalVideosGenerated: 15,
    totalTimeSpent: 1000 * 60 * 60 * 5, // 5 hours
    favoriteAspectRatio: "16:9",
  },
};

export const mockVideoUrl = {
  _id: "test-url-123" as Id<"videoUrls">,
  videoId: "test-video-123" as Id<"videos">,
  url: "https://example.com/video.mp4",
  generatedAt: Date.now() - 1800000,
  expiresAt: Date.now() + 18000000,
  isValid: true,
};

// Factory functions for creating test data
export const createMockVideo = (overrides: Partial<typeof mockVideo> = {}) => ({
  ...mockVideo,
  ...overrides,
});

export const createMockGeneratingVideo = (overrides: Partial<typeof mockGeneratingVideo> = {}) => ({
  ...mockGeneratingVideo,
  ...overrides,
});

export const createMockFailedVideo = (overrides: Partial<typeof mockFailedVideo> = {}) => ({
  ...mockFailedVideo,
  ...overrides,
});

export const createMockVideoStats = (overrides: Partial<typeof mockVideoStats> = {}) => ({
  ...mockVideoStats,
  ...overrides,
});

export const createMockRateLimit = (overrides: Partial<typeof mockRateLimit> = {}) => ({
  ...mockRateLimit,
  ...overrides,
});

export const createMockUserSession = (overrides: Partial<typeof mockUserSession> = {}) => ({
  ...mockUserSession,
  ...overrides,
});

// Helper functions for common test scenarios
export const createRateLimitExceeded = () => createMockRateLimit({
  canCreateVideo: false,
  videosGenerated: 10,
  maxVideos: 10,
  timeUntilReset: 1000 * 60 * 60 * 12, // 12 hours
});

export const createTooManyGenerating = () => createMockRateLimit({
  canCreateVideo: false,
  generatingCount: 5,
  maxGenerating: 5,
});

export const createEmptyVideoList = () => [];

export const createVideoList = (count: number = 5) => {
  const videos = [];
  for (let i = 0; i < count; i++) {
    videos.push(createMockVideo({
      _id: `video-${i}` as Id<"videos">,
      title: `Test Video ${i}`,
      createdAt: Date.now() - (i * 1000 * 60 * 60), // Each video 1 hour older
    }));
  }
  return videos;
};
