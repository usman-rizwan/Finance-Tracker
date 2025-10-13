'use client';
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ArrowRightLeft } from "lucide-react";
import { transferSchema, type TransferFormData } from "~/lib/validation-schemas";
import TransferForm from './TransferForm';

interface Wallet {
  id: string;
  name: string;
  type: string;
  currency: string | null;
  balance: string;
}

interface TransferMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransferMoney: (data: TransferFormData) => Promise<void>;
  wallets: Wallet[];
  selectedWalletId?: string;
}

export default function TransferMoneyDialog({
  open,
  onOpenChange,
  onTransferMoney,
  wallets,
  selectedWalletId
}: TransferMoneyDialogProps) {
  const [formData, setFormData] = useState<TransferFormData>({
    senderWalletId: selectedWalletId || '',
    receiverWalletId: '',
    amount: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  useEffect(() => {
  if (selectedWalletId) {
    setFormData(prev => ({
      ...prev,
      senderWalletId: selectedWalletId
    }));
  }
}, [selectedWalletId]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableWallets = wallets.filter(wallet => wallet.id !== formData.senderWalletId);

  const validateForm = (): boolean => {
    try {
      transferSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        if (err.path) {
          newErrors[err.path[0]] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onTransferMoney(formData);
      setFormData({
        senderWalletId: selectedWalletId || '',
        receiverWalletId: '',
        amount: '',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error('Transfer error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TransferFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    setFormData({
      senderWalletId: '',
      receiverWalletId: '',
      amount: '',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setErrors({});
    onOpenChange(false);
  };

  const selectedSenderWallet = wallets.find(w => w.id === formData.senderWalletId);
  const selectedReceiverWallet = wallets.find(w => w.id === formData.receiverWalletId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] p-4 space-y-4 overflow-y-auto custom-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-white" />
            </div>
            Transfer Money
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Transfer money between your wallets. This will create transfer transactions in both wallets.
          </DialogDescription>
        </DialogHeader>

        <TransferForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          handleClose={handleClose}
          errors={errors}
          isSubmitting={isSubmitting}
          selectedSenderWallet={selectedSenderWallet}
          selectedReceiverWallet={selectedReceiverWallet}
          wallets={wallets}
          availableWallets={availableWallets}
        />

      </DialogContent>
    </Dialog>
  );
}
