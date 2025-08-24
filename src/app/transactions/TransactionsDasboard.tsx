'use client';
import React, { useState } from 'react';
import DashboardLayout from "~/components/layout/DashboardLayout";
import AddTransactionDialog from "~/components/transaction/AddTransactionDialog";
import EditTransactionDialog from "~/components/transaction/EditTransactionDialog";
import DeleteTransactionDialog from "~/components/transaction/DeleteTransactionDialog";
import TransactionFilters from "~/components/transaction/TransactionFilters";
import TransactionTable from "~/components/transaction/TransactionTable";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  ArrowUpDown
} from "lucide-react";
import { formatCurrency } from "~/lib/utils";
import { createTransaction, updateTransaction, deleteTransaction, getTransactions } from "./action";
import type { CreateTransactionFormData, UpdateTransactionFormData } from "~/lib/validation-schemas";
import { startOfMonth, endOfMonth } from "date-fns";

interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  type: 'INCOME' | 'EXPENSE';
  amount: string;
  title: string;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  wallet: {
    name: string;
    type: string;
  };
}

interface Wallet {
  id: string;
  name: string;
  type: string;
  currency: string | null;
  balance: string;
}

interface TransactionsDasboardProps {
  transactions: Transaction[];
  wallets: Wallet[];
  userId: string;
}

export default function TransactionsDasboard({ 
  transactions: initialTransactions, 
  wallets, 
  userId 
}: TransactionsDasboardProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate statistics
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
  const netAmount = totalIncome - totalExpense;

  const stats = [
    {
      label: "Total Income",
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      label: "Total Expenses", 
      value: formatCurrency(totalExpense),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      label: "Net Amount",
      value: formatCurrency(netAmount),
      icon: DollarSign,
      color: netAmount >= 0 ? "text-green-600" : "text-red-600",
      bgColor: netAmount >= 0 ? "bg-green-100" : "bg-red-100"
    },
    {
      label: "Total Transactions",
      value: transactions.length.toString(),
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    }
  ];

  const handleAddTransaction = async (transactionData: CreateTransactionFormData) => {
    try {
      setIsLoading(true);
      const result = await createTransaction({
        userId,
        ...transactionData,
        amount: parseFloat(transactionData.amount),
        date: transactionData.date ? new Date(transactionData.date) : new Date(),
        description: transactionData.description ?? "",
      });
      
      if (result.success) {
        await refreshTransactions();
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleUpdateTransaction = async (transactionId: string, data: UpdateTransactionFormData) => {
    try {
      setIsLoading(true);
      const result = await updateTransaction({
         id: transactionId,
      userId,
      ...data,
      amount: parseFloat(data.amount),
      date: data.date ? new Date(data.date) : new Date(),
      description: data.description ?? "", 
      });
      
      if (result.success) {
        await refreshTransactions({ startDate: data.date, endDate: data.date });
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
  };

  const handleConfirmDelete = async (transactionId: string) => {
    try {
      setIsLoading(true);
      const result = await deleteTransaction(transactionId, userId);
      
      if (result.success) {
        await refreshTransactions();
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

 const refreshTransactions = async (filters?: {
  type?: 'INCOME' | 'EXPENSE';
  walletId?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  try {
    setIsLoading(true);
    const currentDate = new Date();

    const defaultStartDate = startOfMonth(currentDate);
    const defaultEndDate = endOfMonth(currentDate);

    const finalFilters = {
      limit: 50,
      startDate: filters?.startDate ?? defaultStartDate,
      endDate: filters?.endDate ?? defaultEndDate,
      ...filters,
    };
    console.log("Fetching transactions with filters:", finalFilters);
    console.log("User ID:", userId);
    

    const newTransactions = await getTransactions(userId, finalFilters);
    console.log("Fetched transactions:", newTransactions);
    
    setTransactions(newTransactions);
  } catch (error) {
    console.error("Error refreshing transactions:", error);
  } finally {
    setIsLoading(false);
  }
};


  return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <ArrowUpDown className="w-5 h-5 text-white" />
              </div>
              Transactions
            </h1>
            <p className="text-gray-600 mt-2">
              Track your income and expenses across all wallets
            </p>
          </div>
          <div className="flex gap-3">
            <AddTransactionDialog 
              wallets={wallets}
              onAddTransaction={handleAddTransaction}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <IconComponent className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <TransactionFilters 
          wallets={wallets}
          onFilterChange={refreshTransactions}
          isLoading={isLoading}
        />

        {/* Transactions Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Edit Transaction Dialog */}
        <EditTransactionDialog
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
          onUpdateTransaction={handleUpdateTransaction}
          isLoading={isLoading}
        />

        {/* Delete Transaction Dialog */}
        <DeleteTransactionDialog
          transaction={deletingTransaction}
          open={!!deletingTransaction}
          onOpenChange={(open) => !open && setDeletingTransaction(null)}
          onDeleteTransaction={handleConfirmDelete}
          isLoading={isLoading}
        />
      </div>
  );
}