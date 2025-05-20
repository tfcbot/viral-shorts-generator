import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard
          title="Create New Short"
          description="Generate a new viral YouTube short with our AI-powered tools."
          linkText="Go to Studio"
          linkHref="/dashboard/studio"
          icon="🎬"
        />
        
        <DashboardCard
          title="View Your Videos"
          description="Manage and track all your generated shorts in one place."
          linkText="View Videos"
          linkHref="/dashboard/videos"
          icon="🎥"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  linkText,
  linkHref,
  icon,
}: {
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  icon: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-slate-600 mb-4">{description}</p>
      <Link
        href={linkHref}
        className="inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        {linkText}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 ml-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  );
}

