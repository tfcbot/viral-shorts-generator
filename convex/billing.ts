import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Define plan configurations
const PLAN_CONFIGS = {
  "pro": { 
    credits: 30, 
    name: "Pro Plan",
    monthlyPrice: 100,
    description: "30 credits per month + rollover"
  },
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
      monthlyPrice: config.monthlyPrice,
      description: config.description,
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

// Grant monthly credits to all active subscribers (run on 1st of each month)
export const grantMonthlyCredits = mutation({
  args: {},
  handler: async (ctx) => {
    const allActiveSubscribers = await ctx.db
      .query("userCredits")
      .filter((q) => q.eq(q.field("subscriptionStatus"), "active"))
      .collect();
    
    let grantedCount = 0;
    const maxCredits = 200; // Cap at ~6-7 months of credits to prevent infinite accumulation
    
    for (const user of allActiveSubscribers) {
      const currentCredits = user.credits || 0;
      const creditsToGrant = 30;
      const newBalance = Math.min(currentCredits + creditsToGrant, maxCredits);
      const actualGranted = newBalance - currentCredits;
      
      if (actualGranted > 0) {
        await ctx.db.patch(user._id, {
          credits: newBalance,
          totalCreditsEver: (user.totalCreditsEver || 0) + actualGranted,
          lastUpdated: Date.now(),
        });
        
        // Record transaction
        await ctx.db.insert("creditTransactions", {
          userId: user.userId,
          type: "bonus",
          amount: actualGranted,
          description: `Monthly subscription credits${actualGranted < creditsToGrant ? ' (capped at 200)' : ''}`,
          balanceAfter: newBalance,
          createdAt: Date.now(),
        });
        
        grantedCount++;
      }
    }
    
    return { 
      success: true, 
      grantedToUsers: grantedCount,
      message: `Monthly credits granted to ${grantedCount} active subscribers` 
    };
  },
});

// Check if user has access to the dashboard (active subscription OR credits)
export const checkDashboardAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { hasAccess: false, reason: "not_authenticated" };
    }

    const userId = identity.subject;
    const userCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // If no user record exists, return default values for new users
    if (!userCredits) {
      return {
        hasAccess: false, // New users need to subscribe or get credits
        isActiveSubscriber: false,
        hasCredits: false,
        credits: 0,
        planName: "No Plan",
        reason: "new_user_no_credits"
      };
    }

    const isActiveSubscriber = userCredits.subscriptionStatus === "active";
    const hasCredits = (userCredits.credits || 0) > 0;
    
    // Allow access if user has active subscription OR has credits
    const hasAccess = isActiveSubscriber || hasCredits;
    
    return {
      hasAccess,
      isActiveSubscriber,
      hasCredits,
      credits: userCredits.credits || 0,
      planName: userCredits.planName || "No Plan",
      reason: hasAccess 
        ? (isActiveSubscriber ? "active_subscription" : "has_credits") 
        : "no_subscription_or_credits"
    };
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

    const userId = identity.subject;
    const userCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userCredits) {
      await ctx.db.patch(userCredits._id, {
        planId: undefined,
        planName: "No Plan",
        subscriptionStatus: "cancelled",
        lastUpdated: Date.now(),
      });
    }

    return { 
      success: true, 
      message: "Subscription cancelled. You will lose access to the dashboard." 
    };
  },
}); 