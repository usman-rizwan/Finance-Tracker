import { db } from "~/server/db";

const fetchMonthlyBalance = async (userId: string, month?: number, year?: number) => {
  const where: { userId: string; month?: number; year?: number } = { userId };
  if (month && year) {
    where.month = month;
    where.year = year;
  }

  return db.monthlyBalance.aggregate({
    _sum: {
      openingBalance: true,
      totalIncome: true,
      totalExpense: true,
      closingBalance: true,
    },
    _count: {
      walletId: true,
    },
    where,
  });
};

export { fetchMonthlyBalance };