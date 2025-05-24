import { PricingTable } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'

export default async function PricingPage() {
  const { userId } = await auth()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Simple, Predictable Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Subscribe to get 30 credits every month for just $100. Credits roll over so you never lose value.
            Perfect for content creators who want consistent access to viral video generation.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="grid grid-cols-1 gap-8">
            {/* Pro Plan */}
            <div className="bg-purple-600/20 rounded-xl p-8 border-2 border-purple-500 relative">
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  $100<span className="text-lg font-normal text-gray-300">/month</span>
                </div>
                <p className="text-purple-300">30 credits monthly + rollover</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-white">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  30 credits every month
                </li>
                <li className="flex items-center text-white">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Credits granted on 1st of month
                </li>
                <li className="flex items-center text-white">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unused credits roll over (max 200)
                </li>
                <li className="flex items-center text-white">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Cancel anytime, keep credits
                </li>
                <li className="flex items-center text-white">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
              </ul>
              
              <div className="text-center mb-6">
                <PricingTable />
              </div>
            </div>
          </div>
          
          {/* Value Proposition */}
          <div className="mt-12 text-center bg-slate-800/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3">
              💡 Why Choose Monthly Credits?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-green-400 font-semibold mb-1">No Waste</div>
                <div className="text-gray-300">Credits roll over so you never lose value</div>
              </div>
              <div>
                <div className="text-blue-400 font-semibold mb-1">Predictable Cost</div>
                <div className="text-gray-300">$100/month covers most content creation needs</div>
              </div>
              <div>
                <div className="text-purple-400 font-semibold mb-1">Build Credit Bank</div>
                <div className="text-gray-300">Save credits for big projects or busy months</div>
              </div>
            </div>
          </div>
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
                How does the monthly credit system work?
              </h3>
              <p className="text-gray-300">
                Every Pro subscriber gets 30 credits on the 1st of each month. Each video generation costs 1 credit. 
                Unused credits roll over to the next month (up to 200 total) so you never lose value.
              </p>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                What happens if I cancel my subscription?
              </h3>
              <p className="text-gray-300">
                You can cancel anytime and keep all your remaining credits. You&apos;ll continue to have access 
                to the dashboard and can use your credits until they&apos;re gone. You just won&apos;t receive new monthly credits.
              </p>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Why is there a 200 credit limit?
              </h3>
              <p className="text-gray-300">
                The 200 credit cap (about 6-7 months of credits) prevents infinite accumulation while still giving you 
                plenty of flexibility to save credits for big projects or busy periods.
              </p>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                What if my video generation fails?
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