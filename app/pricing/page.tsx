import { PricingTable } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

export default async function PricingPage() {
  const { userId } = await auth()
  
  // Redirect authenticated users to dashboard after subscription
  if (userId) {
    // You can add logic here to check if they're coming from a subscription flow
    // For now, show the pricing table to allow plan changes
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Generate unlimited viral shorts with our credit-based system. Each video costs 1 credit ($1).
            Start with 3 free credits and scale as you grow.
          </p>
        </div>

        {/* Pricing Table */}
        <div className="max-w-6xl mx-auto">
          <PricingTable />
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-400">Generate professional videos in minutes, not hours</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Face Required</h3>
            <p className="text-gray-400">Create engaging content without appearing on camera</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Instant Download</h3>
            <p className="text-gray-400">Download your videos immediately after generation</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                How does the credit system work?
              </h3>
              <p className="text-gray-300">
                Each video generation costs 1 credit ($1). Credits don&apos;t expire and can be used anytime. 
                You get 3 free credits to start, then purchase more credits through our flexible plans.
              </p>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I change or cancel my plan?
              </h3>
              <p className="text-gray-300">
                Yes! You can upgrade, downgrade, or cancel your subscription at any time. 
                Your unused credits will remain in your account.
              </p>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                What happens if my video generation fails?
              </h3>
              <p className="text-gray-300">
                If a video generation fails due to our system issues, your credit will be automatically refunded. 
                You&apos;re only charged for successful video generations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 