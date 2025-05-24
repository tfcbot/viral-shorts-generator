"use client";

import { useState } from "react";
import Link from "next/link";

type CreateMode = "ai" | "template" | "upload";

export default function StudioPage() {
  const [activeMode, setActiveMode] = useState<CreateMode>("ai");

  return (
    <div className="space-y-6">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            My Videos
          </Link>
        </div>
      </div>

      {/* Creation Mode Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <ModeTab
            mode="ai"
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            icon="✨"
            title="AI Generation"
            description="Generate with AI"
          />
          <ModeTab
            mode="template"
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            icon="📋"
            title="Templates"
            description="Use proven templates"
          />
          <ModeTab
            mode="upload"
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            icon="📤"
            title="Upload & Transform"
            description="Transform existing content"
          />
        </div>

        {/* Content based on active mode */}
        <div className="p-6">
          {activeMode === "ai" && <AIGenerationWorkspace />}
          {activeMode === "template" && <TemplateWorkspace />}
          {activeMode === "upload" && <UploadWorkspace />}
        </div>
      </div>
    </div>
  );
}

function ModeTab({
  mode,
  activeMode,
  setActiveMode,
  icon,
  title,
  description,
}: {
  mode: CreateMode;
  activeMode: CreateMode;
  setActiveMode: (mode: CreateMode) => void;
  icon: string;
  title: string;
  description: string;
}) {
  const isActive = activeMode === mode;
  
  return (
    <button
      onClick={() => setActiveMode(mode)}
      className={`flex-1 p-4 text-left transition-colors ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600 dark:border-blue-500"
          : "hover:bg-slate-50 dark:hover:bg-slate-700"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className={`font-semibold ${isActive ? "text-blue-900 dark:text-blue-400" : "text-slate-900 dark:text-white"}`}>
            {title}
          </h3>
          <p className={`text-sm ${isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-600 dark:text-slate-400"}`}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function AIGenerationWorkspace() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("educational");
  const [duration, setDuration] = useState("30");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Generate Your Viral Short</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Our AI will create engaging content, script, and visuals optimized for maximum engagement.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Topic or Idea
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'Mind-blowing space facts' or 'Life hacks for productivity'"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>

            <div>
              <label htmlFor="style" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Video Style
              </label>
              <select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="educational">Educational</option>
                <option value="entertainment">Entertainment</option>
                <option value="motivational">Motivational</option>
                <option value="trending">Trending/Viral</option>
                <option value="howto">How-To Guide</option>
                <option value="facts">Amazing Facts</option>
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Duration (seconds)
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">60 seconds</option>
              </select>
            </div>

            <button
              disabled={!topic.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
            >
              Generate Video
            </button>
          </div>
        </div>

        {/* Preview/Tips */}
        <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg border border-slate-200 dark:border-slate-600">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">AI Generation Features</h3>
          <div className="space-y-4">
            <FeatureItem
              icon="🎯"
              title="Smart Content Creation"
              description="AI analyzes trending topics and creates engaging scripts"
            />
            <FeatureItem
              icon="🎨"
              title="Visual Generation"
              description="Automatic creation of eye-catching visuals and animations"
            />
            <FeatureItem
              icon="🔊"
              title="Voice Synthesis"
              description="Professional AI-generated voiceover in multiple voices"
            />
            <FeatureItem
              icon="📈"
              title="Optimization"
              description="Content optimized for YouTube algorithm and engagement"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateWorkspace() {
  const templates = [
    {
      id: 1,
      title: "Top 10 Facts",
      description: "Countdown format with amazing facts",
      category: "Educational",
      thumbnail: "🔢",
      uses: 1234,
    },
    {
      id: 2,
      title: "Before vs After",
      description: "Transformation stories that captivate",
      category: "Transformation",
      thumbnail: "⚡",
      uses: 987,
    },
    {
      id: 3,
      title: "Life Hacks",
      description: "Quick tips that viewers can't resist sharing",
      category: "Lifestyle",
      thumbnail: "💡",
      uses: 2156,
    },
    {
      id: 4,
      title: "Did You Know?",
      description: "Surprising facts that hook viewers instantly",
      category: "Facts",
      thumbnail: "🤔",
      uses: 1567,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Choose a Template</h2>
        <p className="text-slate-600 dark:text-slate-300">
          Start with proven viral templates that have generated millions of views
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}

function UploadWorkspace() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Upload & Transform</h2>
        <p className="text-slate-600 dark:text-slate-300">
          Transform your existing content into viral YouTube shorts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-white dark:bg-slate-700">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Drop your files here</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Upload videos, audio, images, or documents
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow">
              Browse Files
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Supports MP4, MOV, JPG, PNG, PDF, TXT up to 100MB
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-amber-600 dark:text-amber-400 text-xl">💡</span>
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-300">Upload Tips</h4>
                <ul className="text-sm text-amber-700 dark:text-amber-200 mt-1 space-y-1">
                  <li>• Long videos will be automatically trimmed to shorts</li>
                  <li>• AI will extract the most engaging segments</li>
                  <li>• Text content will be converted to visual presentations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Transformation Options</h3>
          <div className="space-y-3">
            <TransformOption
              icon="✂️"
              title="Auto-Clip"
              description="Extract the most engaging moments automatically"
            />
            <TransformOption
              icon="🎭"
              title="Add Faces"
              description="Add AI-generated avatars to represent speakers"
            />
            <TransformOption
              icon="📊"
              title="Data Visualization"
              description="Convert statistics into animated charts"
            />
            <TransformOption
              icon="🎵"
              title="Add Music"
              description="Enhance with trending background music"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <h4 className="font-semibold text-slate-900 dark:text-white">{title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
}: {
  template: {
    id: number;
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    uses: number;
  };
}) {
  return (
    <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{template.thumbnail}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">{template.title}</h3>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
              {template.category}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{template.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {template.uses.toLocaleString()} uses
            </span>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow">
              Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransformOption({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-800">
      <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" />
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <h4 className="font-medium text-slate-900 dark:text-white">{title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </div>
  );
}

