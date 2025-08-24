import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "~/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { updateTransactionSchema, type UpdateTransactionFormData } from "~/lib/validation-schemas";

interface EditTransactionDialogProps {
  transaction: {
    id: string;
    amount: string;
    title: string;
    description: string | null;
    date: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTransaction?: (transactionId: string, data: UpdateTransactionFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function EditTransactionDialog({ 
  transaction, 
  open, 
  onOpenChange, 
  onUpdateTransaction,
  isLoading = false
}: EditTransactionDialogProps) {
  const form = useForm<UpdateTransactionFormData>({
    resolver: zodResolver(updateTransactionSchema),
    defaultValues: {
      amount: '',
      title: '',
      description: '',
      date: ''
    }
  });

  useEffect(() => {
    if (transaction && open) {
      const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
      form.reset({
        amount: transaction.amount,
        title: transaction.title,
        description: transaction.description || '',
        date: transactionDate
      });
    }
  }, [transaction, open, form]);

  const handleSubmit = async (data: UpdateTransactionFormData) => {
    if (!onUpdateTransaction || !transaction) return;
    
    try {
      await onUpdateTransaction(transaction.id, data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update the transaction details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Amount and Date */}
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
                    Updating...
                  </>
                ) : (
                  'Update Transaction'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}