import React, { useState } from 'react';
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Filter, Calendar, Wallet, TrendingUp, TrendingDown, X } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

interface TransactionFiltersProps {
  wallets: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  onFilterChange: (filters: {
    type?: 'INCOME' | 'EXPENSE';
    walletId?: string;
    startDate?: Date;
    endDate?: Date;
  }) => void;
  isLoading?: boolean;
}

export default function TransactionFilters({ 
  wallets, 
  onFilterChange,
  isLoading = false
}: TransactionFiltersProps) {
  const [selectedType, setSelectedType] = useState<'INCOME' | 'EXPENSE' | ''>('');
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const periodOptions = [
    { value: 'current', label: 'Current Month' },
    { value: 'last', label: 'Last Month' },
    { value: 'last3', label: 'Last 3 Months' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const getDateRange = (period: string) => {
    const now = new Date();
    
    switch (period) {
      case 'current':
        return {
          startDate: startOfMonth(now),
          endDate: endOfMonth(now)
        };
     case 'last':
  const lastMonth = subMonths(now, 1);

  const start = startOfMonth(new Date(lastMonth));
  const end = endOfMonth(new Date(lastMonth));

  console.log('lastMonth:', lastMonth);
  console.log('startOfMonth(lastMonth):', start);
  console.log('endOfMonth(lastMonth):', end);

  return {
    startDate: start,
    endDate: end
  };

      case 'last3':
        const threeMonthsAgo = subMonths(now, 3);
        return {
          startDate: startOfMonth(threeMonthsAgo),
          endDate: endOfMonth(now)
        };
      case 'custom':
        return {
          startDate: customStartDate ? new Date(customStartDate) : undefined,
          endDate: customEndDate ? new Date(customEndDate) : undefined
        };
      default:
        return {};
    }
  };

  const handleApplyFilters = () => {
    const dateRange = getDateRange(selectedPeriod);
    console.log('dateRange', dateRange);
    
    onFilterChange({
      type: selectedType as 'INCOME' | 'EXPENSE' || undefined,
      walletId: selectedWallet === 'all' ? undefined : selectedWallet,
      ...dateRange
    });
  };

  const handleClearFilters = () => {
    setSelectedType('');
    setSelectedWallet('all');
    setSelectedPeriod('current');
    setCustomStartDate('');
    setCustomEndDate('');
    
    const currentMonth = getDateRange('current');
    onFilterChange(currentMonth);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Transaction Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Transaction Type</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={selectedType === '' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType('')}
                className="text-xs"
              >
                All
              </Button>
              <Button
                variant={selectedType === 'INCOME' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType('INCOME')}
                className="text-xs bg-green-600 hover:bg-green-700 text-white"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Income
              </Button>
              <Button
                variant={selectedType === 'EXPENSE' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType('EXPENSE')}
                className="text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                <TrendingDown className="w-3 h-3 mr-1" />
                Expense
              </Button>
            </div>
          </div>

          {/* Wallet Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Wallet</label>
            <Select value={selectedWallet} onValueChange={setSelectedWallet}>
              <SelectTrigger>
                <SelectValue placeholder="All wallets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All wallets</SelectItem> {/* ✅ Fixed here */}
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    <div className="flex items-center">
                      <Wallet className="w-4 h-4 mr-2" />
                      <span>{wallet.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({wallet.type.toUpperCase()})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Period</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Actions</label>
            <div className="flex gap-2">
              <Button 
                onClick={handleApplyFilters}
                disabled={isLoading}
                className="flex-1"
              >
                Apply
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Custom Date Range */}
        {selectedPeriod === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Current Filter Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 capitalize">
            <strong>Current filters:</strong> {' '}
            {selectedType ? `${selectedType.toLowerCase()} transactions` : 'all transactions'} {' '}
            {selectedWallet !== 'all' && wallets.find(w => w.id === selectedWallet) && 
              `from ${wallets.find(w => w.id === selectedWallet)?.name}`} {' '}
            for {periodOptions.find(p => p.value === selectedPeriod)?.label.toLowerCase()}
            {selectedPeriod === 'custom' && customStartDate && customEndDate && 
              ` (${format(new Date(customStartDate), 'MMM dd')} - ${format(new Date(customEndDate), 'MMM dd')})`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
