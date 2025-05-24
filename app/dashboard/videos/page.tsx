"use client";

import { useState } from "react";
import Link from "next/link";

type VideoStatus = "published" | "draft" | "processing" | "failed";
type SortOption = "newest" | "oldest" | "views" | "name";

export default function VideosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VideoStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Mock data - in a real app, this would come from your database
  const videos = [
    {
      id: 1,
      title: "Top 10 Space Facts That Will Blow Your Mind",
      thumbnail: "🚀",
      status: "published" as VideoStatus,
      views: 45623,
      duration: "30s",
      createdAt: "2024-01-15",
      platform: "YouTube",
    },
    {
      id: 2,
      title: "Life Hacks That Actually Work",
      thumbnail: "💡", 
      status: "processing" as VideoStatus,
      views: 0,
      duration: "45s",
      createdAt: "2024-01-14", 
      platform: "YouTube",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Videos</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Manage and track all your viral shorts</p>
        </div>
        <Link
          href="/dashboard/studio"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Videos" value="2" icon="🎥" />
        <StatCard title="Total Views" value="45.6K" icon="👁️" />
        <StatCard title="Published" value="1" icon="✅" />
        <StatCard title="Processing" value="1" icon="⏳" />
      </div>

      {/* Filters and Search */}
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="views">Most Views</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
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
  video 
}: { 
  video: {
    id: number;
    title: string;
    thumbnail: string;
    status: VideoStatus;
    views: number;
    duration: string;
    createdAt: string;
    platform: string;
  } 
}) {
  const getStatusColor = (status: VideoStatus) => {
    switch (status) {
      case "published": return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300";
      case "draft": return "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300";
      case "processing": return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300";
      case "failed": return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300";
      default: return "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: VideoStatus) => {
    switch (status) {
      case "published": return "✅";
      case "draft": return "📝";
      case "processing": return "⏳";
      case "failed": return "❌";
      default: return "📝";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="aspect-video bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative">
        <div className="text-6xl">{video.thumbnail}</div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 text-sm">{video.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs">{getStatusIcon(video.status)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(video.status)}`}>
            {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{video.views.toLocaleString()} views</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow">
              View Details
            </button>
            <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
      <div className="text-6xl mb-4">🎬</div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No videos yet</h3>
      <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
        Start creating viral YouTube shorts to see them here. Your content will be organized and tracked automatically.
      </p>
      <Link
        href="/dashboard/studio"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create Your First Video
      </Link>
    </div>
  );
}

