'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from "~/components/layout/DashboardLayout";
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
import { createWallet, updateWallet, deleteWallet } from "./action";
import type { CreateWalletFormData, UpdateWalletFormData } from "~/lib/validation-schemas";

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

interface WalletsDashboardProps {
  wallets: Wallet[];
  user: {};
}

export default function WalletsDashboard({ wallets, user }: WalletsDashboardProps) {
  const [walletsData, setWalletsData] = useState(wallets);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<Wallet | null>(null);
  const router = useRouter();

  // Calculate total balance across all wallets
  const totalBalance = walletsData.reduce(
    (sum, wallet) => sum + parseFloat(wallet.balance),
    0
  );

  // Mock data for statistics
  const stats = [
    {
      label: "Total Balance",
      value: formatCurrency(totalBalance),
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      label: "Monthly Income", 
      value: formatCurrency(3420),
      change: "+8.2%",
      icon: TrendingUp,
      color: "text-blue-600", 
      bgColor: "bg-blue-100"
    },
    {
      label: "Monthly Expenses",
      value: formatCurrency(2150),
      change: "-5.1%",
      icon: ArrowDownLeft,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      label: "Active Wallets",
      value: walletsData.length.toString(),
      change: walletsData.length > 1 ? `+${walletsData.length - 1}` : "0",
      icon: Wallet,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];
  const handleAddWallet = async (walletData: CreateWalletFormData) => {
    try {
      const response = await createWallet(user.id, walletData);
  
      if (response?.success && response.wallet) {
        setWalletsData(prev => [response.wallet, ...prev]);
        router.refresh();
      } else {
        console.error("Wallet creation failed:", response?.message || "Unknown error");
      }
    } catch (error) {
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
          setWalletsData(prev =>
            prev.map(w => w.id === walletId ? { ...w, ...response.wallet } : w)
          );
    
          router.refresh();
        } else {
          console.error("Update failed:", response?.message || "Unknown error");
        }
      } catch (error) {
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
      if (response.suucess) {
        setWalletsData(prev => prev.filter(w => w.id !== walletId));
        router.refresh();
      }else{
        console.error("Delete failed:", response?.message || "Unknown error");
      }
     
    } catch (error) {
      console.error("Error deleting wallet:", error);
    }
  };

  const handleTransferMoney = (walletId: string) => {
    console.log("Transfer money from wallet:", walletId);
    // Implement transfer functionality
  };

  return (
      <div className="space-y-8">
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
              <Activity className="w-4 h-4 mr-2" />
              View Transactions
            </Button>
            <AddWalletDialog onAddWallet={handleAddWallet} />
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
                    <span className={`text-sm font-semibold ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
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

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
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
              >
                <ArrowUpRight className="w-5 h-5 text-green-600" />
                <span className="text-sm">Transfer Money</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-sm">View Analytics</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-300"
              >
                <Plus className="w-5 h-5 text-purple-600" />
                <span className="text-sm">Add Transaction</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wallets Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Wallets ({walletsData.length})
            </h2>
            <Button variant="outline" size="sm">
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

        {/* Edit Wallet Dialog */}
        <EditWalletDialog
          wallet={editingWallet}
          open={!!editingWallet}
          onOpenChange={(open) => !open && setEditingWallet(null)}
          onUpdateWallet={handleUpdateWallet}
        />

        {/* Delete Wallet Dialog */}
        <DeleteWalletDialog
          wallet={deletingWallet}
          open={!!deletingWallet}
          onOpenChange={(open) => !open && setDeletingWallet(null)}
          onDeleteWallet={handleConfirmDelete}
        />
      </div>
  );
}