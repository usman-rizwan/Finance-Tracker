import { Card, CardContent } from '~/components/ui/card';
import { TrendingUp, TrendingDown, ArrowRightLeft, Settings } from 'lucide-react';
import { getTransactionSummary } from '~/app/activity/action';
import { TransactionType } from '@prisma/client';

interface Props {
  searchParams: any;
  userId: string;
}

export async function ActivitySummary({ searchParams, userId }: Props) {
  // Parse search params
  const filters = {
    userId,
    type: searchParams.type as TransactionType | 'ALL' | undefined,
    period: searchParams.period || 'month',
    year: searchParams.year ? parseInt(searchParams.year) : undefined,
    month: searchParams.month ? parseInt(searchParams.month) : undefined,
    startDate: searchParams.startDate ? new Date(searchParams.startDate) : undefined,
    endDate: searchParams.endDate ? new Date(searchParams.endDate) : undefined,
  };

  const summary = await getTransactionSummary(filters);
console.log('summary', summary);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Income */}
      <Card className="bg-emerald-50 border-emerald-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium mb-1">Total Income</p>
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Total Expenses */}
      <Card className="bg-red-50 border-red-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(summary.totalExpense)}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Net Amount */}
      <Card className={`${summary.netAmount >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} hover:shadow-md transition-shadow`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium mb-1 ${summary.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                Net Amount
              </p>
              <p className={`text-2xl font-bold ${summary.netAmount >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {summary.netAmount >= 0 ? '+' : ''}{formatCurrency(summary.netAmount)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${summary.netAmount >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <ArrowRightLeft className={`w-6 h-6 ${summary.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Count */}
      <Card className="bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-slate-700">
                {summary.transactionCount}
              </p>
            </div>
            <div className="bg-slate-100 p-3 rounded-full">
              <Settings className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}