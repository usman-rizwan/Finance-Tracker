import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { 
  Wallet, 
  CreditCard, 
  Banknote, 
  DollarSign,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "~/lib/utils";
import { cn } from "~/lib/utils";

interface WalletCardProps {
  wallet: {
    id: string;
    name: string;
    type: string;
    currency: string | null;
    balance: string;
    createdAt: string;
    updatedAt: string;
  };
  onEdit?: (walletId: string) => void;
  onDelete?: (walletId: string) => void;
  onTransfer?: (walletId: string) => void;
}

const WalletTypeIcons = {
  cash: Banknote,
  card: CreditCard,
  bank: DollarSign,
  digital: Wallet,
} as const;

const WalletTypeColors = {
  cash: "from-green-500 to-emerald-600",
  card: "from-blue-500 to-indigo-600", 
  bank: "from-purple-500 to-violet-600",
  digital: "from-orange-500 to-red-500",
} as const;

const WalletTypeBadgeColors = {
  cash: "bg-green-100 text-green-800 border-green-200",
  card: "bg-blue-100 text-blue-800 border-blue-200",
  bank: "bg-purple-100 text-purple-800 border-purple-200", 
  digital: "bg-orange-100 text-orange-800 border-orange-200",
} as const;

export default function WalletCard({ 
  wallet, 
  onEdit, 
  onDelete, 
  onTransfer 
}: WalletCardProps) {
  const [isBalanceVisible, setIsBalanceVisible] = React.useState(true);
  
  const walletType = wallet.type as keyof typeof WalletTypeIcons;
  const IconComponent = WalletTypeIcons[walletType] || Wallet;
  const gradientColor = WalletTypeColors[walletType] || WalletTypeColors.digital;
  const badgeColor = WalletTypeBadgeColors[walletType] || WalletTypeBadgeColors.digital;
  
  const balance = parseFloat(wallet.balance);
  const currency = wallet.currency || 'USD';
  
  // Mock data for demo - in real app this would come from transactions
  const monthlyChange = 125.50;
  const isPositiveChange = monthlyChange >= 0;

  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 select-none  cursor-pointer" >
      {/* Gradient Background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-90",
        gradientColor
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg font-semibold">
                  {wallet.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs border", badgeColor)}
                  >
                    {wallet.type.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-white hover:bg-white/20 cursor-pointer"
                >
                  <MoreVertical className="h-4 w-4 text-white " />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(wallet.id)}>
                  Edit Wallet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTransfer?.(wallet.id)}>
                  Transfer Money
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => onDelete?.(wallet.id)}
                >
                  Delete Wallet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          {/* Balance */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Current Balance</p>
                <div className="flex items-center space-x-2 mt-1">
                  {isBalanceVisible ? (
                    <h3 className="text-2xl font-bold text-white">
                      {formatCurrency(balance, currency)}
                    </h3>
                  ) : (
                    <h3 className="text-2xl font-bold text-white">••••••</h3>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                    className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    {isBalanceVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Monthly Change */}
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isPositiveChange 
                    ? "bg-green-100/20 text-green-100" 
                    : "bg-red-100/20 text-red-100"
                )}>
                  {isPositiveChange ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-white/80 text-xs">This Month</p>
                  <p className={cn(
                    "text-sm font-semibold",
                    isPositiveChange ? "text-green-100" : "text-red-100"
                  )}>
                    {isPositiveChange ? "+" : ""}{formatCurrency(monthlyChange, currency)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-white/80 text-xs">Created</p>
                <p className="text-white/90 text-sm">
                  {formatDate(wallet.createdAt)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4">
              <Button 
                size="sm" 
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30"
                variant="outline"
              >
                <ArrowUpRight className="w-4 h-4 mr-1" />
                Send
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30"
                variant="outline"
              >
                <ArrowDownRight className="w-4 h-4 mr-1" />
                Receive
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}