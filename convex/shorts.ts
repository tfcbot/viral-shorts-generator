import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

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
    
    // In a real implementation, you would trigger a background job here
    // to generate the short video. For now, we'll simulate it by
    // updating the status after a delay.
    
    // This is just for demo purposes - in production you would use a proper
    // background job system or webhook
    setTimeout(async () => {
      await ctx.runMutation(api.shorts.updateShortStatus, {
        id: shortId,
        status: "completed",
        videoUrl: `https://example.com/videos/${shortId}`,
        thumbnailUrl: `https://example.com/thumbnails/${shortId}.jpg`,
      });
    }, 5000);
    
    return shortId;
  },
});

export const updateShortStatus = mutation({
  args: {
    id: v.id("shorts"),
    status: v.string(),
    videoUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const short = await ctx.db.get(args.id);
    if (!short) {
      throw new Error("Short not found");
    }
    
    await ctx.db.patch(args.id, {
      status: args.status,
      videoUrl: args.videoUrl,
      thumbnailUrl: args.thumbnailUrl,
      completedAt: args.status === "completed" ? Date.now() : undefined,
    });
    
    return args.id;
  },
});

export const listShorts = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("shorts")),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.string()),
    filterStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    const limit = args.limit ?? 50;
    
    let query = ctx.db
      .query("shorts")
      .withIndex("by_user", (q) => q.eq("userId", userId));
    
    // Apply status filter if provided
    if (args.filterStatus) {
      query = query.filter((q) => q.eq(q.field("status"), args.filterStatus));
    }
    
    // Apply sorting
    const sortField = args.sortBy || "createdAt";
    const sortOrder = args.sortOrder === "asc" ? "asc" : "desc";
    
    query = query.order(sortOrder);
    
    // Apply pagination if cursor is provided
    if (args.cursor) {
      query = query.cursor(args.cursor);
    }
    
    const shorts = await query.take(limit);
    
    return shorts;
  },
});

// Get a single short by ID
export const getShort = query({
  args: {
    id: v.id("shorts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const short = await ctx.db.get(args.id);
    
    if (!short) {
      throw new Error("Short not found");
    }
    
    // Ensure the user can only access their own shorts
    if (short.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    
    return short;
  },
});

