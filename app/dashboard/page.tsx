"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function DashboardPage() {
  const allShorts = useQuery(api.shorts.listShorts, { limit: 100 }) || [];
  
  // Count shorts by status
  const statusCounts = allShorts.reduce(
    (acc, short) => {
      acc[short.status] = (acc[short.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  
  const totalShorts = allShorts.length;
  const completedShorts = statusCounts["completed"] || 0;
  const generatingShorts = statusCounts["generating"] || 0;
  const failedShorts = statusCounts["failed"] || 0;
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-medium text-slate-500 uppercase">Total Videos</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalShorts}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-medium text-slate-500 uppercase">Completed</h2>
          <p className="mt-2 text-3xl font-bold text-green-600">{completedShorts}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-medium text-slate-500 uppercase">Generating</h2>
          <p className="mt-2 text-3xl font-bold text-blue-600">{generatingShorts}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-medium text-slate-500 uppercase">Failed</h2>
          <p className="mt-2 text-3xl font-bold text-red-600">{failedShorts}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Videos</h2>
          
          {allShorts.length === 0 ? (
            <p className="text-slate-600">You haven&apos;t generated any shorts yet.</p>
          ) : (
            <div className="space-y-4">
              {allShorts.slice(0, 5).map((short) => (
                <div key={short._id} className="flex items-center gap-4">
                  <div className="w-16 h-12 bg-slate-200 rounded overflow-hidden">
                    {short.thumbnailUrl ? (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${short.thumbnailUrl})` }}
                        aria-label={short.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No Thumbnail
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{short.title}</p>
                    <p className="text-xs text-slate-500 truncate">{short.description}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    short.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : short.status === "generating"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {short.status}
                  </span>
                </div>
              ))}
              
              <div className="pt-4 border-t border-slate-200">
                <Link
                  href="/dashboard/videos"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View all videos →
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          
          <div className="space-y-4">
            <Link
              href="/dashboard/studio"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-center"
            >
              Create New Short
            </Link>
            
            <Link
              href="/dashboard/videos"
              className="block w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-medium rounded-md text-center border border-slate-300"
            >
              Manage Videos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
