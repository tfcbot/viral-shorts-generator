"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast, { Toaster } from "react-hot-toast";

export default function StudioPage() {
  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Studio</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Create viral YouTube shorts with AI</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/videos"
            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 012-2z" />
            </svg>
            My Videos
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-6">
        <AIGenerationWorkspace />
      </div>
    </div>
  );
}

function AIGenerationWorkspace() {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<"5" | "10">("5");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const generateVideo = useAction(api.videoActions.generateVideo);
  const rateLimit = useQuery(api.videos.checkRateLimit) || {
    canCreateVideo: true,
    generatingCount: 0,
    maxGenerating: 5,
    dailyCount: 0,
    maxDaily: 20,
    timeUntilReset: 0,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !prompt.trim()) {
      toast.error("Please fill out both title and prompt fields");
      return;
    }
    
    if (prompt.length > 1000) {
      toast.error("Prompt is too long. Maximum 1000 characters allowed.");
      return;
    }

    if (!rateLimit.canCreateVideo) {
      if (rateLimit.generatingCount >= rateLimit.maxGenerating) {
        toast.error(`You can only have ${rateLimit.maxGenerating} videos generating at once. Please wait for some to complete.`);
      } else {
        toast.error(`Daily limit reached (${rateLimit.maxDaily} videos per day). Try again tomorrow.`);
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await generateVideo({ 
        title: title.trim(), 
        prompt: prompt.trim(),
        aspectRatio: "9:16",
        duration,
      });
      
      if (result.success) {
        toast.success("Video generation started! Check My Videos to see progress.");
        
        // Reset form
        setTitle("");
        setPrompt("");
      } else {
        toast.error(`Failed to generate video: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-8">
      {/* Rate Limit Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-300">Generation Status</h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Currently generating: {rateLimit.generatingCount}/{rateLimit.maxGenerating} | 
              Daily usage: {rateLimit.dailyCount}/{rateLimit.maxDaily}
              {rateLimit.dailyCount >= rateLimit.maxDaily && (
                <span className="ml-2">
                  (Resets in {formatTimeRemaining(rateLimit.timeUntilReset)})
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              rateLimit.canCreateVideo 
                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
            }`}>
              {rateLimit.canCreateVideo ? "✅ Ready" : "🚫 Limit Reached"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Create Your Video</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Choose a style or describe your own video idea. All videos are created in vertical format perfect for YouTube Shorts.
            </p>
          </div>

          {/* Preset Styles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Quick Start Styles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PresetCard
                title="🎓 Educational"
                description="Facts, tutorials, explanations"
                example="Amazing facts about the ocean depths with dramatic underwater visuals"
                onClick={() => setPrompt("Amazing facts about the ocean depths with dramatic underwater visuals, cinematic close-up shots of sea creatures, blue lighting")}
              />
              <PresetCard
                title="🏃 Lifestyle"
                description="Daily routines, wellness, productivity"
                example="Morning routine in a minimalist apartment with natural lighting"
                onClick={() => setPrompt("Morning routine in a minimalist apartment with natural lighting, smooth camera movements following daily activities")}
              />
              <PresetCard
                title="🌍 Travel"
                description="Places, cultures, adventures"
                example="Breathtaking drone footage of mountain landscapes at sunrise"
                onClick={() => setPrompt("Breathtaking drone footage of mountain landscapes at sunrise, aerial cinematography with golden hour lighting")}
              />
              <PresetCard
                title="💡 Tech/Business"
                description="Innovation, startups, tips"
                example="Futuristic technology concepts with sleek visual effects"
                onClick={() => setPrompt("Futuristic technology concepts with sleek visual effects, modern minimalist design, blue and white color scheme")}
              />
              <PresetCard
                title="🎨 Creative"
                description="Art, design, inspiration"
                example="Time-lapse of an artist creating a colorful painting"
                onClick={() => setPrompt("Time-lapse of an artist creating a colorful painting, close-up shots of brush strokes, vibrant colors")}
              />
              <PresetCard
                title="🍔 Food"
                description="Cooking, recipes, restaurants"
                example="Slow motion food preparation with steam and sizzling sounds"
                onClick={() => setPrompt("Slow motion food preparation with steam and sizzling sounds, close-up macro shots, warm kitchen lighting")}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Video Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 'Amazing Space Facts' or 'Productivity Life Hacks'"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                required
              />
            </div>

            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Describe Your Video
                <span className="text-xs text-slate-500 ml-2">({prompt.length}/1000 characters)</span>
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to see in your video... Be specific about actions, camera movements, and visual details. For example: 'A person walking through a futuristic city with neon lights and flying cars, cinematic camera movement following them.'"
                rows={5}
                maxLength={1000}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none"
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The more specific and detailed your description, the better your video will be.
              </p>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 max-w-xs">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Video Length
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value as "5" | "10")}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !prompt.trim() || prompt.length > 1000 || !rateLimit.canCreateVideo}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : !rateLimit.canCreateVideo ? (
                <>
                  <span>🚫</span>
                  {rateLimit.generatingCount >= rateLimit.maxGenerating ? "Too Many Generating" : "Daily Limit Reached"}
                </>
              ) : (
                <>
                  <span>🎬</span>
                  Create Video
                </>
              )}
            </button>
            
            {!rateLimit.canCreateVideo && (
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                {rateLimit.generatingCount >= rateLimit.maxGenerating 
                  ? "Please wait for some videos to complete before creating more."
                  : `Daily limit reached. Resets in ${formatTimeRemaining(rateLimit.timeUntilReset)}.`
                }
              </p>
            )}
          </form>
        </div>

        {/* Tips */}
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <span>💡</span>
              Tips for Great Videos
            </h3>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Add camera movements like "drone shot", "close-up", or "tracking"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Describe actions and emotions in detail</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Set the mood with lighting: "golden hour", "neon lights", "dramatic shadows"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Include multiple actions for dynamic content</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-500">
            <h3 className="font-semibold mb-2 text-purple-900 dark:text-purple-300 flex items-center gap-2">
              <span>🎨</span>
              Example Prompts
            </h3>
            <div className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
              <p className="italic">"A cat wearing sunglasses walking in slow motion through a field of flowers, cinematic close-up shot"</p>
              <p className="italic">"Time-lapse of a city at night with traffic lights creating light trails, aerial view"</p>
              <p className="italic">"A coffee cup steaming on a wooden table, cozy morning light streaming through window"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PresetCard({ 
  title, 
  description, 
  example, 
  onClick 
}: { 
  title: string; 
  description: string; 
  example: string; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{title.split(' ')[0]}</span>
        <span className="font-medium text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">
          {title.split(' ').slice(1).join(' ')}
        </span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{description}</p>
      <p className="text-xs text-slate-500 dark:text-slate-500 italic">"{example}"</p>
    </button>
  );
}

