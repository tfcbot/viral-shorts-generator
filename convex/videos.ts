import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to check user rate limit (max 5 generating videos at once, max 20 per day)
export const checkRateLimit = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000); // 24 hours ago
    
    try {
      // Get all user videos from the last 24 hours
      const recentVideos = await ctx.db
        .query("videos")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
        .collect();
      
      // Count currently generating videos
      const generatingCount = recentVideos.filter(v => v.status === "generating").length;
      
      // Count total videos created today
      const dailyCount = recentVideos.length;
      
      const canCreateVideo = generatingCount < 5 && dailyCount < 20;
      
      return {
        canCreateVideo,
        generatingCount,
        maxGenerating: 5,
        dailyCount,
        maxDaily: 20,
        timeUntilReset: oneDayAgo + (24 * 60 * 60 * 1000) - now,
        recentVideos: recentVideos.map(v => ({
          id: v._id,
          status: v.status,
          createdAt: v.createdAt,
        })),
      };
    } catch (error) {
      console.error("Error checking rate limit:", error);
      // Return safe defaults on error
      return {
        canCreateVideo: false,
        generatingCount: 0,
        maxGenerating: 5,
        dailyCount: 0,
        maxDaily: 20,
        timeUntilReset: 24 * 60 * 60 * 1000,
        recentVideos: [],
        error: "Failed to check rate limit",
      };
    }
  },
});

// Mutation to create a video record
export const createVideoRecord = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    prompt: v.string(),
    falRequestId: v.optional(v.string()),
  },
  returns: v.id("videos"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check rate limit before creating
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const recentVideos = await ctx.db
      .query("videos")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .collect();
    
    const generatingCount = recentVideos.filter(v => v.status === "generating").length;
    const dailyCount = recentVideos.length;
    
    if (generatingCount >= 5) {
      throw new Error("Rate limit exceeded: You can only have 5 videos generating at once");
    }
    
    if (dailyCount >= 20) {
      throw new Error("Daily limit exceeded: You can only create 20 videos per day");
    }

    const videoId = await ctx.db.insert("videos", {
      userId: args.userId,
      title: args.title,
      prompt: args.prompt,
      status: "generating",
      createdAt: now,
      falRequestId: args.falRequestId,
      retryCount: 0,
      processingLogs: [{
        timestamp: now,
        message: "Video generation started",
        level: "info",
      }],
    });

    // Update user session with new active video
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        lastActivity: now,
        activeVideos: [...session.activeVideos, videoId],
      });
    }

    return videoId;
  },
});

// Mutation to update video status
export const updateVideoStatus = mutation({
  args: {
    id: v.id("videos"),
    status: v.union(v.literal("generating"), v.literal("completed"), v.literal("failed")),
    error: v.optional(v.string()),
    falStatus: v.optional(v.string()),
    queuePosition: v.optional(v.number()),
    logMessage: v.optional(v.string()),
  },
  returns: v.id("videos"),
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.id);
    if (!video) {
      throw new Error("Video not found");
    }
    
    const now = Date.now();
    const updateData: any = {
      status: args.status,
    };
    
    if (args.status === "completed") {
      updateData.completedAt = now;
    }
    
    if (args.error) {
      updateData.error = args.error;
    }

    if (args.falStatus) {
      updateData.falStatus = args.falStatus;
    }

    if (args.queuePosition !== undefined) {
      updateData.queuePosition = args.queuePosition;
    }

    // Add processing log
    const newLog = {
      timestamp: now,
      message: args.logMessage || `Status updated to ${args.status}`,
      level: args.status === "failed" ? "error" as const : "info" as const,
    };

    updateData.processingLogs = [
      ...(video.processingLogs || []),
      newLog,
    ];

    await ctx.db.patch(args.id, updateData);

    // Update user session if video completed or failed
    if (args.status === "completed" || args.status === "failed") {
      const session = await ctx.db
        .query("userSessions")
        .withIndex("by_user", (q) => q.eq("userId", video.userId))
        .first();

      if (session) {
        await ctx.db.patch(session._id, {
          lastActivity: now,
          activeVideos: session.activeVideos.filter(id => id !== args.id),
        });
      }
    }

    return args.id;
  },
});

