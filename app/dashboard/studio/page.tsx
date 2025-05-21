"use client";

import { useState } from "react";
import Link from "next/link";

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Studio</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="flex border-b border-slate-200">
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "create"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("create")}
          >
            Create New Short
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "history"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("history")}
          >
            Generation History
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === "create" ? <ShortGenerationForm setActiveTab={setActiveTab} /> : <ShortsHistoryTable />}
        </div>
      </div>
    </div>
  );
}

function ShortGenerationForm({ setActiveTab }: { setActiveTab: (tab: "create" | "history") => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !prompt) {
      alert("Please fill out all fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call the Convex mutation
      // await createShort({ title, description, prompt });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setTitle("");
      setDescription("");
      setPrompt("");
      
      // Switch to history tab to see the new short
      setActiveTab("history");
    } catch (error) {
      console.error("Error creating short:", error);
      alert("Failed to create short. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
          Short Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter a catchy title for your short"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe what your short should be about"
          required
        />
      </div>
      
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-1">
          Generation Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Provide detailed instructions for generating your short"
          required
        />
      </div>
      
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-4 py-2 text-white font-medium rounded-md ${
            isSubmitting
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Generating..." : "Generate Short"}
        </button>
      </div>
    </form>
  );
}

function ShortsHistoryTable() {
  // Mock data for the table
  const mockShorts = [
    {
      _id: "1",
      title: "Summer Fashion Trends 2023",
      description: "Exploring the hottest fashion trends for summer 2023",
      status: "completed",
      createdAt: Date.now() - 1000000,
      videoUrl: "https://example.com/videos/1",
    },
    {
      _id: "2",
      title: "5 Minute Workout Routine",
      description: "Quick and effective workout routine for busy people",
      status: "generating",
      createdAt: Date.now() - 500000,
      videoUrl: null,
    },
    {
      _id: "3",
      title: "Easy Vegan Recipes",
      description: "Simple and delicious vegan recipes for beginners",
      status: "failed",
      createdAt: Date.now() - 200000,
      videoUrl: null,
    },
  ];
  
  if (mockShorts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">
          You haven&apos;t generated any shorts yet. Create your first short to see it here!
        </p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Title
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Video
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {mockShorts.map((short) => (
            <tr key={short._id} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/dashboard/studio/${short._id}`} className="block">
                  <div className="text-sm font-medium text-slate-900 hover:text-blue-600">{short.title}</div>
                  <div className="text-sm text-slate-500 truncate max-w-xs">{short.description}</div>
                </Link>
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
                {short.videoUrl ? (
                  <a
                    href={short.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Video
                  </a>
                ) : (
                  <span className="text-slate-500">Not available</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
