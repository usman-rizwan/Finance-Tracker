import { Suspense } from 'react';
import { ActivityFilters } from '~/components/activity/activity-filters';
import { ActivityTable } from '~/components/activity/activity-table';
import { ActivitySummary } from '~/components/activity/activity-summary';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { TransactionType } from '@prisma/client';
import { getServerSession } from '~/lib/auth';
import { FiltersSkeleton, SummarySkeleton, TransactionTableSkeleton } from '~/components/skeleton/skeleton';

interface SearchParams {
    type?: TransactionType | 'ALL';
    period?: 'month' | 'year' | 'custom';
    year?: string;
    month?: string;
    startDate?: string;
    endDate?: string;
    walletId?: string;
}

interface Props {
    searchParams: SearchParams;
}

export default async function ActivityPage({ searchParams }: Props) {
    const { user } = await getServerSession();
    const userId = user.id;
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
                    <ActivityFilters searchParams={searchParams} userId={userId} />
                </Suspense>

                {/* Summary Cards */}
                <Suspense fallback={<SummarySkeleton />}>
                    <ActivitySummary searchParams={searchParams} userId={userId} />
                </Suspense>

                {/* Transactions Table */}
                <div >
                    <div className="p-0 pb-6">
                        <Suspense fallback={<TransactionTableSkeleton />}>
                            <ActivityTable searchParams={searchParams} userId={userId} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}

