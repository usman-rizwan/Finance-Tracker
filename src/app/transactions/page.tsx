import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { getServerSession } from "~/lib/auth";
import { db } from "~/server/db";
import { getTransactions } from "./action";
import TransactionsDasboard from "./TransactionsDasboard";
import { getWallets } from "../wallet/action";
import { startOfMonth, endOfMonth } from 'date-fns'

export default async function TransactionsPage() {
  const { user } = await getServerSession();

  const wallets = await getWallets(user.id);
  const currentDate = new Date();

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  const rawTransactions = await getTransactions(user.id, {
    startDate,
    endDate,
    limit: 50
  });
  const transactions = rawTransactions
    .filter(transaction => transaction.type === 'INCOME' || transaction.type === 'EXPENSE')
    .map((transaction) => ({
      ...transaction,
      type: transaction.type as 'INCOME' | 'EXPENSE',
      amount: transaction.amount.toString(),
      date: (transaction.date as any)?.toISOString ? (transaction.date as any).toISOString() : String(transaction.date),
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString()
    }));

  return (
    <ProtectedRoute>
      <TransactionsDasboard
        transactions={transactions}
        wallets={wallets}
        userId={user.id}
      />
    </ProtectedRoute>
  );
}