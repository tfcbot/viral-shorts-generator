"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl text-slate-900 dark:text-white">Viral Shorts Generator</span>
        </div>
        <div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="flex-1">
        <Authenticated>
          <RedirectToDashboard />
        </Authenticated>
        
        <Unauthenticated>
          <LandingContent />
        </Unauthenticated>
      </main>
      
      <footer className="bg-slate-100 dark:bg-slate-800 p-6 text-center text-sm text-slate-600 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} Viral Shorts Generator. All rights reserved.</p>
      </footer>
    </div>
  );
}

function RedirectToDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard/studio");
  }, [router]);

  return (
    <div className="p-4 text-center">
      <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
        <span className="sr-only">Redirecting...</span>
      </div>
      <p className="text-lg mt-4 text-slate-800 dark:text-slate-200">Redirecting to studio...</p>
    </div>
  );
}

function LandingContent() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight text-slate-900 dark:text-white">
          Generate <span className="text-blue-600 dark:text-blue-500">Viral YouTube Shorts</span> Without Showing Your Face
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto">
          Create engaging, high-converting YouTube shorts that drive views, subscribers, and revenue - all without ever appearing on camera.
        </p>
        
        <div className="pt-8">
          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md font-medium text-xl transition-colors shadow-lg hover:shadow-xl">
              Get Started
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}

