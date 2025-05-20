"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function VideosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"createdAt" | "title">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedVideo, setSelectedVideo] = useState<Id<"shorts"> | null>(null);
  
  const allShorts = useQuery(api.shorts.listShorts, { limit: 100 }) || [];
  
  // Apply filters and sorting
  const filteredShorts = allShorts
    .filter((short) => {
      // Apply search filter
      if (searchTerm && !short.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !short.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter && short.status !== statusFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === "title") {
        return sortOrder === "asc" 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else {
        return sortOrder === "asc"
          ? a.createdAt - b.createdAt
          : b.createdAt - a.createdAt;
      }
    });
  
  const selectedVideoData = selectedVideo 
    ? allShorts.find(short => short._id === selectedVideo) 
    : null;
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Videos</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="generating">Generating</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-");
                  setSortBy(newSortBy as "createdAt" | "title");
                  setSortOrder(newSortOrder as "asc" | "desc");
                }}
                className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {filteredShorts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">
                {allShorts.length === 0
                  ? "You haven't generated any shorts yet."
                  : "No videos match your filters."}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Video
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Title & Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredShorts.map((short) => (
                  <tr key={short._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24 h-16 bg-slate-200 rounded overflow-hidden">
                        {short.thumbnailUrl ? (
                          <img
                            src={short.thumbnailUrl}
                            alt={short.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            No Thumbnail
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{short.title}</div>
                      <div className="text-sm text-slate-500 truncate max-w-xs">{short.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        short.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : short.status === "generating"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {short.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(short.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedVideo(short._id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Video Detail Modal */}
      {selectedVideo && selectedVideoData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedVideoData.title}</h2>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                {selectedVideoData.videoUrl ? (
                  <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden">
                    {/* In a real implementation, this would be a video player */}
                    <div className="w-full h-full flex items-center justify-center">
                      <a
                        href={selectedVideoData.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                      >
                        Open Video
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center">
                    <p className="text-slate-600">
                      {selectedVideoData.status === "generating"
                        ? "Video is still generating..."
                        : "Video not available"}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-slate-700">{selectedVideoData.description}</p>
                  
                  <h3 className="text-lg font-semibold mt-4 mb-2">Prompt</h3>
                  <p className="text-slate-700">{selectedVideoData.prompt}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className={`font-medium ${
                        selectedVideoData.status === "completed"
                          ? "text-green-600"
                          : selectedVideoData.status === "generating"
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}>
                        {selectedVideoData.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Created:</span>
                      <span>{new Date(selectedVideoData.createdAt).toLocaleString()}</span>
                    </div>
                    {selectedVideoData.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Completed:</span>
                        <span>{new Date(selectedVideoData.completedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedVideoData.metadata?.duration && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Duration:</span>
                        <span>{selectedVideoData.metadata.duration} seconds</span>
                      </div>
                    )}
                    {selectedVideoData.metadata?.resolution && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Resolution:</span>
                        <span>{selectedVideoData.metadata.resolution}</span>
                      </div>
                    )}
                    {selectedVideoData.metadata?.fileSize && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">File Size:</span>
                        <span>{(selectedVideoData.metadata.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    )}
                  </div>
                  
                  {selectedVideoData.metadata?.tags && selectedVideoData.metadata.tags.length > 0 && (
                    <>
                      <h3 className="text-lg font-semibold mt-4 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedVideoData.metadata.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 flex justify-end rounded-b-lg">
              <button
                onClick={() => setSelectedVideo(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

