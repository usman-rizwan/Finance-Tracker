import React from 'react';
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar
} from "lucide-react";
import { formatCurrency, formatDate } from "~/lib/utils";

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: string;
  title: string;
  description: string | null;
  date: string;
  wallet: {
    name: string;
    type: string;
  };
}

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  isLoading?: boolean;
}

function transactionBadge(transaction: Transaction) {
  const baseClass = "border text-sm font-medium px-2.5 py-0.5 rounded inline-flex items-center";

  switch (transaction.type) {
    case 'INCOME':
      return (
        <Badge className={`${baseClass} bg-green-100 text-green-800 border-green-200`}>
          <TrendingUp className="w-3 h-3 mr-1" />
          INCOME
        </Badge>
      );
    case 'EXPENSE':
      return (
        <Badge className={`${baseClass} bg-red-100 text-red-800 border-red-200`}>
          <TrendingDown className="w-3 h-3 mr-1" />
          EXPENSE
        </Badge>
      );
    case 'TRANSFER':
      return (
        <Badge className={`${baseClass} bg-blue-100 text-blue-800 border-blue-200`}>
          <Wallet className="w-3 h-3 mr-1" />
          TRANSFER
        </Badge>
      );
    default:
      return null;
  }
}

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  isLoading = false
}: TransactionTableProps) {

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          No transactions match your current filters. Try adjusting your search criteria or add a new transaction.
        </p>
      </div>
    );
  }

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No.</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Wallet</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction, index) => (
            <TableRow key={transaction.id} className="hover:bg-gray-50">
              <TableCell>{`${index + 1})`}</TableCell>

              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">{transaction.title}</div>
                  {transaction.description && (
                    <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                      {transaction.description}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm">{transaction.wallet.name}</div>
                    <div className="text-xs text-gray-500 uppercase">
                      {transaction.wallet.type}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{formatDate(transaction.date)}</span>
                </div>
              </TableCell>

              <TableCell>
                {transactionBadge(transaction)}
              </TableCell>

              <TableCell className="text-right">
                <span
                  className={`font-semibold ${
                    transaction.type === 'INCOME'
                      ? 'text-green-600'
                      : transaction.type === 'EXPENSE'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}
                >
                  {transaction.type === 'INCOME'
                    ? '+'
                    : transaction.type === 'EXPENSE'
                    ? '-'
                    : ''}
                  {formatCurrency(transaction.amount)}
                </span>
              </TableCell>


              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={isLoading}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(transaction)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(transaction)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        {/* Totals */}
        <tfoot className="bg-gray-50 dark:bg-zinc-900 border-t">
          <TableRow>
            <TableCell colSpan={5} className="py-3 px-4 text-sm text-muted-foreground font-medium text-left">
              Total Income
            </TableCell>
            <TableCell className="py-3 px-4 text-right font-semibold text-green-600">
              +{formatCurrency(totalIncome.toString())}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell colSpan={5} className="py-3 px-4 text-sm text-muted-foreground font-medium text-left">
              Total Expense
            </TableCell>
            <TableCell className="py-3 px-4 text-right font-semibold text-red-600">
              -{formatCurrency(totalExpense.toString())}
            </TableCell>
          </TableRow>

          <TableRow className="bg-white dark:bg-zinc-950 border-t border-muted">
            <TableCell colSpan={5} className="py-4 px-4 text-base font-semibold text-left text-foreground">
              Net Balance
            </TableCell>
            <TableCell
              className={`py-4 px-4 text-right text-base font-bold ${
                netBalance >= 0 ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {netBalance >= 0 ? '+' : '-'}
              {formatCurrency(Math.abs(netBalance).toString())}
            </TableCell>
          </TableRow>
        </tfoot>

      </Table>
    </div>
  );
}