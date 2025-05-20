import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  
  shorts: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    prompt: v.string(),
    status: v.string(), // "generating", "completed", "failed"
    videoUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    createdAt: v.number(), // timestamp
    completedAt: v.optional(v.number()), // timestamp
    metadata: v.optional(v.object({
      duration: v.optional(v.number()),
      resolution: v.optional(v.string()),
      fileSize: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
    })),
  }).index("by_user", ["userId"]),
});

