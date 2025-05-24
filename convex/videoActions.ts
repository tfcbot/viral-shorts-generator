"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { fal } from "@fal-ai/client";

// Configure Fal.ai client
fal.config({
  credentials: process.env.FAL_KEY,
});

// TypeScript interfaces for Fal.ai Kling V2 Master API
interface KlingV2Input {
  prompt: string;
  duration: "5" | "10";
  aspect_ratio: "16:9" | "9:16" | "1:1";
  negative_prompt: string;
  cfg_scale: number;
}

interface KlingV2Response {
  data: {
    video: {
      url: string;
      content_type?: string;
      file_name?: string;
      file_size?: number;
    };
  };
  requestId: string;
}

interface QueueUpdate {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  logs?: Array<{ message: string; timestamp: string }>;
  position?: number;
}

// Define the action to generate a video with Fal.ai Kling V2 Master
export const generateVideo = action({
  args: {
    title: v.string(),
    prompt: v.string(),
    aspectRatio: v.optional(v.union(v.literal("16:9"), v.literal("9:16"), v.literal("1:1"))),
    duration: v.optional(v.union(v.literal("5"), v.literal("10"))),
    negativePrompt: v.optional(v.string()),
    cfgScale: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    videoId: v.optional(v.id("videos")),
    error: v.optional(v.string()),
    requestId: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    videoId?: Id<"videos">;
    error?: string;
    requestId?: string;
  }> => {
    // Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    let videoId: Id<"videos"> | undefined;
    
    // Validate prompt length and content
    if (!args.prompt.trim()) {
      return { success: false, error: "Prompt cannot be empty" };
    }
    
    if (args.prompt.length > 1000) {
      return { success: false, error: "Prompt too long. Maximum 1000 characters." };
    }
    
    // Validate CFG scale
    const cfgScale = args.cfgScale ?? 0.5;
    if (cfgScale < 0 || cfgScale > 2) {
      return { success: false, error: "CFG scale must be between 0 and 2" };
    }
    
    // Check if user has enough credits (1 credit per video)
    const CREDITS_NEEDED = 1;
    try {
      const creditCheck = await ctx.runQuery(api.credits.checkCreditsAvailable, {
        creditsNeeded: CREDITS_NEEDED,
      });
      
      if (!creditCheck.hasEnoughCredits) {
        return { 
          success: false, 
          error: `Insufficient credits. You need ${CREDITS_NEEDED} credit but have ${creditCheck.currentCredits}. Purchase more credits to continue.` 
        };
      }
      
      console.log(`[Credits] User has ${creditCheck.currentCredits} credits, proceeding with generation`);
    } catch (error) {
      console.error("[Credits] Error checking credits:", error);
      return { success: false, error: "Failed to verify credit balance" };
    }
    
    try {
      // 1. Create a video record with "generating" status
      videoId = await ctx.runMutation(api.videos.createVideoRecord, {
        userId,
        title: args.title,
        prompt: args.prompt,
      });
      
      console.log(`[Video ${videoId}] Starting generation with Kling V2 Master`);
      
      // 2. Prepare input for Kling V2 Master
      const input: KlingV2Input = {
        prompt: args.prompt,
        duration: args.duration || "5",
        aspect_ratio: args.aspectRatio || "16:9",
        negative_prompt: args.negativePrompt || "blur, distort, and low quality",
        cfg_scale: cfgScale,
      };
      
      console.log(`[Video ${videoId}] Input parameters:`, {
        promptLength: input.prompt.length,
        duration: input.duration,
        aspectRatio: input.aspect_ratio,
        cfgScale: input.cfg_scale,
      });
      
      // 3. Call Fal.ai API using Kling V2 Master model
      const falResponse = await fal.subscribe("fal-ai/kling-video/v2/master/text-to-video", {
        input,
        logs: true,
        onQueueUpdate: (update: QueueUpdate) => {
          console.log(`[Video ${videoId}] Queue Status: ${update.status}`);
          
          if (update.position) {
            console.log(`[Video ${videoId}] Queue Position: ${update.position}`);
          }
          
          if (update.status === "IN_PROGRESS" && update.logs) {
            update.logs.forEach(log => {
              console.log(`[Video ${videoId}] Processing: ${log.message}`);
            });
          }
        },
      }) as KlingV2Response;
      
      console.log(`[Video ${videoId}] Generation completed. Request ID: ${falResponse.requestId}`);
      
      // 4. Validate response
      if (!falResponse.data?.video?.url) {
        console.error(`[Video ${videoId}] No video URL in response:`, falResponse);
        await ctx.runMutation(api.videos.updateVideoStatus, {
          id: videoId,
          status: "failed",
          error: "No video URL returned from Fal.ai",
        });
        return { 
          success: false, 
          error: "No video URL returned from Fal.ai",
          requestId: falResponse.requestId 
        };
      }
      
      // 5. Download the generated video
      const videoUrl = falResponse.data.video.url;
      console.log(`[Video ${videoId}] Downloading video from: ${videoUrl}`);
      
      const videoFetch = await fetch(videoUrl);
      
      if (!videoFetch.ok) {
        const errorMsg = `Failed to download video: ${videoFetch.status} ${videoFetch.statusText}`;
        console.error(`[Video ${videoId}] ${errorMsg}`);
        
        await ctx.runMutation(api.videos.updateVideoStatus, {
          id: videoId,
          status: "failed",
          error: errorMsg,
        });
        return { 
          success: false, 
          error: errorMsg,
          requestId: falResponse.requestId 
        };
      }
      
      // 6. Convert to blob and get file info
      const videoBlob = await videoFetch.blob();
      const contentType = videoFetch.headers.get("content-type") || "video/mp4";
      
      console.log(`[Video ${videoId}] Downloaded video: ${videoBlob.size} bytes, type: ${contentType}`);
      
      // 7. Store the video in Convex storage
      const storageId = await ctx.storage.store(videoBlob);
      console.log(`[Video ${videoId}] Stored in Convex with ID: ${storageId}`);
      
      // 8. Consume credits ONLY after successful generation and storage
      try {
        await ctx.runMutation(api.credits.consumeCredits, {
          amount: CREDITS_NEEDED,
          description: `Video generation: ${args.title}`,
          relatedVideoId: videoId,
        });
        console.log(`[Video ${videoId}] Consumed ${CREDITS_NEEDED} credit for successful generation`);
      } catch (creditError) {
        console.error(`[Video ${videoId}] Failed to consume credits:`, creditError);
        // Don't fail the video generation if credit consumption fails
        // This prevents double-charging if there's a temporary error
      }
      
      // 9. Update the video record with completion data
      await ctx.runMutation(api.videos.updateVideoWithStorage, {
        id: videoId,
        storageId,
        status: "completed",
        creditsUsed: CREDITS_NEEDED, // Track credits used for this video
        metadata: {
          fileSize: videoBlob.size,
          model: "kling-v2-master",
          duration: parseInt(input.duration),
          aspectRatio: input.aspect_ratio,
          resolution: input.aspect_ratio === "16:9" ? "1280x720" : 
                     input.aspect_ratio === "9:16" ? "720x1280" : "720x720",
        },
      });
      
      console.log(`[Video ${videoId}] Successfully completed generation`);
      
      return { 
        success: true, 
        videoId,
        requestId: falResponse.requestId 
      };
      
    } catch (error) {
      // Handle any unexpected errors
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[Video ${videoId}] Error during generation:`, error);
      
      // Try to update the video status if we have a videoId
      if (videoId) {
        await ctx.runMutation(api.videos.updateVideoStatus, {
          id: videoId,
          status: "failed",
          error: errorMessage,
        });
      }
      
      return { 
        success: false, 
        error: errorMessage,
        videoId 
      };
    }
  },
}); 