"use client";

import { PricingTable } from '@clerk/nextjs';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <span className="font-bold text-xl text-slate-900 dark:text-white">Viral Shorts Generator</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/studio"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Studio
              </Link>
              <Link
                href="/dashboard/videos"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                My Videos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Unlock the power of AI-generated viral YouTube shorts. Start creating engaging content that captures your audience.
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-3xl mb-3">🎬</div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">AI Video Generation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Create stunning shorts with advanced AI technology
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Fast Processing</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Generate videos in minutes, not hours
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Viral Optimization</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Content optimized for YouTube&apos;s algorithm
            </p>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-50/80 to-blue-50/50 dark:from-slate-800/60 dark:to-slate-700/40 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-600/40 shadow-lg overflow-hidden">
            <PricingTable 
              appearance={{
                variables: {
                  colorPrimary: '#3b82f6', // blue-500 for better contrast
                  colorBackground: '#ffffff', // Pure white for light mode
                  colorText: '#1e293b', // slate-800 for better readability
                  colorTextSecondary: '#64748b', // slate-500
                  colorNeutral: '#f1f5f9', // slate-100 - lighter neutral
                  colorDanger: '#ef4444', // red-500
                  colorSuccess: '#22c55e', // green-500
                  colorWarning: '#f59e0b', // amber-500
                  borderRadius: '1rem',
                  fontFamily: 'inherit',
                  fontSize: '15px',
                  spacingUnit: '1rem',
                },
                elements: {
                  // Main container - use lighter backgrounds
                  rootBox: 'bg-white/90 dark:bg-slate-800/50',
                  main: 'bg-transparent p-6',
                  card: 'bg-transparent border-0 shadow-none max-w-none',
                  
                  // Headers - softer colors
                  headerTitle: 'text-slate-800 dark:text-slate-100 text-2xl font-bold mb-3',
                  headerSubtitle: 'text-slate-600 dark:text-slate-300 text-base',
                  
                  // Plan cards - lighter, more harmonious
                  planCard: 'bg-white/70 dark:bg-slate-700/30 border border-slate-200/70 dark:border-slate-500/30 rounded-xl p-8 hover:bg-white/90 dark:hover:bg-slate-600/40 hover:shadow-xl hover:border-blue-300/50 dark:hover:border-blue-400/30 transition-all duration-300 backdrop-blur-sm',
                  planTitle: 'text-slate-800 dark:text-slate-100 text-xl font-semibold mb-2',
                  planDescription: 'text-slate-600 dark:text-slate-300 text-sm mb-4',
                  
                  // Pricing - better hierarchy
                  priceText: 'text-slate-900 dark:text-slate-50 text-3xl font-bold',
                  priceBillingPeriod: 'text-slate-500 dark:text-slate-400 text-sm font-medium',
                  
                  // Features - improved contrast
                  featureList: 'space-y-3 mb-8',
                  featureListItem: 'text-slate-700 dark:text-slate-200 text-sm flex items-center font-medium',
                  featureListMark: 'text-emerald-500 dark:text-emerald-400 w-5 h-5 mr-3 flex-shrink-0',
                  
                  // Buttons - enhanced with gradients
                  formButtonPrimary: 'w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5',
                  formButtonSecondary: 'w-full bg-slate-100 dark:bg-slate-600/50 hover:bg-slate-200 dark:hover:bg-slate-500/60 text-slate-700 dark:text-slate-200 font-semibold py-4 px-6 rounded-xl border border-slate-300/50 dark:border-slate-500/30 transition-all duration-300',
                  
                  // Popular badge - more vibrant
                  badge: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md',
                  
                  // Form elements - softer appearance
                  formFieldInput: 'bg-white/80 dark:bg-slate-700/50 border border-slate-300/60 dark:border-slate-500/40 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200',
                  formFieldLabel: 'text-slate-700 dark:text-slate-200 font-semibold text-sm mb-2',
                  
                  // Additional elements for better spacing
                  cardBox: 'p-0',
                  footer: 'pt-4 border-t border-slate-200/50 dark:border-slate-600/30',
                },
              }}
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-8">
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Ready to go viral?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
              Join thousands of creators who are already using AI to generate viral YouTube shorts. Start with our Pro plan and watch your content reach new heights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard/studio"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-sm hover:shadow"
              >
                Start Creating Now
              </Link>
              <Link
                href="/dashboard/videos"
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View Examples
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                What&apos;s included in the video generation feature?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Full access to our AI video generation engine, allowing you to create viral YouTube shorts from text prompts with customizable duration and aspect ratios.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yes, you can cancel your subscription at any time. You&apos;ll continue to have access to the features until the end of your current billing period.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                What happens to my videos if I cancel?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                All your previously generated videos remain accessible in your account. You just won&apos;t be able to generate new videos without an active subscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 