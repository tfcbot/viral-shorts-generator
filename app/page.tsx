"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-center items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl text-slate-900 dark:text-white">Viral Shorts Generator</span>
        </div>
        <div className="absolute right-4">
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
    <div className="flex-1">
      {/* Main Hero Section - Centered */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-slate-900 dark:text-white">
            Create <span className="text-blue-600 dark:text-blue-500">Viral YouTube Shorts</span> Without Showing Your Face
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto">
            Generate engaging, faceless content that gets <strong>millions of views</strong> - no camera, no voice recording, no editing skills required
          </p>

                     {/* Value Props */}
           <div className="flex flex-wrap justify-center gap-6 text-slate-600 dark:text-slate-400 text-sm md:text-base">
             <div className="flex items-center gap-2">
               <span className="text-green-500">✓</span>
               100% faceless
             </div>
             <div className="flex items-center gap-2">
               <span className="text-green-500">✓</span>
               No voice recording
             </div>
             <div className="flex items-center gap-2">
               <span className="text-green-500">✓</span>
               AI-generated content
             </div>
           </div>
          
          <div className="pt-8">
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md font-medium text-xl transition-colors shadow-lg hover:shadow-xl">
                Get Started
              </button>
            </SignInButton>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-slate-50 dark:bg-slate-800/50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            Why Creators Choose Our AI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="text-center">
               <div className="text-4xl mb-4">🎭</div>
               <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Stay Anonymous</h3>
               <p className="text-slate-600 dark:text-slate-300">Create professional content without showing your face or recording your voice. Perfect for private creators.</p>
             </div>
                         <div className="text-center">
               <div className="text-4xl mb-4">📈</div>
               <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Viral Potential</h3>
               <p className="text-slate-600 dark:text-slate-300">Optimized for engagement with proven viral formulas that drive clicks and views.</p>
             </div>
                         <div className="text-center">
               <div className="text-4xl mb-4">🎯</div>
               <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Zero Skills Needed</h3>
               <p className="text-slate-600 dark:text-slate-300">No video editing, no camera work, no voice recording. AI creates everything for you.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Create Your First Viral Short?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of creators building their audience with AI-generated content
          </p>
          <div className="space-y-4">
            <SignInButton mode="modal">
              <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-md font-medium text-xl transition-colors shadow-lg hover:shadow-xl">
                Get Started
              </button>
            </SignInButton>
            <p className="text-sm text-blue-200">
              ⏰ Limited time offer expires soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

