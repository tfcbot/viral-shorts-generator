"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ShortDetailPage() {
  const params = useParams();
  const shortId = params.id as string;
  
  // Convert string ID to Convex ID
  const id = shortId ? Id.fromString(shortId) : null;
  
  const short = useQuery(api.shorts.getShort, id ? { id } : "skip");
  
  if (!id) {
    return <div>Invalid short ID</div>;
  }
  
  if (short === undefined) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-slate-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }
  
  if (short === null) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Short Not Found</h1>
        <p className="mb-4">The short you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link href="/dashboard/studio" className="text-blue-600 hover:underline">
          ← Back to Studio
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/studio" className="text-blue-600 hover:underline">
          ← Back to Studio
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-2">{short.title}</h1>
      
      <div className="mb-6">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          short.status === "completed"
            ? "bg-green-100 text-green-800"
            : short.status === "generating"
            ? "bg-blue-100 text-blue-800"
            : "bg-red-100 text-red-800"
        }`}>
          {short.status}
        </span>
        <span className="text-sm text-slate-500 ml-2">
          Created: {new Date(short.createdAt).toLocaleString()}
        </span>
        {short.completedAt && (
          <span className="text-sm text-slate-500 ml-2">
            Completed: {new Date(short.completedAt).toLocaleString()}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-slate-700 whitespace-pre-wrap">{short.description}</p>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">Prompt</h2>
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <p className="text-slate-700 whitespace-pre-wrap">{short.prompt}</p>
          </div>
        </div>
        
        <div>
          {short.videoUrl && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Video</h2>
              <div className="aspect-video bg-black rounded-md overflow-hidden">
                {/* In a real app, you'd embed the video player here */}
                <div className="w-full h-full flex items-center justify-center">
                  <a
                    href={short.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
                  >
                    View Video
                  </a>
                </div>
              </div>
            </div>
          )}
          
          {short.thumbnailUrl && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Thumbnail</h2>
              <div className="rounded-md overflow-hidden border border-slate-200">
                <img
                  src={short.thumbnailUrl}
                  alt={`Thumbnail for ${short.title}`}
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
          
          {short.metadata && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Metadata</h2>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {short.metadata.duration !== undefined && (
                    <>
                      <dt className="text-sm font-medium text-slate-500">Duration</dt>
                      <dd className="text-sm text-slate-700">{short.metadata.duration}s</dd>
                    </>
                  )}
                  {short.metadata.resolution && (
                    <>
                      <dt className="text-sm font-medium text-slate-500">Resolution</dt>
                      <dd className="text-sm text-slate-700">{short.metadata.resolution}</dd>
                    </>
                  )}
                  {short.metadata.fileSize !== undefined && (
                    <>
                      <dt className="text-sm font-medium text-slate-500">File Size</dt>
                      <dd className="text-sm text-slate-700">{(short.metadata.fileSize / 1024 / 1024).toFixed(2)} MB</dd>
                    </>
                  )}
                  {short.metadata.tags && short.metadata.tags.length > 0 && (
                    <>
                      <dt className="text-sm font-medium text-slate-500">Tags</dt>
                      <dd className="text-sm text-slate-700 col-span-2">
                        <div className="flex flex-wrap gap-1 mt-1">
                          {short.metadata.tags.map((tag, index) => (
                            <span key={index} className="bg-slate-200 px-2 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

