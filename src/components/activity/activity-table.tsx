// ~/components/activity-table.tsx
import { format } from 'date-fns';
import { Badge } from '~/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '~/components/ui/table';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import {
  TrendingUp, TrendingDown, ArrowRightLeft, Settings
} from 'lucide-react';

import { getFilteredTransactions } from '~/app/activity/action';
import { getWallets } from '~/app/wallet/action';
import { TransactionType } from '@prisma/client';
import { cn } from '~/lib/utils';

interface Props {
  searchParams: any;
  userId: string;
}

export async function ActivityTable({ searchParams, userId }: Props) {
  const filters = {
    userId,
    type: searchParams.type as TransactionType | 'ALL' | undefined,
    period: searchParams.period || 'month',
    year: searchParams.year ? parseInt(searchParams.year) : undefined,
    month: searchParams.month ? parseInt(searchParams.month) : undefined,
    startDate: searchParams.startDate ? new Date(searchParams.startDate) : undefined,
    endDate: searchParams.endDate ? new Date(searchParams.endDate) : undefined,
  };

  const [transactions, wallets] = await Promise.all([
    getFilteredTransactions(filters),
    getWallets(userId)
  ]);

  const walletBalanceMap = new Map(wallets.map(w => [w.id, parseFloat(w.balance)]));
  const walletDataMap = new Map(wallets.map(w => [w.id, w]));

  const transactionsWithBalances = transactions.map(transaction => {
    const walletData = walletDataMap.get(transaction.walletId);
    return {
      ...transaction,
      wallet: {
        ...transaction.wallet,
        type: walletData?.type || 'cash',
      },
    };
  });

  const sortedTransactions = transactionsWithBalances
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((transaction, index, arr) => {
      const walletBalance = walletBalanceMap.get(transaction.walletId) || 0;

      let balanceAfter = walletBalance;
      for (let i = 0; i < index; i++) {
        const laterTransaction = arr[i];
        if (laterTransaction.walletId === transaction.walletId) {
          const amount = parseFloat(laterTransaction.amount.toString());
          if (laterTransaction.type === 'INCOME') {
            balanceAfter -= amount;
          } else if (laterTransaction.type === 'EXPENSE') {
            balanceAfter += amount;
          }
        }
      }

      return {
        ...transaction,
        runningBalance: balanceAfter.toFixed(2),
      };
    });

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'INCOME':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'EXPENSE':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'TRANSFER':
        return <ArrowRightLeft className="w-5 h-5 text-blue-600" />;
      case 'ADJUSMENT':
        return <Settings className="w-5 h-5 text-purple-600" />;
      default:
        return <Settings className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionBadge = (type: TransactionType) => {
    const base = "rounded-full px-3 py-1 text-xs font-medium border";
    switch (type) {
      case 'INCOME':
        return <Badge className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>Income</Badge>;
      case 'EXPENSE':
        return <Badge className={`${base} bg-red-50 text-red-700 border-red-200`}>Expense</Badge>;
      case 'TRANSFER':
        return <Badge className={`${base} bg-blue-50 text-blue-700 border-blue-200`}>Transfer</Badge>;
      case 'ADJUSMENT':
        return <Badge className={`${base} bg-purple-50 text-purple-700 border-purple-200`}>Adjustment</Badge>;
      default:
        return <Badge variant="outline" className={base}>Other</Badge>;
    }
  };

  const formatAmount = (
    amount: number | string,
    type: TransactionType,
    currency = 'USD'
  ) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const prefix = type === 'INCOME' ? '+' : type === 'EXPENSE' ? '-' : '';
    const symbol = currency === 'PKR' ? 'Rs' : currency === 'USD' ? '$' : currency;
    return `${prefix}${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatBalance = (
    amount: number | string,
    currency = 'USD'
  ) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const symbol = currency === 'PKR' ? 'Rs' : currency === 'USD' ? '$' : currency;
    return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <TrendingUp className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">No transactions found</h3>
          <p className="text-slate-600 text-sm">
            Try changing the date range or transaction type to see your financial data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden cursor-pointer">
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className=" px-6 py-4 text-slate-800 font-semibold">No.</TableHead>
              <TableHead className="w-[36%] px-6 py-4 text-slate-800 font-semibold">Transaction</TableHead>
              <TableHead className="w-[12%] px-6 py-4 text-slate-800 font-semibold">Type</TableHead>
              <TableHead className="w-[18%] px-6 py-4 text-slate-800 font-semibold">Date</TableHead>
              <TableHead className="w-[18%] px-6 py-4 text-slate-800 font-semibold">Wallet</TableHead>
              <TableHead className="w-[16%] px-6 py-4 text-right text-slate-800 font-semibold">Balance After</TableHead>
              <TableHead className="w-[16%] px-6 py-4 text-right text-slate-800 font-semibold">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction, index) => (
              <TableRow key={transaction.id} className={cn(
                "border-slate-100 transition-colors duration-150",
                index % 2 === 0 ? "bg-white" : "bg-slate-50/50",
              )}>
                <TableCell className="px-6 py-4">
                 {`${index + 1}.`}
                 </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-11 w-11 border border-slate-200">
                      <AvatarFallback className="bg-gradient-to-br from-slate-50 to-slate-100">
                        {getTransactionIcon(transaction.type)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-semibold text-slate-900 truncate">{transaction.title}</p>
                      <p className="text-xs text-slate-600 truncate">{transaction.description}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  {getTransactionBadge(transaction.type)}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-900">{format(transaction.date, 'MMM dd, yyyy')}</p>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{transaction.wallet.name}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <span className="text-sm text-slate-700 font-medium">
                    {formatBalance(transaction.runningBalance, transaction.wallet.currency)}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <span className={cn(
                    "text-sm font-semibold",
                    transaction.type === 'INCOME' ? 'text-emerald-700' :
                    transaction.type === 'EXPENSE' ? 'text-red-700' :
                    transaction.type === 'TRANSFER' ? 'text-blue-700' :
                    transaction.type === 'ADJUSMENT' ? 'text-purple-700' :
                    'text-slate-700'
                  )}>
                    {formatAmount(transaction.amount, transaction.type, transaction.wallet.currency)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
