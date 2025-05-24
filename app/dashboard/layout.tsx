"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠", exact: true },
    { name: "Studio", path: "/dashboard/studio", icon: "🎬" },
    { name: "Videos", path: "/dashboard/videos", icon: "🎥" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 px-6 py-6 border-b border-slate-200 dark:border-slate-700">
          <Image src="/logo.svg" alt="Viral Shorts Generator" width={24} height={24} />
          <span className="font-bold text-lg text-slate-900 dark:text-white">Viral Shorts</span>
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
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage settings</p>
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

