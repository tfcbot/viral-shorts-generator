import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Define plan configurations (credits per plan)
const PLAN_CONFIGS = {
  "starter": { credits: 10, name: "Starter Plan" },
  "pro": { credits: 25, name: "Pro Plan" },
  "unlimited": { credits: 100, name: "Unlimited Plan" },
} as const;

type PlanId = keyof typeof PLAN_CONFIGS;

// Get available plans and their credit amounts
export const getAvailablePlans = query({
  args: {},
  handler: async () => {
    return Object.entries(PLAN_CONFIGS).map(([id, config]) => ({
      id,
      name: config.name,
      credits: config.credits,
      pricePerCredit: 1, // $1 per credit
      totalPrice: config.credits, // Total price in dollars
    }));
  },
});

// Get plan configuration by ID
export const getPlanConfig = query({
  args: { planId: v.string() },
  handler: async (ctx, { planId }) => {
    const config = PLAN_CONFIGS[planId as PlanId];
    if (!config) {
      throw new Error(`Unknown plan: ${planId}`);
    }
    return config;
  },
});

// Cancel subscription (removes plan but keeps credits)
export const cancelSubscription = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // We'll implement this by directly updating the database instead of calling other mutations
    const userId = identity.subject;
    const userCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userCredits) {
      await ctx.db.patch(userCredits._id, {
        planId: undefined,
        planName: "Free Trial",
        subscriptionStatus: "cancelled",
        lastUpdated: Date.now(),
      });
    }

    return { success: true, message: "Subscription cancelled. Your remaining credits are still available." };
  },
}); 