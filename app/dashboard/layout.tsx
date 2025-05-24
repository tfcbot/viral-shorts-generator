"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Studio", path: "/dashboard/studio", icon: "🎬" },
    { name: "Videos", path: "/dashboard/videos", icon: "🎥" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-4">
        <div className="flex items-center gap-2 px-2 py-4 border-b border-slate-200 mb-4">
          <span className="font-bold text-xl">Viral Shorts</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 px-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm text-slate-600">Account</span>
          </div>
        </div>
      </aside>
      
      {/* Mobile header with dropdown menu */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <span className="font-bold">Viral Shorts</span>
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
  navItems: { name: string; path: string; icon: string }[];
  currentPath: string;
}) {
  return (
    <div className="relative group">
      <button className="p-2 rounded-md hover:bg-slate-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden z-10 hidden group-hover:block">
        <nav className="py-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-2 text-sm ${
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

