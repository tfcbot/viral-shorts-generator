"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Image from "next/image";
import CreditDisplay from "@/components/CreditDisplay";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dashboardAccess = useQuery(api.billing.checkDashboardAccess);
  
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠", exact: true },
    { name: "Studio", path: "/dashboard/studio", icon: "🎬" },
    { name: "Videos", path: "/dashboard/videos", icon: "🎥" },
  ];

  // Show loading state while checking access
  if (dashboardAccess === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Checking access...</p>
        </div>
      </div>
    );
  }

  // Block access if user doesn't have subscription or credits
  if (!dashboardAccess.hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Subscription Required
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You need an active Pro subscription to access the dashboard and create viral videos.
          </p>
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors block"
            >
              View Pricing Plans
            </Link>
            <Link
              href="/"
              className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white py-3 px-4 rounded-lg font-medium transition-colors block"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 px-6 py-6 border-b border-slate-200 dark:border-slate-700">
          <Image src="/logo.svg" alt="Viral Shorts Generator" width={24} height={24} />
          <span className="font-bold text-lg text-slate-900 dark:text-white">Viral Shorts</span>
        </div>
        
        {/* Subscription Status */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className={`rounded-lg p-3 ${
            dashboardAccess.isActiveSubscriber 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500' 
              : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {dashboardAccess.planName}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                dashboardAccess.isActiveSubscriber
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
              }`}>
                {dashboardAccess.isActiveSubscriber ? '✅ Active' : '⏳ Credits Only'}
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-400">
              +30 credits monthly on the 1st
            </p>
          </div>
        </div>
        
        {/* Credit Display */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <CreditDisplay />
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.path 
              : pathname === item.path || pathname.startsWith(`${item.path}/`);
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500 shadow-sm" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        

        
        {/* User section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Account</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Settings & billing</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile header with dropdown menu */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Viral Shorts Generator" width={20} height={20} />
          <span className="font-bold text-slate-900 dark:text-white">Viral Shorts</span>
        </div>
        <div className="flex items-center gap-4">
          <MobileMenu navItems={navItems} currentPath={pathname} />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
      
      {/* Mobile Subscription Status */}
      <div className="md:hidden p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="rounded-lg p-3 mb-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {dashboardAccess.planName}
              </span>
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                  ✅ Active
                </span>
            </div>
            
          </div>
        </div>
        <CreditDisplay />
      </div>
      
      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function MobileMenu({ 
  navItems, 
  currentPath 
}: { 
  navItems: { name: string; path: string; icon: string; exact?: boolean }[];
  currentPath: string;
}) {
  return (
    <div className="relative group">
      <button className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-400">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-10 hidden group-hover:block">
        <nav className="py-2">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? currentPath === item.path 
              : currentPath === item.path || currentPath.startsWith(`${item.path}/`);
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

