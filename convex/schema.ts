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
  
  // User credits and billing information
  userCredits: defineTable({
    userId: v.string(), // Clerk user ID
    credits: v.number(), // Current credit balance
    totalCreditsEver: v.number(), // Total credits purchased/earned lifetime
    planId: v.optional(v.string()), // Current Clerk plan ID
    planName: v.optional(v.string()), // Plan name for display
    subscriptionStatus: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("cancelled"),
      v.literal("past_due")
    )),
    lastUpdated: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Credit transactions for audit trail
  creditTransactions: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("purchase"), // Credits bought through billing
      v.literal("consumption"), // Credits used for video generation
      v.literal("refund"), // Credits refunded
      v.literal("bonus") // Free credits given
    ),
    amount: v.number(), // Positive for additions, negative for deductions
    description: v.string(),
    relatedVideoId: v.optional(v.id("videos")), // If related to video generation
    relatedPlanId: v.optional(v.string()), // If related to plan purchase
    balanceAfter: v.number(), // Credit balance after transaction
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_and_type", ["userId", "type"])
    .index("by_date", ["createdAt"]),
  
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
    creditsUsed: v.optional(v.number()), // Credits consumed for this video
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
