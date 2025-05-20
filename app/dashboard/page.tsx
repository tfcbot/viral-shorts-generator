"use client";

import { UserButton } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background p-4 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Viral Shorts Generator" width={32} height={32} />
            <span className="font-bold text-xl">Viral Shorts Generator</span>
          </Link>
        </div>
        <div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create a New Short</h2>
            <p className="text-slate-600 mb-4">
              Ready to create your next viral YouTube short? Get started by selecting a topic or entering your own idea.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
              Create New Short
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Your Recent Shorts</h2>
            <div className="text-center py-12 text-slate-500">
              <p>You haven't created any shorts yet.</p>
              <p className="mt-2">Get started by creating your first short!</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-slate-100 p-6 text-center text-sm text-slate-600">
        <p>© {new Date().getFullYear()} Viral Shorts Generator. All rights reserved.</p>
      </footer>
    </div>
  );
}

