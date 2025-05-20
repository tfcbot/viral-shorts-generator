import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// List all shorts for the authenticated user
export const listShorts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    const limit = args.limit ?? 100;
    
    const shorts = await ctx.db
      .query("shorts")
      .filter(q => q.eq(q.field("userId"), userId))
      .order("desc")
      .take(limit);
    
    return shorts;
  },
});

// Get a specific short by ID
export const getShortById = query({
  args: {
    id: v.id("shorts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    const short = await ctx.db.get(args.id);
    
    if (!short) {
      throw new Error("Short not found");
    }
    
    // Ensure the user can only access their own shorts
    if (short.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    return short;
  },
});

// Create a new short
export const createShort = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    const shortId = await ctx.db.insert("shorts", {
      userId,
      title: args.title,
      description: args.description,
      prompt: args.prompt,
      status: "generating",
      createdAt: Date.now(),
    });
    
    return shortId;
  },
});

// Update a short's status and add video URL when completed
export const updateShortStatus = mutation({
  args: {
    id: v.id("shorts"),
    status: v.string(),
    videoUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        duration: v.optional(v.number()),
        resolution: v.optional(v.string()),
        fileSize: v.optional(v.number()),
        tags: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    const short = await ctx.db.get(args.id);
    
    if (!short) {
      throw new Error("Short not found");
    }
    
    // Ensure the user can only update their own shorts
    if (short.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    const updates: any = {
      status: args.status,
    };
    
    if (args.videoUrl) {
      updates.videoUrl = args.videoUrl;
    }
    
    if (args.thumbnailUrl) {
      updates.thumbnailUrl = args.thumbnailUrl;
    }
    
    if (args.metadata) {
      updates.metadata = args.metadata;
    }
    
    if (args.status === "completed" && short.status !== "completed") {
      updates.completedAt = Date.now();
    }
    
    await ctx.db.patch(args.id, updates);
    
    return args.id;
  },
});

// Delete a short
export const deleteShort = mutation({
  args: {
    id: v.id("shorts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    const short = await ctx.db.get(args.id);
    
    if (!short) {
      throw new Error("Short not found");
    }
    
    // Ensure the user can only delete their own shorts
    if (short.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.delete(args.id);
    
    return args.id;
  },
});

