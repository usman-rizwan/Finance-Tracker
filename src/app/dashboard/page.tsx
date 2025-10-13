import { redirect } from "next/navigation";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import DashboardContent from "~/components/layout/DashboardContent";
import { getServerSession } from "~/lib/auth";
import { db } from "~/server/db";

export default async function DashboardPage() {
  const { user } = await getServerSession();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; 
  const currentYear = currentDate.getFullYear();
  const userId = user?.id as string;

let monthlyBalance = await db.monthlyBalance.aggregate({
  _sum: {
    openingBalance: true,
    totalIncome: true,
    totalExpense: true,
    closingBalance: true,
  },
  _count: {
    walletId: true,
  },
  where: {
    userId,
    month: currentMonth,
    year: currentYear,
  },
});

const isMonthlyBalanceEmpty = Object.values(monthlyBalance._sum).every((val) => val === null);

if (isMonthlyBalanceEmpty) {
  monthlyBalance = await db.monthlyBalance.aggregate({
    _sum: {
      openingBalance: true,
      totalIncome: true,
      totalExpense: true,
      closingBalance: true,
    },
    _count: {
      walletId: true,
    },
    where: {
      userId,
    },
  });
}

  const recentTransactions = await db.transaction.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: "desc",
    },
    take: 10,
  });
console.log('recentTransactions', recentTransactions);

  return (
    <ProtectedRoute>
      <DashboardContent
        totalBalance={
          monthlyBalance?._sum?.closingBalance?.toFixed(2) ?? "0.00"
        }
        income={monthlyBalance?._sum?.totalIncome?.toFixed(2) ?? "0.00"}
        expense={monthlyBalance?._sum?.totalExpense?.toFixed(2) ?? "0.00"}
        openingBalance={monthlyBalance?._sum?.openingBalance?.toFixed(2) ?? "0.00"}
        closingBalance={monthlyBalance?._sum?.closingBalance?.toFixed(2) ?? "0.00"}
        savings={
          monthlyBalance
            ? (
                (monthlyBalance._sum?.totalIncome ?? 0) -
                (monthlyBalance._sum?.totalExpense ?? 0)
              ).toFixed(2)
            : "0.00"
        }
        transactions={recentTransactions}
        userName={user.name}
      />
    </ProtectedRoute>
  );
}
