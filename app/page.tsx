"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Viral Shorts Generator" width={32} height={32} />
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
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-24">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900 dark:text-white">
            Generate <span className="text-blue-600 dark:text-blue-500">Viral YouTube Shorts</span> Without Showing Your Face
          </h1>
          
          <p className="text-xl text-slate-700 dark:text-slate-300">
            Create engaging, high-converting YouTube shorts that drive views, subscribers, and revenue - all without ever appearing on camera.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium text-lg transition-colors w-full sm:w-auto shadow-sm hover:shadow">
                Start Now
              </button>
            </SignInButton>
          </div>
        </div>
        
        <div className="md:w-1/2">
          <div className="bg-slate-200 dark:bg-slate-800 rounded-lg aspect-video flex items-center justify-center shadow-md">
            <p className="text-slate-600 dark:text-slate-300 text-lg">Video Showcase Placeholder</p>
          </div>
        </div>
      </div>
      
      {/* Shorts Showcase Section */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center mb-8 text-slate-900 dark:text-white">
          Viral Shorts Examples
        </h2>
        <p className="text-xl text-slate-700 dark:text-slate-300 text-center max-w-3xl mx-auto mb-12">
          Browse through our collection of viral shorts templates that have helped creators generate millions of views.
        </p>
        
        <ShortsCarousel />
      </div>
      
      {/* Features Section */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          title="AI-Powered Content" 
          description="Our AI generates trending content ideas and scripts optimized for YouTube's algorithm."
          icon="✨"
        />
        <FeatureCard 
          title="Faceless Creation" 
          description="Create professional shorts without ever showing your face or recording your voice."
          icon="🎭"
        />
        <FeatureCard 
          title="Monetization Ready" 
          description="Optimize your shorts for maximum revenue potential with our proven templates."
          icon="💰"
        />
      </div>
      
      <div className="mt-24 py-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">Start Your YouTube Revenue Journey Today</h2>
          <p className="text-xl text-slate-700 dark:text-slate-300 mb-8">
            Join thousands of creators who are building successful YouTube channels without showing their face.
          </p>
          <SignUpButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md font-medium text-lg transition-colors shadow-sm hover:shadow">
              Create Your First Short Now
            </button>
          </SignUpButton>
        </div>
      </div>
      
      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard 
            number="1" 
            title="Choose Your Topic" 
            description="Select from trending topics or enter your own niche idea."
          />
          <StepCard 
            number="2" 
            title="Generate Content" 
            description="Our AI creates a script and visual elements optimized for engagement."
          />
          <StepCard 
            number="3" 
            title="Publish & Profit" 
            description="Download your short and upload directly to YouTube to start earning."
          />
        </div>
      </div>
      
      <div className="mt-24 border-t border-slate-200 dark:border-slate-700 pt-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <FaqItem 
            question="Do I need to show my face or record my voice?" 
            answer="No! Our platform is specifically designed for faceless content creation. You can generate viral shorts without ever appearing on camera or recording your voice."
          />
          <FaqItem 
            question="How do I monetize these shorts?" 
            answer="YouTube shorts can be monetized through the YouTube Partner Program once you reach 1,000 subscribers and 4,000 watch hours. Our content is designed to help you reach these milestones faster."
          />
          <FaqItem 
            question="Is the content unique?" 
            answer="Yes! Our AI generates unique content for each user. You can also customize the output to match your specific niche and style preferences."
          />
          <FaqItem 
            question="How many shorts can I create?" 
            answer="Our free plan allows you to create 3 shorts per month. Premium plans offer unlimited shorts generation to scale your channel faster."
          />
        </div>
      </div>
    </div>
  );
}

function ShortsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current && !isScrolling) {
        scrollRef.current.scrollLeft += 1;
        
        // Reset to beginning when reaching the end
        if (scrollRef.current.scrollLeft >= 
            scrollRef.current.scrollWidth - scrollRef.current.clientWidth) {
          scrollRef.current.scrollLeft = 0;
        }
      }
    }, 20);
    
    return () => clearInterval(interval);
  }, [isScrolling]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScrolling(true);
    setStartX(e.pageX - scrollRef.current!.offsetLeft);
    setScrollLeft(scrollRef.current!.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsScrolling(false);
  };

  const handleMouseLeave = () => {
    setIsScrolling(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isScrolling) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current!.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current!.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div 
        className="relative overflow-hidden rounded-lg shadow-md"
        style={{ height: '480px' }}
      >
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory h-full"
          style={{ scrollBehavior: 'smooth' }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <div 
              key={num} 
              className="flex-shrink-0 w-[270px] h-[480px] snap-center mx-2 first:ml-0 last:mr-0"
            >
              <Image
                src={`/images/carousel/shorts-${num}.svg`}
                alt={`Viral Short Example ${num}`}
                width={270}
                height={480}
                className="rounded-lg shadow-sm"
              />
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              className="w-2 h-2 rounded-full bg-white bg-opacity-50 hover:bg-opacity-100 transition-opacity"
              onClick={() => {
                if (scrollRef.current) {
                  const itemWidth = 270 + 16; // Width + margin
                  scrollRef.current.scrollLeft = (num - 1) * itemWidth;
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
      <h4 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{question}</h4>
      <p className="text-slate-600 dark:text-slate-300">{answer}</p>
    </div>
  );
}

