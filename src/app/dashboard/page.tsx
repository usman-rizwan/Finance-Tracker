import { redirect } from "next/navigation";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import DashboardContent from "~/components/layout/DashboardContent";
import { getServerSession } from "~/lib/auth";
import { db } from "~/server/db";
import { fetchMonthlyBalance } from "./action";

export default async function DashboardPage() {
  const { user } = await getServerSession();

  const userId = user?.id as string;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();


  const monthlyBalancePromise = fetchMonthlyBalance(userId, currentMonth, currentYear);


  const recentTransactionsPromise = db.transaction.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: "desc",
    },
    take: 10,
  });

  const [monthlyBalance, recentTransactions] = await Promise.all([
    monthlyBalancePromise,
    recentTransactionsPromise,
  ]);
  const isMonthlyBalanceEmpty = Object.values(monthlyBalance._sum).every(
    (val) => val === null
  );

  let finalMonthlyBalance = monthlyBalance;

  if (isMonthlyBalanceEmpty) {
    finalMonthlyBalance = await fetchMonthlyBalance(userId);
  }

  return (
    <ProtectedRoute>
      <DashboardContent

        totalBalance={
          finalMonthlyBalance?._sum?.closingBalance?.toFixed(2) ?? "0.00"
        }
        income={finalMonthlyBalance?._sum?.totalIncome?.toFixed(2) ?? "0.00"}
        expense={finalMonthlyBalance?._sum?.totalExpense?.toFixed(2) ?? "0.00"}
        openingBalance={finalMonthlyBalance?._sum?.openingBalance?.toFixed(2) ?? "0.00"}
        closingBalance={finalMonthlyBalance?._sum?.closingBalance?.toFixed(2) ?? "0.00"}
        savings={
          finalMonthlyBalance
            ? (
                (finalMonthlyBalance._sum?.totalIncome ?? 0) -
                (finalMonthlyBalance._sum?.totalExpense ?? 0)
              ).toFixed(2)
            : "0.00"
        }
        transactions={recentTransactions}
        userName={user.name}
      />
    </ProtectedRoute>
  );
}