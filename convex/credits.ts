import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's current credit balance and plan info
export const getUserCredits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const userCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userCredits) {
      // Return default values for new users
      return {
        userId,
        credits: 0,
        totalCreditsEver: 0,
        planId: undefined,
        planName: "Free Trial",
        subscriptionStatus: undefined,
        lastUpdated: Date.now(),
        createdAt: Date.now(),
        _id: undefined,
        _creationTime: Date.now(),
      };
    }

    return userCredits;
  },
});

// Initialize user credits (call this when user first signs up)
export const initializeUserCredits = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const existingCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingCredits) {
      return existingCredits;
    }

    // Create initial credit record for new user with 3 free credits
    const newCredits = {
      userId,
      credits: 3,
      totalCreditsEver: 3,
      planId: undefined,
      planName: "Free Trial",
      subscriptionStatus: undefined,
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    };
    
    const creditId = await ctx.db.insert("userCredits", newCredits);
    
    // Record the bonus transaction
    await ctx.db.insert("creditTransactions", {
      userId,
      type: "bonus",
      amount: 3,
      description: "Welcome bonus - 3 free credits",
      balanceAfter: 3,
      createdAt: Date.now(),
    });

    return { ...newCredits, _id: creditId };
  },
});

// Check if user has enough credits for an operation
export const checkCreditsAvailable = query({
  args: { creditsNeeded: v.number() },
  handler: async (ctx, { creditsNeeded }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const userCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const currentCredits = userCredits?.credits || 0;
    return {
      hasEnoughCredits: currentCredits >= creditsNeeded,
      currentCredits,
      creditsNeeded,
      shortfall: Math.max(0, creditsNeeded - currentCredits),
    };
  },
});

// Consume credits for video generation
export const consumeCredits = mutation({
  args: {
    amount: v.number(),
    description: v.string(),
    relatedVideoId: v.optional(v.id("videos")),
  },
  handler: async (ctx, { amount, description, relatedVideoId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const userCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userCredits) {
      throw new Error("User credits not found");
    }

    if (userCredits.credits < amount) {
      throw new Error("Insufficient credits");
    }

    const newBalance = userCredits.credits - amount;

    // Update user credits
    await ctx.db.patch(userCredits._id, {
      credits: newBalance,
      lastUpdated: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      userId,
      type: "consumption",
      amount: -amount,
      description,
      relatedVideoId,
      balanceAfter: newBalance,
      createdAt: Date.now(),
    });

    return { newBalance, consumed: amount };
  },
});

// Add credits to user account (called when billing plan provides credits)
export const addCredits = mutation({
  args: {
    amount: v.number(),
    description: v.string(),
    type: v.union(v.literal("purchase"), v.literal("bonus"), v.literal("refund")),
    relatedPlanId: v.optional(v.string()),
  },
  handler: async (ctx, { amount, description, type, relatedPlanId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    let userCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userCredits) {
      // Create new credit record if it doesn't exist
      const newUserCredits = {
        userId,
        credits: 0,
        totalCreditsEver: 0,
        planId: undefined,
        planName: "Free Trial",
        subscriptionStatus: undefined,
        lastUpdated: Date.now(),
        createdAt: Date.now(),
      };
      const creditId = await ctx.db.insert("userCredits", newUserCredits);
      userCredits = { ...newUserCredits, _id: creditId, _creationTime: Date.now() };
    }

    const newBalance = userCredits.credits + amount;
    const newTotalEver = userCredits.totalCreditsEver + amount;

    // Update user credits
    await ctx.db.patch(userCredits._id, {
      credits: newBalance,
      totalCreditsEver: newTotalEver,
      lastUpdated: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      userId,
      type,
      amount,
      description,
      relatedPlanId,
      balanceAfter: newBalance,
      createdAt: Date.now(),
    });

    return { newBalance, added: amount, totalEver: newTotalEver };
  },
});

// Update user's billing plan information
export const updateUserPlan = mutation({
  args: {
    planId: v.optional(v.string()),
    planName: v.optional(v.string()),
    subscriptionStatus: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("cancelled"),
      v.literal("past_due")
    )),
  },
  handler: async (ctx, { planId, planName, subscriptionStatus }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    let userCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userCredits) {
      // Create new credit record if it doesn't exist
      const newCredits = {
        userId,
        credits: 3, // Free trial credits
        totalCreditsEver: 3,
        planId,
        planName: planName || "Free Trial",
        subscriptionStatus,
        lastUpdated: Date.now(),
        createdAt: Date.now(),
      };
      await ctx.db.insert("userCredits", newCredits);
      return newCredits;
    }

    // Update plan information
    await ctx.db.patch(userCredits._id, {
      planId,
      planName,
      subscriptionStatus,
      lastUpdated: Date.now(),
    });

    return await ctx.db.get(userCredits._id);
  },
});

// Get user's credit transaction history
export const getCreditHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return transactions;
  },
}); 