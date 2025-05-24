import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
        <p className="text-blue-100">Create viral YouTube shorts without showing your face</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Videos Created"
          value="0"
          icon="🎥"
          description="Total shorts generated"
        />
        <StatCard
          title="Views"
          value="0"
          icon="👁️"
          description="Combined video views"
        />
        <StatCard
          title="Revenue"
          value="$0"
          icon="💰"
          description="Total earnings"
        />
        <StatCard
          title="Growth"
          value="0%"
          icon="📈"
          description="Week over week"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create New Video Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="text-2xl">🚀</span>
            Quick Start
          </h2>
          <div className="space-y-4">
            <QuickActionCard
              title="Create AI Short"
              description="Generate a viral short with AI-powered content and visuals"
              linkText="Start Creating"
              linkHref="/dashboard/studio"
              icon="✨"
              featured={true}
            />
            <QuickActionCard
              title="Use Template"
              description="Start with a proven viral template"
              linkText="Browse Templates"
              linkHref="/dashboard/studio?tab=templates"
              icon="📋"
            />
            <QuickActionCard
              title="Upload Content"
              description="Transform your existing content into shorts"
              linkText="Upload & Transform"
              linkHref="/dashboard/studio?tab=upload"
              icon="📤"
            />
          </div>
        </div>

        {/* Recent Videos */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <span className="text-2xl">🎬</span>
              Recent Videos
            </h2>
            <Link 
              href="/dashboard/videos" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            <EmptyState 
              icon="🎥" 
              title="No videos yet" 
              description="Create your first viral short to get started"
              actionText="Create Now"
              actionHref="/dashboard/studio"
            />
          </div>
        </div>
      </div>

      {/* Tips and Resources */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
          <span className="text-2xl">💡</span>
          Tips for Success
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TipCard
            title="Trending Topics"
            description="Focus on current events, popular memes, and trending hashtags"
            icon="🔥"
          />
          <TipCard
            title="Hook Viewers Early"
            description="Create compelling first 3 seconds to maximize retention"
            icon="🎣"
          />
          <TipCard
            title="Post Consistently"
            description="Upload 2-3 shorts daily for optimal algorithm performance"
            icon="⏰"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string;
  icon: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  linkText,
  linkHref,
  icon,
  featured = false,
}: {
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  icon: string;
  featured?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border transition-all hover:shadow-md ${
      featured 
        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" 
        : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600"
    }`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{description}</p>
          <Link
            href={linkHref}
            className={`inline-flex items-center text-sm font-medium transition-colors ${
              featured
                ? "text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
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
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
}: {
  icon: string;
  title: string;
  description: string;
  actionText: string;
  actionHref: string;
}) {
  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300 mb-4">{description}</p>
      <Link
        href={actionHref}
        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm hover:shadow"
      >
        {actionText}
      </Link>
    </div>
  );
}

function TipCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow">
      <div className="text-2xl">{icon}</div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </div>
  );
}

