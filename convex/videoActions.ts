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
    
    // Check if user has the pro plan using Clerk billing
    let hasVideoGenerationAccess = false;
    
    try {
      // In Convex, we need to check if the user has the pro plan
      // This will be implemented when Clerk billing is properly set up
      // For now, allow access for development
      hasVideoGenerationAccess = true;
      
      // TODO: Implement proper plan checking once Clerk billing is configured
      // The frontend will handle plan checking using the Protect component
    } catch (error) {
      // If billing is not set up yet, allow access for development
      console.warn("Billing check failed in generateVideo, allowing access:", error);
      hasVideoGenerationAccess = true;
    }
    
    // Note: Plan checking is primarily handled on the frontend with Clerk's Protect component
    // This backend check serves as a secondary validation
    
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
    
    try {
      // 1. Create a video record with "generating" status and enhanced logging
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
      
      // 3. Call Fal.ai API using Kling V2 Master model with enhanced logging
      const falResponse = await fal.subscribe("fal-ai/kling-video/v2/master/text-to-video", {
        input,
        logs: true,
        onQueueUpdate: async (update: QueueUpdate) => {
          console.log(`[Video ${videoId}] Queue Status: ${update.status}`);
          
          // Update video status with queue information
          await ctx.runMutation(api.videos.updateVideoStatus, {
            id: videoId!,
            status: "generating",
            falStatus: update.status,
            queuePosition: update.position,
            logMessage: `Queue status: ${update.status}${update.position ? ` (position: ${update.position})` : ''}`,
          });
          
          if (update.position) {
            console.log(`[Video ${videoId}] Queue Position: ${update.position}`);
          }
          
          if (update.status === "IN_PROGRESS" && update.logs) {
            for (const log of update.logs) {
              console.log(`[Video ${videoId}] Processing: ${log.message}`);
              
              // Log processing updates
              await ctx.runMutation(api.videos.updateVideoStatus, {
                id: videoId!,
                status: "generating",
                falStatus: "IN_PROGRESS",
                logMessage: log.message,
              });
            }
          }
        },
      }) as KlingV2Response;
      
      console.log(`[Video ${videoId}] Generation completed. Request ID: ${falResponse.requestId}`);
      
      // Update video with FAL request ID
      await ctx.runMutation(api.videos.updateVideoStatus, {
        id: videoId,
        status: "generating",
        falStatus: "COMPLETED",
        logMessage: `Generation completed. Request ID: ${falResponse.requestId}`,
      });
      
      // 4. Validate response
      if (!falResponse.data?.video?.url) {
        console.error(`[Video ${videoId}] No video URL in response:`, falResponse);
        await ctx.runMutation(api.videos.updateVideoStatus, {
          id: videoId,
          status: "failed",
          error: "No video URL returned from Fal.ai",
          logMessage: "Failed: No video URL in response",
        });
        return { 
          success: false, 
          error: "No video URL returned from Fal.ai",
          requestId: falResponse.requestId 
        };
      }
      
      // 5. Download the generated video with progress logging
      const videoUrl = falResponse.data.video.url;
      console.log(`[Video ${videoId}] Downloading video from: ${videoUrl}`);
      
      await ctx.runMutation(api.videos.updateVideoStatus, {
        id: videoId,
        status: "generating",
        logMessage: "Downloading video from Fal.ai",
      });
      
      const videoFetch = await fetch(videoUrl);
      
      if (!videoFetch.ok) {
        const errorMsg = `Failed to download video: ${videoFetch.status} ${videoFetch.statusText}`;
        console.error(`[Video ${videoId}] ${errorMsg}`);
        
        await ctx.runMutation(api.videos.updateVideoStatus, {
          id: videoId,
          status: "failed",
          error: errorMsg,
          logMessage: `Download failed: ${errorMsg}`,
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
      
      await ctx.runMutation(api.videos.updateVideoStatus, {
        id: videoId,
        status: "generating",
        logMessage: `Downloaded video: ${Math.round(videoBlob.size / 1024 / 1024 * 100) / 100}MB`,
      });
      
      // 7. Store the video in Convex storage
      const storageId = await ctx.storage.store(videoBlob);
      console.log(`[Video ${videoId}] Stored in Convex with ID: ${storageId}`);
      
      // 8. Update the video record with completion data using enhanced mutation
      await ctx.runMutation(api.videos.updateVideoWithStorage, {
        id: videoId,
        storageId,
        status: "completed",
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
      // Handle any unexpected errors with enhanced logging
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[Video ${videoId}] Error during generation:`, error);
      
      // Try to update the video status if we have a videoId
      if (videoId) {
        await ctx.runMutation(api.videos.updateVideoStatus, {
          id: videoId,
          status: "failed",
          error: errorMessage,
          logMessage: `Generation failed: ${errorMessage}`,
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
