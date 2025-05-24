"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useEffect } from "react";

export default function CreditDisplay() {
  const userCredits = useQuery(api.credits.getUserCredits);
  const initializeCredits = useMutation(api.credits.initializeUserCredits);

  // Initialize credits for new users
  useEffect(() => {
    if (userCredits && userCredits.credits === 0 && !userCredits._id) {
      initializeCredits();
    }
  }, [userCredits, initializeCredits]);

  if (!userCredits) {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded w-24 mb-2"></div>
          <div className="h-6 bg-white/20 rounded w-16"></div>
        </div>
      </div>
    );
  }

  const isLowCredits = userCredits.credits <= 2;

  return (
    <div className={`rounded-lg p-4 ${
      isLowCredits 
        ? 'bg-gradient-to-r from-orange-500 to-red-500' 
        : 'bg-gradient-to-r from-purple-600 to-blue-600'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">
            {userCredits.planName || 'Free Trial'}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-white text-xl font-bold">
              {userCredits.credits} credits
            </p>
            {isLowCredits && (
              <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          {isLowCredits && (
            <p className="text-white/90 text-xs mt-1">
              Running low! Each video costs 1 credit
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <Link 
            href="/pricing"
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            {userCredits.credits === 0 ? 'Buy Credits' : 'Add Credits'}
          </Link>
          
          {userCredits.planId && (
            <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-xs transition-colors">
              Manage Plan
            </button>
          )}
        </div>
      </div>

      {/* Progress bar for credits */}
      <div className="mt-3">
        <div className="bg-white/20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ 
              width: `${Math.min(100, (userCredits.credits / 10) * 100)}%` 
            }}
          ></div>
        </div>
        <p className="text-white/70 text-xs mt-1">
          {userCredits.credits} of ∞ credits available
        </p>
      </div>
    </div>
  );
} 