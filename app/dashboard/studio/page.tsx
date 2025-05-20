"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function StudioPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createShort = useMutation(api.shorts.createShort);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !prompt) {
      alert("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createShort({
        title,
        description,
        prompt,
      });
      
      // Redirect to videos page after successful creation
      router.push("/dashboard/videos");
    } catch (error) {
      console.error("Error creating short:", error);
      alert("Failed to create short. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Short</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a title for your short"
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
              placeholder="Enter a description for your short"
              required
            />
          </div>
          
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-1">
              Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a detailed prompt for generating your short"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Creating..." : "Create Short"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

