"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/studio");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
          <span className="sr-only">Redirecting...</span>
        </div>
        <p className="text-lg mt-4 text-slate-600 dark:text-slate-400">Redirecting to studio...</p>
      </div>
    </div>
  );
} 