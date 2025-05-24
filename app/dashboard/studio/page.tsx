"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast, { Toaster } from "react-hot-toast";

type CreateMode = "ai" | "template" | "upload";

export default function StudioPage() {
  const [activeMode, setActiveMode] = useState<CreateMode>("ai");

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Studio</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Create viral YouTube shorts without showing your face</p>
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

      {/* Creation Mode Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveMode("ai")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeMode === "ai"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            🤖 AI Generation
          </button>
          
          <button
            onClick={() => setActiveMode("template")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeMode === "template"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            📋 Templates
          </button>
          
          <button
            onClick={() => setActiveMode("upload")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeMode === "upload"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            📤 Upload
          </button>
        </nav>
      </div>

      {/* Content based on active mode */}
      <div className="mt-6">
        {activeMode === "ai" && <AIGenerationWorkspace />}
        {activeMode === "template" && <TemplateWorkspace />}
        {activeMode === "upload" && <UploadWorkspace />}
      </div>
    </div>
  );
}

function AIGenerationWorkspace() {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [duration, setDuration] = useState<"5" | "10">("5");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [cfgScale, setCfgScale] = useState(0.5);
  const [showAdvanced, setShowAdvanced] = useState(false);
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
        aspectRatio,
        duration,
        negativePrompt: negativePrompt.trim() || undefined,
        cfgScale: cfgScale !== 0.5 ? cfgScale : undefined,
      });
      
      if (result.success) {
        toast.success("Video generation started! Check My Videos to see progress.");
        
        // Reset form
        setTitle("");
        setPrompt("");
        setNegativePrompt("");
        setCfgScale(0.5);
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
            <h3 className="font-medium text-blue-900 dark:text-blue-300">Generation Limits</h3>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Generate Your Viral Short</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Powered by Kling V2 Master - the most advanced text-to-video AI model with enhanced motion quality, 
              lifelike characters, and blockbuster-quality scene generation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Video Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., &apos;Amazing Space Facts&apos; or &apos;Productivity Life Hacks&apos;"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                required
              />
            </div>

            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Video Prompt/Description
                <span className="text-xs text-slate-500 ml-2">({prompt.length}/1000 characters)</span>
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to see in your video... e.g., 'A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. The camera follows her gracefully as she moves through the bustling crowd, her coat flowing in the evening breeze.'"
                rows={4}
                maxLength={1000}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none"
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Be specific and descriptive. Include camera movements, character actions, and scene details for best results.
              </p>
            </div>

            {/* Basic Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Aspect Ratio
                </label>
                <select
                  id="aspectRatio"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as "16:9" | "9:16" | "1:1")}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="16:9">Landscape (16:9)</option>
                  <option value="9:16">Portrait (9:16)</option>
                  <option value="1:1">Square (1:1)</option>
                </select>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Duration
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

            {/* Advanced Settings Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                <svg 
                  className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Advanced Settings
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="negativePrompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Negative Prompt (Optional)
                    </label>
                    <input
                      type="text"
                      id="negativePrompt"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="Things to avoid (e.g., &apos;blur, distort, low quality, text, watermark&apos;)"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Specify what you don&apos;t want in the video to improve quality
                    </p>
                  </div>

                  <div>
                    <label htmlFor="cfgScale" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      CFG Scale: {cfgScale}
                    </label>
                    <input
                      type="range"
                      id="cfgScale"
                      min="0"
                      max="2"
                      step="0.1"
                      value={cfgScale}
                      onChange={(e) => setCfgScale(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>More Creative (0.0)</span>
                      <span>Balanced (0.5)</span>
                      <span>More Accurate (2.0)</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Controls how closely the model follows your prompt vs. being creative
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !prompt.trim() || prompt.length > 1000 || !rateLimit.canCreateVideo}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : !rateLimit.canCreateVideo ? (
                <>
                  <span>🚫</span>
                  {rateLimit.generatingCount >= rateLimit.maxGenerating ? "Too Many Generating" : "Daily Limit Reached"}
                </>
              ) : (
                <>
                  <span>🎬</span>
                  Generate Video with Kling V2 Master
                </>
              )}
            </button>
            
            {!rateLimit.canCreateVideo && (
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                {rateLimit.generatingCount >= rateLimit.maxGenerating 
                  ? "Please wait for some videos to complete before generating more."
                  : `Daily limit reached. Resets in ${formatTimeRemaining(rateLimit.timeUntilReset)}.`
                }
              </p>
            )}
          </form>
        </div>

        {/* Preview/Tips */}
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">💡 Pro Tips for Viral Shorts</h3>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Include specific camera movements: &quot;drone shot&quot;, &quot;close-up&quot;, &quot;tracking shot&quot;</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Describe character actions and emotions in detail</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Set the scene with lighting and atmosphere: &quot;golden hour&quot;, &quot;neon lights&quot;</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Use sequential actions for dynamic content</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-500">
            <h3 className="font-semibold mb-2 text-amber-800 dark:text-amber-300">⚡ Kling V2 Master Features</h3>
            <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-400">
              <li>• Enhanced motion quality and physics</li>
              <li>• Lifelike character expressions</li>
              <li>• Blockbuster cinematography</li>
              <li>• Complex sequential actions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateWorkspace() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📋</div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Templates Coming Soon</h3>
      <p className="text-slate-600 dark:text-slate-300 mb-6">
        Pre-made viral templates will be available here
      </p>
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 max-w-md mx-auto">
        <h4 className="font-medium text-slate-900 dark:text-white mb-2">What&apos;s Coming:</h4>
        <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 text-left">
          <li>• Educational fact templates</li>
          <li>• Motivational quote formats</li>
          <li>• Product showcase layouts</li>
          <li>• Storytelling structures</li>
        </ul>
      </div>
    </div>
  );
}

function UploadWorkspace() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📤</div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Upload & Transform Coming Soon</h3>
      <p className="text-slate-600 dark:text-slate-300 mb-6">
        Upload your content and transform it into viral shorts
      </p>
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 max-w-md mx-auto">
        <h4 className="font-medium text-slate-900 dark:text-white mb-2">What&apos;s Coming:</h4>
        <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 text-left">
          <li>• Video to shorts conversion</li>
          <li>• Audio podcast highlights</li>
          <li>• Blog post to video</li>
          <li>• Social media repurposing</li>
        </ul>
      </div>
    </div>
  );
}

