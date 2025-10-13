'use client';
import React from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
import { ArrowRightLeft } from "lucide-react";
import { cn } from "~/lib/utils";
import numberToWord from "number-to-words";
import { type TransferFormData } from "~/lib/validation-schemas";

interface Wallet {
  id: string;
  name: string;
  type: string;
  currency: string | null;
  balance: string;
}

interface TransferFormProps {
  formData: TransferFormData;
  handleInputChange: (field: keyof TransferFormData, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleClose: () => void;
  errors: Record<string, string>;
  isSubmitting: boolean;
  selectedSenderWallet?: Wallet;
  selectedReceiverWallet?: Wallet;
  wallets: Wallet[];
  availableWallets: Wallet[];
}

export default function TransferForm({
  formData,
  handleInputChange,
  handleSubmit,
  handleClose,
  errors,
  isSubmitting,
  selectedSenderWallet,
  selectedReceiverWallet,
  wallets,
  availableWallets
}: TransferFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {/* From Wallet */}
        <div className="space-y-2">
          <Label htmlFor="senderWalletId">From Wallet</Label>
          <Select
            value={formData.senderWalletId}
            onValueChange={(value) => handleInputChange("senderWalletId", value)}
          >
            <SelectTrigger className={cn("w-full", errors.senderWalletId && "border-red-500")}>
              <SelectValue placeholder="Select sender wallet" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate whitespace-nowrap">{wallet.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {parseFloat(wallet.balance).toFixed(2)} {wallet.currency || "USD"}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.senderWalletId && (
            <p className="text-sm text-red-500">{errors.senderWalletId}</p>
          )}
        </div>

        {/* To Wallet */}
        <div className="space-y-2">
          <Label htmlFor="receiverWalletId">To Wallet</Label>
          <Select
            value={formData.receiverWalletId}
            onValueChange={(value) => handleInputChange("receiverWalletId", value)}
          >
            <SelectTrigger className={cn("w-full", errors.receiverWalletId && "border-red-500")}>
              <SelectValue placeholder="Select receiver wallet" />
            </SelectTrigger>
            <SelectContent>
              {availableWallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{wallet.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {parseFloat(wallet.balance).toFixed(2)} {wallet.currency || "USD"}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.receiverWalletId && (
            <p className="text-sm text-red-500">{errors.receiverWalletId}</p>
          )}
        </div>
      </div>

      {/* Amount & Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className={cn(errors.amount && "border-red-500")}
            />
            {selectedSenderWallet && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {selectedSenderWallet.currency || "USD"}
              </span>
            )}
          </div>
          {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
          {selectedSenderWallet &&
            formData.amount &&
            parseFloat(formData.amount) > parseFloat(selectedSenderWallet.balance) && (
              <p className="text-sm text-red-500">Amount exceeds available balance</p>
            )}
        </div>

        <div className="space-y-2">
          <Label>Transfer Date</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            className={cn(errors.date && "border-red-500")}
          />
          {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g., Transfer to Savings"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className={cn(errors.title && "border-red-500")}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Add a note about this transfer..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className={cn(errors.description && "border-red-500")}
          rows={2}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      {/* Transfer Summary */}
      {formData.senderWalletId &&
        formData.receiverWalletId &&
        formData.amount && (
          <div className="bg-gray-50 rounded-md p-3 text-sm space-y-1">
            <h4 className="font-medium text-gray-800">Transfer Summary</h4>
            <div className="flex justify-between">
              <span className="text-gray-600">From:</span>
              <span>{selectedSenderWallet?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To:</span>
              <span>{selectedReceiverWallet?.name}</span>
            </div>
            <div className="flex justify-between items-center my-2">
              <span className="text-gray-600">Amount:</span>
              <div className="flex flex-col items-end">
                <span className="font-medium">
                  {parseFloat(formData.amount).toFixed(2)}{" "}
                  {selectedSenderWallet?.currency || "USD"}
                </span>
                <span className="text-sm text-gray-500 capitalize italic mt-1 text-right break-words max-w-[200px]">
                  ({numberToWord.toWords(parseFloat(formData.amount))} only)
                </span>
              </div>
            </div>
          </div>
        )}

      {/* Footer Buttons */}
      <DialogFooter className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !formData.senderWalletId ||
            !formData.receiverWalletId ||
            !formData.amount
          }
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Transferring...
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Transfer Money
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
