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
  }).index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),
});
