import { Id } from "@/convex/_generated/dataModel";

// Enhanced mock video data with new schema fields
export const mockVideo = {
  _id: "test-video-123" as Id<"videos">,
  userId: "user_123",
  title: "Test Video",
  prompt: "A beautiful sunset over mountains",
  status: "completed" as const,
  createdAt: Date.now() - 3600000, // 1 hour ago
  completedAt: Date.now() - 1800000, // 30 minutes ago
  url: "https://example.com/video.mp4",
  urlCached: true,
  metadata: {
    duration: 5,
    aspectRatio: "16:9",
    fileSize: 1024000,
    model: "kling-v2-master",
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
};

export const mockGeneratingVideo = {
  _id: "test-video-generating" as Id<"videos">,
  userId: "user_123",
  title: "Generating Video",
  prompt: "A dynamic cityscape at night",
  status: "generating" as const,
  createdAt: Date.now() - 600000, // 10 minutes ago
  retryCount: 0,
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
};

export const mockFailedVideo = {
  _id: "test-video-failed" as Id<"videos">,
  userId: "user_123",
  title: "Failed Video",
  prompt: "A complex scene that failed",
  status: "failed" as const,
  createdAt: Date.now() - 7200000, // 2 hours ago
  error: "Generation timeout",
  retryCount: 1,
  lastRetryAt: Date.now() - 3600000,
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
};

export const mockVideoStats = {
  total: 10,
  generating: 1,
  completed: 8,
  failed: 1,
};

export const mockRateLimit = {
  canCreateVideo: true,
  generatingCount: 1,
  maxGenerating: 5,
  dailyCount: 3,
  maxDaily: 20,
  timeUntilReset: 86400000, // 24 hours
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

export const createMockRateLimit = (overrides: Partial<typeof mockRateLimit> = {}) => ({
  ...mockRateLimit,
  ...overrides,
});

export const createMockUserSession = (overrides: Partial<typeof mockUserSession> = {}) => ({
  ...mockUserSession,
  ...overrides,
});

