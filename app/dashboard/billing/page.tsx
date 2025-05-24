"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

interface CreditTransaction {
  _id: string;
  _creationTime: number;
  userId: string;
  type: "purchase" | "consumption" | "refund" | "bonus";
  amount: number;
  description: string;
  relatedVideoId?: string;
  relatedPlanId?: string;
  balanceAfter: number;
  createdAt: number;
}

export default function BillingPage() {
  const userCredits = useQuery(api.credits.getUserCredits);
  const creditHistory = useQuery(api.credits.getCreditHistory, { limit: 20 });
  const availablePlans = useQuery(api.billing.getAvailablePlans);

  if (!userCredits || !availablePlans) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate monthly spending from transaction history
  const calculateMonthlySpending = () => {
    if (!creditHistory) return 0;
    
    const now = Date.now();
    const monthStart = new Date(now);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthlyTransactions = creditHistory.filter(
      (t) => t.createdAt >= monthStart.getTime() && t.type === "consumption"
    );
    
    return monthlyTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const monthlySpending = calculateMonthlySpending();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return '💳';
      case 'consumption':
        return '🎬';
      case 'bonus':
        return '🎁';
      case 'refund':
        return '↩️';
      default:
        return '📄';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Billing & Credits
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your credits, view billing history, and upgrade your plan
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Current Credits */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-xl">💎</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Current Credits</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Available balance</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {userCredits.credits}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ${userCredits.credits} value
            </p>
          </div>

          {/* Current Plan */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Current Plan</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Subscription status</p>
              </div>
            </div>
            <div className="mb-2">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                {userCredits.planName || "Free Trial"}
              </span>
            </div>
            {getStatusBadge(userCredits.subscriptionStatus || "inactive")}
          </div>

          {/* Monthly Spending */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">This Month</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Credits used</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {monthlySpending}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ${monthlySpending} spent
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Link
            href="/pricing"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Buy More Credits
          </Link>
          <Link
            href="/pricing"
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Change Plan
          </Link>
        </div>

        {/* Credit History */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Credit History
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track your credit purchases and usage
            </p>
          </div>

          <div className="overflow-hidden">
            {creditHistory && creditHistory.length > 0 ? (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {creditHistory.map((transaction: CreditTransaction, index: number) => (
                  <div key={index} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Balance: {transaction.balanceAfter}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">📄</div>
                <p className="text-slate-500 dark:text-slate-400">
                  No transactions yet. Start generating videos to see your credit usage!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Account Statistics
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Credits Purchased</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {userCredits.totalCreditsEver || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Lifetime Value</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${userCredits.totalCreditsEver || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 