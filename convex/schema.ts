import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  
  videos: defineTable({
    userId: v.string(),
    title: v.string(),
    prompt: v.string(),
    status: v.union(
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    storageId: v.optional(v.id("_storage")),
    thumbnailUrl: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    // Add creditsUsed as optional field to match existing data
    creditsUsed: v.optional(v.number()),
    metadata: v.optional(v.object({
      duration: v.optional(v.number()),
      resolution: v.optional(v.string()),
      fileSize: v.optional(v.number()),
      model: v.optional(v.string()),
      aspectRatio: v.optional(v.string()),
    })),
    // Enhanced state management fields
    lastUrlRefresh: v.optional(v.number()),
    urlExpiresAt: v.optional(v.number()),
    retryCount: v.optional(v.number()),
    lastRetryAt: v.optional(v.number()),
    processingLogs: v.optional(v.array(v.object({
      timestamp: v.number(),
      message: v.string(),
      level: v.union(v.literal("info"), v.literal("warning"), v.literal("error")),
    }))),
    // FAL.ai specific fields
    falRequestId: v.optional(v.string()),
    falStatus: v.optional(v.string()),
    queuePosition: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_fal_request", ["falRequestId"])
    .index("by_generating_videos", ["userId", "status", "createdAt"]),

  // New table for tracking video URL cache
  videoUrls: defineTable({
    videoId: v.id("videos"),
    url: v.string(),
    generatedAt: v.number(),
    expiresAt: v.number(),
    isValid: v.boolean(),
  }).index("by_video", ["videoId"])
    .index("by_expiry", ["expiresAt"])
    .index("by_valid_urls", ["videoId", "isValid"]),

  // New table for user session state
  userSessions: defineTable({
    userId: v.string(),
    lastActivity: v.number(),
    activeVideos: v.array(v.id("videos")),
    preferences: v.optional(v.object({
      autoRefreshInterval: v.optional(v.number()),
      notificationsEnabled: v.optional(v.boolean()),
      defaultAspectRatio: v.optional(v.string()),
      defaultDuration: v.optional(v.string()),
    })),
  }).index("by_user", ["userId"])
    .index("by_activity", ["lastActivity"]),
});
