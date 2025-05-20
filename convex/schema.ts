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
  
  // Define the shorts table for storing video shorts
  shorts: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    prompt: v.string(),
    status: v.string(), // "generating", "completed", "failed"
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    thumbnailUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        duration: v.optional(v.number()),
        resolution: v.optional(v.string()),
        fileSize: v.optional(v.number()),
        tags: v.optional(v.array(v.string())),
      })
    ),
  }),
});
