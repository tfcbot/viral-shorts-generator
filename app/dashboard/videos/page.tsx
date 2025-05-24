"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import VideoPlayer from "@/components/VideoPlayer";
import { Id } from "@/convex/_generated/dataModel";

type VideoStatus = "generating" | "completed" | "failed";
type SortOption = "newest" | "oldest" | "name" | "status";

type Video = {
  _id: Id<"videos">;
  title: string;
  prompt: string;
  status: VideoStatus;
  createdAt: number;
  completedAt?: number;
  url?: string;
  metadata?: {
    duration?: number;
    aspectRatio?: string;
    fileSize?: number;
    model?: string;
  };
  error?: string;
};

export default function VideosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VideoStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Fetch videos from Convex
  const videos = useQuery(api.videos.listUserVideos, { 
    limit: 50,
    status: statusFilter === "all" ? undefined : statusFilter 
  }) || [];

  // Fetch video statistics
  const stats = useQuery(api.videos.getVideoStats) || {
    total: 0,
    generating: 0,
    completed: 0,
    failed: 0
  };

  // Fetch rate limit info
  const rateLimit = useQuery(api.videos.checkRateLimit) || {
    canCreateVideo: true,
    generatingCount: 0,
    maxGenerating: 5,
    dailyCount: 0,
    maxDaily: 20,
    timeUntilReset: 0,
  };

  // Filter and sort videos
  const filteredVideos = videos
    .filter((video: Video) => 
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: Video, b: Video) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "oldest":
          return a.createdAt - b.createdAt;
        case "name":
          return a.title.localeCompare(b.title);
        case "status":
          const statusOrder: Record<VideoStatus, number> = { "generating": 0, "completed": 1, "failed": 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return b.createdAt - a.createdAt;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Videos</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Manage and track all your AI-generated videos</p>
        </div>
        <div className="flex items-center gap-3">
          {rateLimit.canCreateVideo ? (
            <Link
              href="/dashboard/studio"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
              Limit Reached
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Videos" value={stats.total.toString()} icon="🎥" />
        <StatCard title="Completed" value={stats.completed.toString()} icon="✅" />
        <StatCard title="Generating" value={stats.generating.toString()} icon="⏳" />
        <StatCard title="Failed" value={stats.failed.toString()} icon="❌" />
      </div>

      {/* Rate Limit Info */}
      {!rateLimit.canCreateVideo && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-300">Generation Limits Reached</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {rateLimit.generatingCount >= rateLimit.maxGenerating 
                  ? `You have ${rateLimit.generatingCount} videos generating (max ${rateLimit.maxGenerating})`
                  : `Daily limit reached (${rateLimit.dailyCount}/${rateLimit.maxDaily})`
                }
              </p>
            </div>
            <Link
              href="/dashboard/studio"
              className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 text-sm font-medium"
            >
              View Limits →
            </Link>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VideoStatus | "all")}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="generating">Generating</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded text-sm font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8V8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded text-sm font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Content */}
      {filteredVideos.length > 0 ? (
        viewMode === "table" ? (
          <VideosTable videos={filteredVideos} onViewVideo={setSelectedVideo} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video: Video) => (
              <VideoCard 
                key={video._id} 
                video={video} 
                onViewVideo={() => setSelectedVideo(video)}
              />
            ))}
          </div>
        )
      ) : videos.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">No videos match your search criteria.</p>
        </div>
      )}

      {/* Video Detail Modal */}
      {selectedVideo && (
        <VideoDetailModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}
    </div>
  );
}

