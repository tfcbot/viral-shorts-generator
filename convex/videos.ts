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
    };
  },
});

// Mutation to create a video record
export const createVideoRecord = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    prompt: v.string(),
  },
  returns: v.id("videos"),
  handler: async (ctx, args) => {
    // Check rate limit before creating
    const now = Date.now();
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
    
    return await ctx.db.insert("videos", {
      userId: args.userId,
      title: args.title,
      prompt: args.prompt,
      status: "generating",
      createdAt: Date.now(),
    });
  },
});

// Mutation to update video status
export const updateVideoStatus = mutation({
  args: {
    id: v.id("videos"),
    status: v.union(v.literal("generating"), v.literal("completed"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  returns: v.id("videos"),
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.id);
    if (!video) {
      throw new Error("Video not found");
    }
    
    const updateData: any = {
      status: args.status,
    };
    
    if (args.status === "completed") {
      updateData.completedAt = Date.now();
    }
    
    if (args.error) {
      updateData.error = args.error;
    }
    
    await ctx.db.patch(args.id, updateData);
    return args.id;
  },
});

// Mutation to update video with storage ID
export const updateVideoWithStorage = mutation({
  args: {
    id: v.id("videos"),
    storageId: v.id("_storage"),
    status: v.union(v.literal("generating"), v.literal("completed"), v.literal("failed")),
    creditsUsed: v.optional(v.number()),
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
    
    const updateData: any = {
      storageId: args.storageId,
      status: args.status,
      completedAt: Date.now(),
      metadata: args.metadata,
    };
    
    if (args.creditsUsed !== undefined) {
      updateData.creditsUsed = args.creditsUsed;
    }
    
    await ctx.db.patch(args.id, updateData);
    
    return args.id;
  },
});

// Query to list user videos with URLs
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
    
    // Generate URLs for videos with storage IDs
    return await Promise.all(
      videos.map(async (video) => {
        if (video.storageId) {
          const url = await ctx.storage.getUrl(video.storageId);
          return { ...video, url: url || undefined };
        }
        return { ...video, url: undefined };
      })
    );
  },
});

// Query to get a single video by ID
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
    
    // Generate URL if the video has a storage ID
    if (video.storageId) {
      const url = await ctx.storage.getUrl(video.storageId);
      return { ...video, url: url || undefined };
    }
    
    return { ...video, url: undefined };
  },
});

// Query to refresh a video URL (useful when URLs expire)
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
    
    // Generate a fresh URL if the video has a storage ID
    if (video.storageId) {
      const url = await ctx.storage.getUrl(video.storageId);
      return { ...video, url: url || undefined, refreshedAt: Date.now() };
    }
    
    return { ...video, url: undefined, refreshedAt: Date.now() };
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