'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import WalletCard from "~/components/wallet/WalletCard";
import AddWalletDialog from "~/components/wallet/AddWalletDialog";
import EditWalletDialog from "~/components/wallet/EditWalletDialog";
import DeleteWalletDialog from "~/components/wallet/DeleteWalletDialog";
import { Button } from "~/components/ui/button";
import {
  Wallet,
  Plus,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  PieChart,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import { createWallet, updateWallet, deleteWallet, transferMoney, getWallets } from "./action";
import type { CreateWalletFormData, UpdateWalletFormData, TransferFormData } from "~/lib/validation-schemas";
import { toast } from 'sonner';
import Link from 'next/link';
import TransferMoneyDialog from "~/components/wallet/TransferMoneyDialog";

interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: string;
  currency: string | null;
  balance: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  savings: number;

  totalIncomeChangePercent?: number;
  totalExpenseChangePercent?: number;
  savingsChangePercent?: number;
}

interface WalletsDashboardProps {
  wallets: Wallet[];
  user: User;
  stats: Stats;
}

export default function WalletsDashboard({ wallets, user, stats }: WalletsDashboardProps) {
  const [walletsData, setWalletsData] = useState(wallets);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<Wallet | null>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedWalletForTransfer, setSelectedWalletForTransfer] = useState<string | undefined>(undefined);
  const router = useRouter();

  const totalBalance = stats?.totalBalance ?? walletsData.reduce(
    (sum, wallet) => sum + parseFloat(wallet.balance),
    0
  );

  const formatChange = (percent?: number) => {
    if (percent === undefined || percent === null) return "";
    const rounded = Math.abs(percent).toFixed(1);
    const sign = percent > 0 ? "+" : percent < 0 ? "−" : "";
    return `${sign}${rounded}%`;
  };



  const WalletStats = [
    {
      label: "Total Balance",
      value: formatCurrency(totalBalance),
      change: formatChange(stats?.totalBalanceChangePercent),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: "bg-green-100"
    },
    {
      label: "Monthly Income",
      value: formatCurrency(stats?.totalIncome ?? 0),
      change: formatChange(stats?.totalIncomeChangePercent),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: "bg-blue-100"
    },
    {
      label: "Monthly Expenses",
      value: formatCurrency(stats?.totalExpense ?? 0),
      change: formatChange(stats?.totalExpenseChangePercent),
      icon: ArrowDownLeft,
      color: 'text-red-600',
      bgColor: "bg-red-100"
    },
    {
      label: "Savings",
      value: formatCurrency(stats?.savings ?? 0),
      change: formatChange(stats?.savingsChangePercent),
      icon: Wallet,
      color: 'text-purple-600',
      bgColor: "bg-purple-100"
    },
    {
      label: "Active Wallets",
      value: walletsData.length.toString(),
      change: walletsData.length > 1 ? `+${walletsData.length - 1}` : "0",
      icon: Wallet,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    }
  ];

  const handleAddWallet = async (walletData: CreateWalletFormData) => {
    try {
      const response = await createWallet(user.id, walletData);

      if (response?.success && response.wallet) {
        setWalletsData(prev => [response.wallet, ...prev]);
        toast.success("Wallet created successfully!");
      } else {
        toast.error("Failed to create wallet");
        console.error("Wallet creation failed:", response?.message || "Unknown error");
      }
    } catch (error) {
      toast.error("Error creating wallet");
      console.error("Error adding wallet:", error);
    }
  };

  const handleEditWallet = (walletId: string) => {
    const wallet = walletsData.find(w => w.id === walletId);
    if (wallet) {
      setEditingWallet(wallet);
    }
  };

  const handleUpdateWallet = async (walletId: string, data: UpdateWalletFormData) => {
    try {
      const response = await updateWallet({ id: walletId, userId: user.id, ...data });

      if (response?.success && response.wallet) {
        const updatedWallet = {
          ...response.wallet,
          balance: response.wallet.balance.toString(),
          createdAt: response.wallet.createdAt.toISOString(),
          updatedAt: response.wallet.updatedAt.toISOString(),
        };

        setWalletsData(prev =>
          prev.map(w => w.id === walletId ? updatedWallet : w)
        );

        setEditingWallet(null);
        toast.success("Wallet updated successfully!");
      }
    } catch (error) {
      toast.error("Error updating wallet");
      console.error("Error updating wallet:", error);
    }
  };

  const handleDeleteWallet = (walletId: string) => {
    const wallet = walletsData.find(w => w.id === walletId);
    if (wallet) {
      setDeletingWallet(wallet);
    }
  };

  const handleConfirmDelete = async (walletId: string) => {
    try {
      const response = await deleteWallet(walletId, user.id);
      if (response.success) {
        setWalletsData(prev => prev.filter(w => w.id !== walletId));
        router.refresh();
      } else {
        console.error("Delete failed:", response?.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error deleting wallet:", error);
    }
  };

  const handleTransferMoney = (walletId: string) => {
    setSelectedWalletForTransfer(walletId);
    setTransferDialogOpen(true);
  };

  const handleTransferSubmit = async (transferData: TransferFormData) => {
    try {
      const response = await transferMoney({
        userId: user.id,
        senderWalletId: transferData.senderWalletId,
        receiverWalletId: transferData.receiverWalletId,
        amount: transferData.amount,
        title: transferData.title,
        description: transferData.description ?? "",
        date: transferData.date
      });


      if (response?.success) {
        const updatedWallets = await getWallets(user.id);

        setWalletsData(updatedWallets);

        setTransferDialogOpen(false);
        setSelectedWalletForTransfer(undefined);

        toast.success("Money transferred successfully!");
      } else {
        toast.error("Failed to transfer money");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error transferring money");
      console.error("Transfer error:", error);
    }
  };

  return (
    <div className="space-y-8 !pointer-events-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            My Wallets
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your financial accounts and track balances across all your wallets
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
          <Link href="/transactions" className="flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            View Transactions
          </Link>
        </Button>

        <AddWalletDialog onAddWallet={handleAddWallet} />
      </div>
    </div>

      {/* Statistics Cards */ }
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {WalletStats.map((stat, index) => {
      const IconComponent = stat.icon;
      return (
        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <IconComponent className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`text-sm font-semibold ${stat?.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat?.change}
              </span>
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

  {/* Quick Actions */ }
  <Card className="border-0 shadow-lg cursor-pointer" >
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <PieChart className="w-5 h-5" />
        Quick Actions
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-16 flex flex-col gap-2 hover:bg-green-50 hover:border-green-300"
          onClick={() => setTransferDialogOpen(true)}
        >
          <ArrowUpRight className="w-5 h-5 text-green-600" />
          <span className="text-sm">Transfer Money</span>
        </Button>
        <Button
          variant="outline"
          className="h-16 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
        >
          <Activity className="w-5 h-5 text-blue-600" />
          <Link href="/activity" className="flex flex-col items-center">
            <span className="text-sm">View Analytics</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          className="h-16 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-300"
        >
          <Plus className="w-5 h-5 text-purple-600" />
          <Link href="/transactions" className="flex flex-col items-center"> <span className="text-sm">Add Transaction</span></Link>
        </Button>
      </div>
    </CardContent>
  </Card>

  {/* Wallets Grid */ }
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Wallets ({walletsData.length})
          </h2>
          <Button variant="outline" size="sm" disabled >
            <PieChart className="w-4 h-4 mr-2" />
            Portfolio View
          </Button>
        </div>

        {walletsData.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No wallets yet</h3>
              <p className="text-gray-600 text-center max-w-md mb-6">
                Get started by creating your first wallet to track your finances and manage your money effectively.
              </p>
              <AddWalletDialog onAddWallet={handleAddWallet} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {walletsData.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onEdit={handleEditWallet}
                onDelete={handleDeleteWallet}
                onTransfer={handleTransferMoney}
              />
            ))}
          </div>
        )}
      </div>

      <EditWalletDialog
        key={editingWallet?.id}
        wallet={editingWallet}
        open={!!editingWallet}
        onOpenChange={(open) => !open && setEditingWallet(null)}
        onUpdateWallet={handleUpdateWallet}
      />

      <DeleteWalletDialog
        wallet={deletingWallet}
        open={!!deletingWallet}
        onOpenChange={(open) => !open && setDeletingWallet(null)}
        onDeleteWallet={handleConfirmDelete}
      />

      <TransferMoneyDialog
        open={transferDialogOpen}
        onOpenChange={(open) => {
          setTransferDialogOpen(open);
          if (!open) {
            setSelectedWalletForTransfer(undefined);
          }
        }}
        onTransferMoney={handleTransferSubmit}
        wallets={walletsData}
        selectedWalletId={selectedWalletForTransfer}
      />
    </div >
  );
}
