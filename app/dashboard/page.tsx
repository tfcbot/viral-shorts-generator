"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          href="/dashboard/studio" 
          className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold mb-2">Studio</h2>
          <p className="text-slate-600">Create and manage your viral shorts</p>
        </Link>
        
        {/* Add more dashboard cards here as needed */}
      </div>
    </div>
  );
}