// Enhanced mutation to update video with storage ID and URL caching
export const updateVideoWithStorage = mutation({
  args: {
    id: v.id("videos"),
    storageId: v.id("_storage"),
    status: v.union(v.literal("generating"), v.literal("completed"), v.literal("failed")),
    metadata: v.optional(v.object({
      fileSize: v.optional(v.number()),
      duration: v.optional(v.number()),
      resolution: v.optional(v.string()),
      model: v.optional(v.string()),
      aspectRatio: v.optional(v.string()),
    })),
  },
  returns: v.id("videos"),
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.id);
    if (!video) {
      throw new Error("Video not found");
    }
    
    const now = Date.now();
    const urlExpiresAt = now + (6 * 60 * 60 * 1000); // URLs expire in 6 hours
    
    await ctx.db.patch(args.id, {
      storageId: args.storageId,
      status: args.status,
      completedAt: now,
      metadata: args.metadata,
      lastUrlRefresh: now,
      urlExpiresAt,
      processingLogs: [
        ...(video.processingLogs || []),
        {
          timestamp: now,
          message: "Video stored and URL cached",
          level: "info",
        },
      ],
    });

    // Generate and cache the initial URL
    try {
      const url = await ctx.storage.getUrl(args.storageId);
      if (url) {
        await ctx.db.insert("videoUrls", {
          videoId: args.id,
          url,
          generatedAt: now,
          expiresAt: urlExpiresAt,
          isValid: true,
        });
      }
    } catch (error) {
      console.error("Failed to generate initial URL:", error);
    }
    
    return args.id;
  },
});

// Enhanced query to list user videos with smart URL management
export const listUserVideos = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(v.literal("generating"), v.literal("completed"), v.literal("failed"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    const limit = args.limit ?? 50;
    const now = Date.now();
    
    let videosQuery;
    
    if (args.status) {
      videosQuery = ctx.db
        .query("videos")
        .withIndex("by_user_and_status", (q) => 
          q.eq("userId", userId).eq("status", args.status!)
        );
    } else {
      videosQuery = ctx.db
        .query("videos")
        .withIndex("by_user", (q) => q.eq("userId", userId));
    }
    
    const videos = await videosQuery
      .order("desc")
      .take(limit);
    
    // Generate URLs for videos with storage IDs (read-only)
    return await Promise.all(
      videos.map(async (video) => {
        if (!video.storageId) {
          return { ...video, url: undefined };
        }

        // Check for cached URL first
        const cachedUrl = await ctx.db
          .query("videoUrls")
          .withIndex("by_valid_urls", (q) => 
            q.eq("videoId", video._id).eq("isValid", true)
          )
          .filter((q) => q.gt(q.field("expiresAt"), now))
          .first();

        if (cachedUrl) {
          return { ...video, url: cachedUrl.url, urlCached: true };
        }

        // Generate new URL if no valid cache (but don't cache it in query)
        try {
          const url = await ctx.storage.getUrl(video.storageId);
          return { ...video, url: url || undefined, urlCached: false };
        } catch (error) {
          console.error(`Failed to generate URL for video ${video._id}:`, error);
          return { ...video, url: undefined };
        }
      })
    );
  },
});

