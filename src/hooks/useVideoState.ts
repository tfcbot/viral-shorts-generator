"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

export type VideoStatus = "generating" | "completed" | "failed";

export interface Video {
  _id: Id<"videos">;
  title: string;
  prompt: string;
  status: VideoStatus;
  createdAt: number;
  completedAt?: number;
  url?: string;
  urlCached?: boolean;
  metadata?: {
    duration?: number;
    aspectRatio?: string;
    fileSize?: number;
    model?: string;
  };
  error?: string;
  processingLogs?: Array<{
    timestamp: number;
    message: string;
    level: "info" | "warning" | "error";
  }>;
  falRequestId?: string;
  falStatus?: string;
  queuePosition?: number;
  retryCount?: number;
}

export interface VideoStats {
  total: number;
  generating: number;
  completed: number;
  failed: number;
}

export interface RateLimit {
  canCreateVideo: boolean;
  generatingCount: number;
  maxGenerating: number;
  dailyCount: number;
  maxDaily: number;
  timeUntilReset: number;
  recentVideos?: Array<{
    id: Id<"videos">;
    status: VideoStatus;
    createdAt: number;
  }>;
  error?: string;
}

export interface UserSession {
  _id: Id<"userSessions">;
  userId: string;
  lastActivity: number;
  activeVideos: Id<"videos">[];
  preferences?: {
    autoRefreshInterval?: number;
    notificationsEnabled?: boolean;
    defaultAspectRatio?: string;
    defaultDuration?: string;
  };
}

/**
 * Enhanced hook for managing video state with automatic refresh and error handling
 */
