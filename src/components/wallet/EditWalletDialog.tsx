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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Wallet, CreditCard, Banknote, DollarSign, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { updateWalletSchema, type UpdateWalletFormData } from "~/lib/validation-schemas";

interface EditWalletDialogProps {
  wallet: {
    id: string;
    name: string;
    type: string;
    currency: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateWallet?: (walletId: string, data: UpdateWalletFormData) => Promise<void>;
}

const walletTypes = [
  {
    value: 'cash',
    label: 'Cash Wallet',
    icon: Banknote,
    description: 'Physical cash and petty cash'
  },
  {
    value: 'card',
    label: 'Card Account',
    icon: CreditCard,
    description: 'Credit/Debit cards'
  },
  {
    value: 'bank',
    label: 'Bank Account',
    icon: DollarSign,
    description: 'Savings and checking accounts'
  },
  {
    value: 'digital',
    label: 'Digital Wallet',
    icon: Wallet,
    description: 'PayPal, Venmo, etc.'
  }
];

const currencies = [
    { value: 'PKR', label: 'PKR (RS)', symbol: 'RS' },
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
];

export default function EditWalletDialog({ 
  wallet, 
  open, 
  onOpenChange, 
  onUpdateWallet 
}: EditWalletDialogProps) {
  const [selectedType, setSelectedType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateWalletFormData>({
    resolver: zodResolver(updateWalletSchema),
    defaultValues: {
      name: '',
      type: undefined,
      currency: 'USD'
    }
  });

  useEffect(() => {
    if (wallet && open) {
      form.reset({
        name: wallet.name,
        type: wallet.type as any,
        currency: wallet.currency || 'USD'
      });
      setSelectedType(wallet.type);
    }
  }, [wallet, open, form]);

  const handleSubmit = async (data: UpdateWalletFormData) => {
    if (!onUpdateWallet || !wallet) return;
    
    setIsSubmitting(true);
    try {
      await onUpdateWallet(wallet.id, data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating wallet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    form.setValue('type', type as any);
  };

  if (!wallet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md pointer-events-auto">
        <DialogHeader>
          <DialogTitle>Edit Wallet</DialogTitle>
          <DialogDescription>
            Update your wallet information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Wallet Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Wallet Type
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3">
                      {walletTypes.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleTypeSelect(type.value)}
                            className={cn(
                              "flex flex-col items-center p-4 rounded-lg border-2 transition-all hover:shadow-md",
                              selectedType === type.value
                                ? "border-purple-600 bg-purple-50"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <IconComponent className={cn(
                              "w-6 h-6 mb-2",
                              selectedType === type.value ? "text-purple-600" : "text-gray-500"
                            )} />
                            <span className={cn(
                              "text-sm font-medium",
                              selectedType === type.value ? "text-purple-900" : "text-gray-700"
                            )}>
                              {type.label}
                            </span>
                            <span className="text-xs text-gray-500 text-center mt-1">
                              {type.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Wallet Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., My Credit Card, Savings Account"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currency */}
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Wallet'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}