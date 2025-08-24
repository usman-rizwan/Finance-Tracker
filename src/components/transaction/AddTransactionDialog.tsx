import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Plus, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { createTransactionSchema, type CreateTransactionFormData } from "~/lib/validation-schemas";

interface AddTransactionDialogProps {
  wallets: Array<{
    id: string;
    name: string;
    type: string;
    currency: string | null;
  }>;
  onAddTransaction?: (transactionData: CreateTransactionFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function AddTransactionDialog({ 
  wallets, 
  onAddTransaction,
  isLoading = false
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  const form = useForm<CreateTransactionFormData>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      walletId: '',
      amount: '',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    }
  });

  const handleSubmit = async (data: CreateTransactionFormData) => {
    if (!onAddTransaction) return;
    
    try {
      await onAddTransaction(data);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleTypeChange = (type: 'INCOME' | 'EXPENSE') => {
    setSelectedType(type);
    form.setValue('type', type);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Record a new income or expense transaction.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Transaction Type Toggle */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleTypeChange('INCOME')}
                        className={cn(
                          "flex items-center justify-center p-4 rounded-lg border-2 transition-all",
                          selectedType === 'INCOME'
                            ? "border-green-600 bg-green-50 text-green-700"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <TrendingUp className={cn(
                          "w-5 h-5 mr-2",
                          selectedType === 'INCOME' ? "text-green-600" : "text-gray-500"
                        )} />
                        <span className="font-medium">Income</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTypeChange('EXPENSE')}
                        className={cn(
                          "flex items-center justify-center p-4 rounded-lg border-2 transition-all",
                          selectedType === 'EXPENSE'
                            ? "border-red-600 bg-red-50 text-red-700"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <TrendingDown className={cn(
                          "w-5 h-5 mr-2",
                          selectedType === 'EXPENSE' ? "text-red-600" : "text-gray-500"
                        )} />
                        <span className="font-medium">Expense</span>
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Wallet Selection */}
            <FormField
              control={form.control}
              name="walletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a wallet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          <div className="flex items-center">
                            <span className="font-medium">{wallet.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({wallet.type.toUpperCase()})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount and Title */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Grocery shopping, Salary payment"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional details..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Transaction'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}