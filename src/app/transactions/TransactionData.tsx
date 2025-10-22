import { getTransactions } from "./action";
import TransactionsDasboard from "./TransactionsDasboard";
import { getWallets } from "../wallet/action";
import { startOfMonth, endOfMonth } from 'date-fns'

interface TransactionsData {
    userId: string;
}

export default async function TransactionsData({ userId }: TransactionsData) {
    
    // 1. Prepare Parameters
    const currentDate = new Date();
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);

    // 2. Optimization: Parallel Data Fetching
    const [wallets, rawTransactions] = await Promise.all([
        getWallets(userId),
        getTransactions(userId, {
            startDate,
            endDate,
            limit: 50
        })
    ]);

    const transactions = rawTransactions
        .filter(transaction => 
            transaction.type === 'INCOME' || 
            transaction.type === 'EXPENSE' || 
            transaction.type === 'TRANSFER' 
        )
        .map((transaction) => ({
            ...transaction,
            amount: transaction.amount.toString(),

            type: transaction.type as 'INCOME' | 'EXPENSE' | 'TRANSFER', 
            date: transaction.date instanceof Date ? transaction.date.toISOString() : String(transaction.date),
            createdAt: transaction.createdAt.toISOString(),
            updatedAt: transaction.updatedAt.toISOString()
        }));

    return (
        <TransactionsDasboard
            transactions={transactions}
            wallets={wallets}
            userId={userId}
        />
    );
}