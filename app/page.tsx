"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background p-4 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Viral Shorts Generator" width={32} height={32} />
          <span className="font-bold text-xl">Viral Shorts Generator</span>
        </div>
        <div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="flex-1">
        <Authenticated>
          <div className="p-4 text-center">
            <p className="text-lg mb-4">You're already logged in!</p>
            <Link 
              href="/dashboard" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </Authenticated>
        
        <Unauthenticated>
          <LandingContent />
        </Unauthenticated>
      </main>
      
      <footer className="bg-slate-100 p-6 text-center text-sm text-slate-600">
        <p>© {new Date().getFullYear()} Viral Shorts Generator. All rights reserved.</p>
      </footer>
    </div>
  );
}

function LandingContent() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-24">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Generate <span className="text-blue-600">Viral YouTube Shorts</span> Without Showing Your Face
          </h1>
          
          <p className="text-xl text-slate-700">
            Create engaging, high-converting YouTube shorts that drive views, subscribers, and revenue - all without ever appearing on camera.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <SignUpButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium text-lg transition-colors w-full sm:w-auto">
                Get Started Free
              </button>
            </SignUpButton>
            
            <SignInButton mode="modal">
              <button className="bg-white hover:bg-slate-100 text-blue-600 border border-blue-600 px-6 py-3 rounded-md font-medium text-lg transition-colors w-full sm:w-auto">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
        
        <div className="md:w-1/2">
          <div className="bg-slate-200 rounded-lg aspect-video flex items-center justify-center">
            <p className="text-slate-600 text-lg">Video Showcase Placeholder</p>
          </div>
        </div>
      </div>
      
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
      
      <div className="mt-24 py-12 bg-blue-50 rounded-xl">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Your YouTube Revenue Journey Today</h2>
          <p className="text-xl text-slate-700 mb-8">
            Join thousands of creators who are building successful YouTube channels without showing their face.
          </p>
          <SignUpButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md font-medium text-lg transition-colors">
              Create Your First Short Now
            </button>
          </SignUpButton>
        </div>
      </div>
      
      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
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
      
      <div className="mt-24 border-t border-slate-200 pt-16">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
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

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-slate-200 pb-6">
      <h4 className="text-xl font-semibold mb-2">{question}</h4>
      <p className="text-slate-600">{answer}</p>
    </div>
  );
}