// Enhanced query to get a single video with smart URL handling
export const getVideo = query({
  args: {
    id: v.id("videos"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    const video = await ctx.db.get(args.id);
    
    if (!video) {
      throw new Error("Video not found");
    }

    // Ensure the user can only access their own videos
    if (video.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (!video.storageId) {
      return { ...video, url: undefined };
    }

    const now = Date.now();

    // Check for cached URL first
    const cachedUrl = await ctx.db
      .query("videoUrls")
      .withIndex("by_valid_urls", (q) => 
        q.eq("videoId", video._id).eq("isValid", true)
      )
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .first();

    if (cachedUrl) {
      return { ...video, url: cachedUrl.url, urlCached: true };
    }

    // Generate new URL if no valid cache (but don't cache it in query)
    try {
      const url = await ctx.storage.getUrl(video.storageId);
      return { ...video, url: url || undefined, urlCached: false };
    } catch (error) {
      console.error(`Failed to generate URL for video ${video._id}:`, error);
      return { ...video, url: undefined };
    }
  },
});

// Enhanced query to refresh a video URL with intelligent caching
export const refreshVideoUrl = query({
  args: {
    id: v.id("videos"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    const video = await ctx.db.get(args.id);
    
    if (!video) {
      throw new Error("Video not found");
    }

    // Ensure the user can only access their own videos
    if (video.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (!video.storageId) {
      return { ...video, url: undefined, refreshedAt: Date.now() };
    }

    const now = Date.now();
    
    try {
      // Generate fresh URL (read-only, no caching in query)
      const url = await ctx.storage.getUrl(video.storageId);
      return { ...video, url: url || undefined, refreshedAt: now, urlCached: false };
    } catch (error) {
      console.error(`Failed to refresh URL for video ${args.id}:`, error);
      return { ...video, url: undefined, refreshedAt: now };
    }
  },
});

// Query to get video statistics
export const getVideoStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    generating: v.number(),
    completed: v.number(),
    failed: v.number(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    const allVideos = await ctx.db
      .query("videos")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const stats = {
      total: allVideos.length,
      generating: allVideos.filter(v => v.status === "generating").length,
      completed: allVideos.filter(v => v.status === "completed").length,
      failed: allVideos.filter(v => v.status === "failed").length,
    };
    
    return stats;
  },
});

// New query to get real-time updates for generating videos
export const getGeneratingVideosStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    const generatingVideos = await ctx.db
      .query("videos")
      .withIndex("by_user_and_status", (q) => 
        q.eq("userId", userId).eq("status", "generating")
      )
      .collect();
    
    return generatingVideos.map(video => ({
      id: video._id,
      title: video.title,
      createdAt: video.createdAt,
      falRequestId: video.falRequestId,
      falStatus: video.falStatus,
      queuePosition: video.queuePosition,
      processingLogs: video.processingLogs || [],
      retryCount: video.retryCount || 0,
    }));
  },
});

// New mutation to retry failed video generation
export const retryVideoGeneration = mutation({
  args: {
    id: v.id("videos"),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    const video = await ctx.db.get(args.id);
    
    if (!video) {
      throw new Error("Video not found");
    }

    if (video.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (video.status !== "failed") {
      return { success: false, error: "Video is not in failed state" };
    }

    const retryCount = (video.retryCount || 0) + 1;
    if (retryCount > 3) {
      return { success: false, error: "Maximum retry attempts exceeded" };
    }

    const now = Date.now();
    
    await ctx.db.patch(args.id, {
      status: "generating",
      error: undefined,
      retryCount,
      lastRetryAt: now,
      processingLogs: [
        ...(video.processingLogs || []),
        {
          timestamp: now,
          message: `Retry attempt ${retryCount} started`,
          level: "info",
        },
      ],
    });

    return { success: true };
  },
});

// New query to get user session and preferences
export const getUserSession = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!session) {
      // Return default session structure without creating it
      return {
        _id: null as any,
        userId,
        lastActivity: Date.now(),
        activeVideos: [],
        preferences: {
          autoRefreshInterval: 30000, // 30 seconds
          notificationsEnabled: true,
          defaultAspectRatio: "16:9",
          defaultDuration: "5",
        },
      };
    }

    return session;
  },
});

// New mutation to update user preferences
export const updateUserPreferences = mutation({
  args: {
    preferences: v.object({
      autoRefreshInterval: v.optional(v.number()),
      notificationsEnabled: v.optional(v.boolean()),
      defaultAspectRatio: v.optional(v.string()),
      defaultDuration: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        preferences: {
          ...session.preferences,
          ...args.preferences,
        },
        lastActivity: Date.now(),
      });
    }
  },
});

// New query to clean up expired URLs (can be called periodically)
export const cleanupExpiredUrls = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const expiredUrls = await ctx.db
      .query("videoUrls")
      .withIndex("by_expiry", (q) => q.lt("expiresAt", now))
      .collect();

    for (const urlRecord of expiredUrls) {
      await ctx.db.patch(urlRecord._id, { isValid: false });
    }

    return { cleaned: expiredUrls.length };
  },
});

// New mutation to update user session activity
export const updateUserActivity = mutation({
  args: {
    userId: v.string(),
    activeVideos: v.array(v.id("videos")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        lastActivity: now,
        activeVideos: args.activeVideos,
      });
    } else {
      await ctx.db.insert("userSessions", {
        userId: args.userId,
        lastActivity: now,
        activeVideos: args.activeVideos,
      });
    }
  },
});