function VideosTable({ videos, onViewVideo }: { videos: Video[]; onViewVideo: (video: Video) => void }) {
  const getStatusBadge = (status: VideoStatus) => {
    switch (status) {
      case "completed":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">✅ Completed</span>;
      case "generating":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">⏳ Generating</span>;
      case "failed":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">❌ Failed</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300">⭕ Unknown</span>;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    return `${seconds}s`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preview</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {videos.map((video) => (
              <tr key={video._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4">
                  <div className="w-16 h-12 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center relative overflow-hidden">
                    {video.status === "completed" && video.url ? (
                      <div className="w-full h-full">
                        <VideoPlayer
                          src={video.url}
                          title={video.title}
                          autoPlay={false}
                          controls={false}
                          muted={true}
                          className="w-full h-full"
                          poster=""
                          showRetry={false}
                        />
                      </div>
                    ) : (
                      <div className="text-slate-400 text-xs text-center">
                        {video.status === "generating" ? "⏳" : 
                         video.status === "failed" ? "❌" : "🎬"}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{video.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{video.prompt}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(video.status)}
                  {video.status === "failed" && video.error && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-xs truncate" title={video.error}>
                      {video.error}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900 dark:text-white">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(video.createdAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    {video.metadata?.aspectRatio && (
                      <div>Aspect: {video.metadata.aspectRatio}</div>
                    )}
                    {video.metadata?.duration && (
                      <div>Duration: {formatDuration(video.metadata.duration)}</div>
                    )}
                    {video.metadata?.fileSize && (
                      <div>Size: {formatFileSize(video.metadata.fileSize)}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {video.status === "completed" && video.url && (
                      <>
                        <button
                          onClick={() => onViewVideo(video)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                          title="View video"
                        >
                          View
                        </button>
                        <a
                          href={video.url}
                          download={`${video.title}.mp4`}
                          className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 text-sm font-medium"
                          title="Download video"
                        >
                          Download
                        </a>
                      </>
                    )}
                    {video.status === "generating" && (
                      <span className="text-slate-400 text-sm">Processing...</span>
                    )}
                    {video.status === "failed" && (
                      <span className="text-red-500 text-sm">Failed</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

function VideoCard({ 
  video,
  onViewVideo
}: { 
  video: Video;
  onViewVideo: () => void;
}) {
  const [showHoverControls, setShowHoverControls] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const getStatusColor = (status: VideoStatus) => {
    switch (status) {
      case "completed": return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300";
      case "generating": return "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300";
      case "failed": return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300";
      default: return "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: VideoStatus) => {
    switch (status) {
      case "completed": return "✅";
      case "generating": return "⏳";
      case "failed": return "❌";
      default: return "⭕";
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    return `${seconds}s`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handlePreviewError = (error: string) => {
    setPreviewError(error);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail/Preview */}
      <div 
        className="aspect-video bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative group"
        onMouseEnter={() => setShowHoverControls(true)}
        onMouseLeave={() => setShowHoverControls(false)}
      >
        {video.status === "completed" && video.url ? (
          <div className="w-full h-full relative">
            <VideoPlayer
              src={video.url}
              title={video.title}
              autoPlay={false}
              controls={showHoverControls}
              muted={true}
              className="w-full h-full"
              poster=""
              onError={handlePreviewError}
              showRetry={true}
            />
            {/* Hover overlay with play button and actions */}
            {showHoverControls && !previewError && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center transition-opacity">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewVideo();
                    }}
                    className="bg-white bg-opacity-90 hover:bg-opacity-100 text-slate-900 p-2 rounded-full transition-all transform hover:scale-105"
                    title="View in fullscreen"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-7V4a1 1 0 00-1-1H5a1 1 0 00-1 1v3M7 21h10a2 2 0 002-2v-5a2 2 0 00-2-2H7a2 2 0 00-2 2v5a2 2 0 002 2z" />
                    </svg>
                  </button>
                  {video.url && (
                    <a
                      href={video.url}
                      download={`${video.title}.mp4`}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 text-slate-900 p-2 rounded-full transition-all transform hover:scale-105"
                      title="Download video"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            {video.status === "generating" ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            ) : video.status === "failed" ? (
              <div className="text-red-500 text-2xl mb-2">❌</div>
            ) : (
              <div className="text-slate-400 text-2xl mb-2">🎬</div>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {video.status === "generating" ? "Generating..." : 
               video.status === "failed" ? "Generation Failed" : 
               "No Preview"}
            </p>
          </div>
        )}
        {video.metadata?.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.metadata.duration)}
          </div>
        )}
        {previewError && (
          <div className="absolute top-2 left-2 right-2 bg-red-500 bg-opacity-90 text-white text-xs px-2 py-1 rounded text-center">
            Preview failed to load
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 text-sm">{video.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs">{getStatusIcon(video.status)}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {video.prompt}
        </p>

        <div className="space-y-2">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(video.status)}`}>
            {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div>Created: {new Date(video.createdAt).toLocaleDateString()}</div>
            {video.metadata?.aspectRatio && (
              <div>Aspect: {video.metadata.aspectRatio}</div>
            )}
            {video.metadata?.fileSize && (
              <div>Size: {formatFileSize(video.metadata.fileSize)}</div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            {video.status === "completed" && video.url && (
              <button
                onClick={onViewVideo}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
              >
                View Video
              </button>
            )}
            {video.url && (
              <a
                href={video.url}
                download={`${video.title}.mp4`}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white text-xs py-2 px-3 rounded-lg transition-colors text-center"
              >
                Download
              </a>
            )}
          </div>

          {video.status === "failed" && video.error && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              Error: {video.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoDetailModal({ video, onClose }: { video: Video; onClose: () => void }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [useRefreshQuery, setUseRefreshQuery] = useState(false);
  
  // Query to get fresh video data if needed
  const freshVideoData = useQuery(api.videos.getVideo, { id: video._id });
  const refreshedVideoData = useQuery(
    api.videos.refreshVideoUrl, 
    useRefreshQuery ? { id: video._id } : "skip"
  );
  
  const currentVideo = refreshedVideoData || freshVideoData || video;

  const handleRefreshVideo = async () => {
    setIsRefreshing(true);
    setUseRefreshQuery(true);
    
    // Reset refresh query after a delay to allow normal queries to take over
    setTimeout(() => {
      setIsRefreshing(false);
      setUseRefreshQuery(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentVideo.title}</h2>
            <div className="flex items-center gap-2">
              {currentVideo.url && (
                <button
                  onClick={handleRefreshVideo}
                  disabled={isRefreshing}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded transition-colors disabled:opacity-50"
                  title="Refresh video URL"
                >
                  <svg 
                    className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {currentVideo.url ? (
            <div className="mb-6">
              <VideoPlayer
                src={currentVideo.url}
                title={currentVideo.title}
                width={640}
                height={currentVideo.metadata?.aspectRatio === "9:16" ? 1138 : 360}
                controls={true}
                className="mx-auto"
                onError={(error) => {
                  console.error("Video modal error:", error);
                  // Automatically try to refresh the URL if there's an error
                  if (!isRefreshing) {
                    handleRefreshVideo();
                  }
                }}
                showRetry={true}
              />
              {isRefreshing && (
                <div className="text-center mt-2 text-sm text-slate-500">
                  Refreshing video URL...
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg h-96">
              <div className="text-center">
                <div className="text-slate-400 text-4xl mb-4">🎬</div>
                <div className="text-slate-600 dark:text-slate-400">
                  {currentVideo.status === "generating" ? "Video is still generating..." : "Video not available"}
                </div>
                {currentVideo.status === "failed" && currentVideo.error && (
                  <div className="text-red-600 dark:text-red-400 text-sm mt-2">
                    Error: {currentVideo.error}
                  </div>
                )}
                {currentVideo.status === "completed" && !currentVideo.url && (
                  <button
                    onClick={handleRefreshVideo}
                    disabled={isRefreshing}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isRefreshing ? "Loading..." : "Try Loading Video"}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Description</h3>
              <p className="text-slate-600 dark:text-slate-300">{currentVideo.prompt}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Status</h4>
                <p className="text-slate-600 dark:text-slate-300">{currentVideo.status}</p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Created</h4>
                <p className="text-slate-600 dark:text-slate-300">
                  {new Date(currentVideo.createdAt).toLocaleString()}
                </p>
              </div>
              {currentVideo.metadata?.duration && (
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Duration</h4>
                  <p className="text-slate-600 dark:text-slate-300">{currentVideo.metadata.duration}s</p>
                </div>
              )}
              {currentVideo.metadata?.aspectRatio && (
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Aspect Ratio</h4>
                  <p className="text-slate-600 dark:text-slate-300">{currentVideo.metadata.aspectRatio}</p>
                </div>
              )}
              {currentVideo.metadata?.fileSize && (
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">File Size</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    {(currentVideo.metadata.fileSize / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              )}
              {currentVideo.metadata?.model && (
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Model</h4>
                  <p className="text-slate-600 dark:text-slate-300">{currentVideo.metadata.model}</p>
                </div>
              )}
            </div>

            {currentVideo.url && (
              <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <a
                  href={currentVideo.url}
                  download={`${currentVideo.title}.mp4`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Download Video
                </a>
                <button
                  onClick={handleRefreshVideo}
                  disabled={isRefreshing}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh URL"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🎬</div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No videos yet</h3>
      <p className="text-slate-600 dark:text-slate-300 mb-6">
        Create your first AI-generated video to get started
      </p>
      <Link
        href="/dashboard/studio"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create Your First Video
      </Link>
    </div>
  );
}

