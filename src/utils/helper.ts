import { Home, BarChart3, Wallet, CreditCard, Target } from "lucide-react";
const navigationList = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Overview", href: "/activity", icon: Target },
  { name: "Wallet", href: "/wallet", icon: Wallet },
];


export interface TransactionWithBalance {
  id: string;
  userId: string;
  walletId: string;
  type: string;
  amount: string;
  title: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  runningBalance: string;
  wallet: {
    name: string;
    type: string;
    currency?: string;
  };
}


function calculateRunningBalances(
  transactions: any[],
  currentWalletBalance: number
): TransactionWithBalance[] {
  if (transactions.length === 0) {
    return [];
  }


  const sortedTransactions = [...transactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );


  let initialBalance = currentWalletBalance;

  for (const transaction of sortedTransactions) {
    const amount = parseFloat(transaction.amount.toString());
    if (transaction.type === 'INCOME') {
      initialBalance -= amount;
    } else if (transaction.type === 'EXPENSE') {
      initialBalance += amount;
    }
  }


  let runningBalance = initialBalance;
  const transactionsWithBalance: TransactionWithBalance[] = [];

  for (const transaction of sortedTransactions) {
    const amount = parseFloat(transaction.amount.toString());


    if (transaction.type === 'INCOME') {
      runningBalance += amount;
    } else if (transaction.type === 'EXPENSE') {
      runningBalance -= amount;
    }

    transactionsWithBalance.push({
      ...transaction,
      runningBalance: runningBalance.toFixed(2),
    });
  }

  return transactionsWithBalance;
}


function calculateWalletBalanceAtDate(
  transactions: any[],
  initialBalance: number,
  targetDate: Date
): number {
  const relevantTransactions = transactions.filter(
    transaction => new Date(transaction.date) <= targetDate
  );

  return relevantTransactions.reduce((balance, transaction) => {
    const amount = parseFloat(transaction.amount.toString());

    if (transaction.type === 'INCOME') {
      return balance + amount;
    } else if (transaction.type === 'EXPENSE') {
      return balance - amount;
    }

    return balance;
  }, initialBalance);
}


export {
  navigationList,
  calculateRunningBalances,
  calculateWalletBalanceAtDate
}