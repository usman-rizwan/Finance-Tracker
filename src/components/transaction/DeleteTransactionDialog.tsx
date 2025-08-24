import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { formatCurrency } from "~/lib/utils";

interface DeleteTransactionDialogProps {
  transaction: {
    id: string;
    title: string;
    amount: string;
    type: 'INCOME' | 'EXPENSE';
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteTransaction?: (transactionId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function DeleteTransactionDialog({ 
  transaction, 
  open, 
  onOpenChange, 
  onDeleteTransaction,
  isLoading = false
}: DeleteTransactionDialogProps) {
  const handleDelete = async () => {
    if (!onDeleteTransaction || !transaction) return;
    
    try {
      await onDeleteTransaction(transaction.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-left">Delete Transaction</DialogTitle>
              <DialogDescription className="text-left">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this transaction?
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Title:</span>
              <span className="text-sm">{transaction.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Amount:</span>
              <span className={`text-sm font-semibold ${
                transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Type:</span>
              <span className="text-sm">{transaction.type}</span>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Warning:</strong> Deleting this transaction will update your wallet balance 
              and monthly totals accordingly.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Transaction'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}