export function useVideoState(options: {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableNotifications?: boolean;
} = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableNotifications = true,
  } = options;

  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Core queries
  const videos = useQuery(api.videos.listUserVideos, { limit: 50 }) || [];
  const stats = useQuery(api.videos.getVideoStats) || {
    total: 0,
    generating: 0,
    completed: 0,
    failed: 0,
  };
  const rateLimit = useQuery(api.videos.checkRateLimit) || {
    canCreateVideo: true,
    generatingCount: 0,
    maxGenerating: 5,
    dailyCount: 0,
    maxDaily: 20,
    timeUntilReset: 0,
  };

  // Enhanced queries for real-time updates
  const generatingVideos = useQuery(api.videos.getGeneratingVideosStatus) || [];
  const userSession = useQuery(api.videos.getUserSession);

  // Mutations
  const retryVideoGeneration = useMutation(api.videos.retryVideoGeneration);
  const updateUserPreferences = useMutation(api.videos.updateUserPreferences);

  // Auto-refresh logic for generating videos
  useEffect(() => {
    if (!autoRefresh || generatingVideos.length === 0) return;

    const interval = setInterval(() => {
      setLastRefresh(Date.now());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, generatingVideos.length]);

  // Notification system for completed videos
  useEffect(() => {
    if (!enableNotifications) return;

    const completedVideos = videos.filter(v => v.status === "completed");
    const previousCompleted = JSON.parse(
      localStorage.getItem("completedVideos") || "[]"
    );

    const newlyCompleted = completedVideos.filter(
      v => !previousCompleted.includes(v._id)
    );

    if (newlyCompleted.length > 0) {
      newlyCompleted.forEach(video => {
        toast.success(`Video "${video.title}" completed!`, {
          duration: 5000,
          icon: "🎬",
        });
      });

      localStorage.setItem(
        "completedVideos",
        JSON.stringify(completedVideos.map(v => v._id))
      );
    }
  }, [videos, enableNotifications]);

  // Error notification system
  useEffect(() => {
    if (!enableNotifications) return;

    const failedVideos = videos.filter(v => v.status === "failed");
    const previousFailed = JSON.parse(
      localStorage.getItem("failedVideos") || "[]"
    );

    const newlyFailed = failedVideos.filter(
      v => !previousFailed.includes(v._id)
    );

    if (newlyFailed.length > 0) {
      newlyFailed.forEach(video => {
        toast.error(`Video "${video.title}" failed: ${video.error}`, {
          duration: 8000,
          icon: "❌",
        });
      });

      localStorage.setItem(
        "failedVideos",
        JSON.stringify(failedVideos.map(v => v._id))
      );
    }
  }, [videos, enableNotifications]);

  // Manual refresh function
  const refreshVideos = useCallback(async () => {
    setIsRefreshing(true);
    try {
      setLastRefresh(Date.now());
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Retry failed video
  const retryVideo = useCallback(async (videoId: Id<"videos">) => {
    try {
      const result = await retryVideoGeneration({ id: videoId });
      if (result.success) {
        toast.success("Video retry initiated", { icon: "🔄" });
        refreshVideos();
      } else {
        toast.error(result.error || "Failed to retry video");
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Retry failed: ${message}`);
      return { success: false, error: message };
    }
  }, [retryVideoGeneration, refreshVideos]);

  // Update user preferences
  const updatePreferences = useCallback(async (preferences: Partial<UserSession["preferences"]>) => {
    try {
      await updateUserPreferences({ preferences });
      toast.success("Preferences updated", { icon: "⚙️" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update preferences: ${message}`);
    }
  }, [updateUserPreferences]);

  // Get video by ID with URL refresh
  const getVideoById = useCallback((id: Id<"videos">) => {
    return videos.find(v => v._id === id);
  }, [videos]);

  // Filter videos by status
  const getVideosByStatus = useCallback((status: VideoStatus) => {
    return videos.filter(v => v.status === status);
  }, [videos]);

  // Get processing logs for a video
  const getVideoLogs = useCallback((id: Id<"videos">) => {
    const video = getVideoById(id);
    return video?.processingLogs || [];
  }, [getVideoById]);

  // Check if video needs URL refresh
  const needsUrlRefresh = useCallback((video: Video) => {
    if (!video.url || !video.urlCached) return false;
    // Refresh URLs that are older than 5 hours
    const fiveHoursAgo = Date.now() - (5 * 60 * 60 * 1000);
    return (video.completedAt || 0) < fiveHoursAgo;
  }, []);

  return {
    // Data
    videos,
    stats,
    rateLimit,
    generatingVideos,
    userSession,
    
    // State
    isRefreshing,
    lastRefresh,
    
    // Actions
    refreshVideos,
    retryVideo,
    updatePreferences,
    
    // Utilities
    getVideoById,
    getVideosByStatus,
    getVideoLogs,
    needsUrlRefresh,
    
    // Computed values
    hasGeneratingVideos: generatingVideos.length > 0,
    canCreateVideo: rateLimit.canCreateVideo,
    isAtRateLimit: !rateLimit.canCreateVideo,
    completedVideos: videos.filter(v => v.status === "completed"),
    failedVideos: videos.filter(v => v.status === "failed"),
  };
}

/**
 * Hook for managing a single video's state with real-time updates
 */
export function useVideoDetails(videoId: Id<"videos">) {
  const video = useQuery(api.videos.getVideo, { id: videoId });
  const refreshedVideo = useQuery(api.videos.refreshVideoUrl, { id: videoId });
  
  const [needsRefresh, setNeedsRefresh] = useState(false);
  
  // Check if URL needs refresh
  useEffect(() => {
    if (video?.url && video.urlCached) {
      const fiveHoursAgo = Date.now() - (5 * 60 * 60 * 1000);
      setNeedsRefresh((video.completedAt || 0) < fiveHoursAgo);
    }
  }, [video]);
  
  const refreshUrl = useCallback(() => {
    setNeedsRefresh(false);
    // The refreshedVideo query will automatically update
  }, []);
  
  return {
    video: needsRefresh ? refreshedVideo : video,
    needsRefresh,
    refreshUrl,
    isLoading: !video,
  };
}

