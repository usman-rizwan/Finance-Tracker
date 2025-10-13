// src/app/activity/page.tsx

import { Suspense } from 'react';
import { ActivityFilters } from '~/components/activity/activity-filters';
import { ActivityTable } from '~/components/activity/activity-table';
import { ActivitySummary } from '~/components/activity/activity-summary';
import { FiltersSkeleton, SummarySkeleton, TransactionTableSkeleton } from '~/components/skeleton/skeleton';
import { getServerSession } from '~/lib/auth';
import { TransactionType } from '@prisma/client';
import { getString } from '~/utils/helper';

interface SearchParams {
  type?: TransactionType | 'ALL';
  period?: 'month' | 'year' | 'custom';
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  walletId?: string;
}

export default async function ActivityPage({
  searchParams = {},
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { user } = await getServerSession();
  const userId = user.id;

  const textParams: SearchParams = {
    type: getString(searchParams.type) as SearchParams['type'],
    period: getString(searchParams.period) as SearchParams['period'],
    year: getString(searchParams.year),
    month: getString(searchParams.month),
    startDate: getString(searchParams.startDate),
    endDate: getString(searchParams.endDate),
    walletId: getString(searchParams.walletId),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            Financial Overview
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Track your income and expenses with detailed insights and flexible filtering options
          </p>
        </div>

        {/* Filters Card */}
        <Suspense fallback={<FiltersSkeleton />}>
          <ActivityFilters searchParams={textParams} userId={userId} />
        </Suspense>

        {/* Summary Cards */}
        <Suspense fallback={<SummarySkeleton />}>
          <ActivitySummary searchParams={textParams} userId={userId} />
        </Suspense>

        {/* Transactions Table */}
        <div>
          <div className="p-0 pb-6">
            <Suspense fallback={<TransactionTableSkeleton />}>
              <ActivityTable searchParams={textParams} userId={userId} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

