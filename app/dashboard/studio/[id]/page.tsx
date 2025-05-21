"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function ShortDetailPage() {
  const params = useParams();
  const shortId = params.id as string;
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/studio" className="text-blue-600 hover:underline">
          ← Back to Studio
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Short Details</h1>
      <p className="text-slate-600 mb-4">
        This is a placeholder for the short details page. In a production environment, 
        this would display the details for short ID: {shortId}
      </p>
      
      <div className="bg-slate-100 p-4 rounded-md border border-slate-200">
        <p className="text-slate-700">
          To implement this page fully, we need to run the Convex development server 
          to generate the proper API types. This would be done in a real development environment.
        </p>
      </div>
    </div>
  );
}
