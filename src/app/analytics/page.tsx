import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { getServerSession } from "~/lib/auth";
import { db } from "~/server/db";
import AnalyticsSummary from "~/components/analytics/AnalyticsSummary";
import AnalyticsFilters from "~/components/analytics/AnalyticsFilters";
import MonthSummaryTable from "~/components/analytics/MonthSummaryTable";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const { user } = await getServerSession();
  const userId = user.id as string;

  const now = new Date();

  const query = Object.fromEntries(
    Object.entries(searchParams ?? {}).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  );

  const selectedStartDate = query.start ? new Date(query.start) : undefined;
  const selectedEndDate = query.end ? new Date(query.end) : undefined;

  const endDate = selectedEndDate ?? now;
  const defaultStartDate = new Date(endDate);
  defaultStartDate.setMonth(defaultStartDate.getMonth() - 11);
  const startDate = selectedStartDate ?? defaultStartDate;

  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth() + 1;

  const filterConditions = [
    { year: startYear, month: { gte: startMonth } },
    { year: { gt: startYear, lt: endYear } },
    { year: endYear, month: { lte: endMonth } },
  ];

  const monthlyData = await db.monthlyBalance.findMany({
    where: {
      userId,
      OR: filterConditions,
    },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
  });

  const aggregatedDataByMonth = new Map<string, {
    id: string;
    year: number;
    month: number;
    openingBalance: number;
    totalIncome: number;
    totalExpense: number;
    closingBalance: number;
  }>();

  for (const balance of monthlyData) {
    const key = `${balance.year}-${balance.month}`;
    if (!aggregatedDataByMonth.has(key)) {
      aggregatedDataByMonth.set(key, {
        id: key,
        year: balance.year,
        month: balance.month,
        openingBalance: Number(balance.openingBalance),
        totalIncome: Number(balance.totalIncome),
        totalExpense: Number(balance.totalExpense),
        closingBalance: Number(balance.closingBalance),
      });
    } else {
      const current = aggregatedDataByMonth.get(key)!;
      current.openingBalance += Number(balance.openingBalance);
      current.totalIncome += Number(balance.totalIncome);
      current.totalExpense += Number(balance.totalExpense);
      current.closingBalance += Number(balance.closingBalance);
    }
  }

  const monthsList: { year: number; month: number }[] = [];
  {
    const date = new Date(endYear, endMonth - 1, 1);
    const start = new Date(startYear, startMonth - 1, 1);
    while (date >= start) {
      monthsList.push({ year: date.getFullYear(), month: date.getMonth() + 1 });
      date.setMonth(date.getMonth() - 1);
    }
  }

  const monthlyBalances = monthsList.map(({ year, month }) => {
    const key = `${year}-${month}`;
    const item = aggregatedDataByMonth.get(key);
    return {
      id: key,
      year,
      month,
      openingBalance: (item?.openingBalance ?? 0).toString(),
      totalIncome: (item?.totalIncome ?? 0).toString(),
      totalExpense: (item?.totalExpense ?? 0).toString(),
      closingBalance: (item?.closingBalance ?? 0).toString(),
    };
  });

  const aggregates = await db.monthlyBalance.aggregate({
    _sum: {
      totalIncome: true,
      totalExpense: true,
      openingBalance: true,
      closingBalance: true,
    },
    where: { userId },
  });

  const currentYear = now.getFullYear();
  const yearsList = Array.from({ length: 7 }).map((_, index) => String(currentYear - index));

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Analytics & Reports</h1>
        </div>

        <AnalyticsSummary
          totalIncome={aggregates._sum.totalIncome?.toString() ?? "0"}
          totalExpense={aggregates._sum.totalExpense?.toString() ?? "0"}
          openingBalance={aggregates._sum.openingBalance?.toString() ?? "0"}
          closingBalance={aggregates._sum.closingBalance?.toString() ?? "0"}
        />

        <AnalyticsFilters
          initialStart={startDate.toISOString()}
          initialEnd={endDate.toISOString()}
          yearsList={yearsList}
        />

        <div id="analytics-table-container" className="rounded-lg border bg-background p-2 md:p-3">
          <MonthSummaryTable
            userName={user.name ?? "User"}
            monthlyBalances={monthlyBalances}
          />
        </div>

        {/* <div className="md:hidden">
          <DownloadReportButton targetContainerId="analytics-table-container" />
        </div> */}
      </div>
    </ProtectedRoute>
  );
}
