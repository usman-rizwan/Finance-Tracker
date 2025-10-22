import DashboardContent from "~/components/layout/DashboardContent";
import { db } from "~/server/db";
import { fetchMonthlyBalance } from "./action";


type Props = {
    userId: string;
    userName: string;
}

export default async function DashboardData({ userId, userName }: Props) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  

  const monthlyBalancePromise = fetchMonthlyBalance(userId, currentMonth, currentYear);

  const recentTransactionsPromise = db.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
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
      userName={userName}
    />
  );
}