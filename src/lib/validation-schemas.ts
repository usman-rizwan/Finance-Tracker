import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const createWalletSchema = z.object({
  name: z.string().min(1, "Wallet name is required").max(50, "Name must be less than 50 characters"),
  type: z.enum(["cash", "card", "bank", "digital"], {
    required_error: "Please select a wallet type",
  }),
  currency: z.string().min(3, "Currency is required").max(3, "Currency must be 3 characters"),
  initialBalance: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Initial balance must be a valid positive number",
  }),
});

export const updateWalletSchema = z.object({
  name: z.string().min(1, "Wallet name is required").max(50, "Name must be less than 50 characters"),
  type: z.enum(["cash", "card", "bank", "digital"], {
    required_error: "Please select a wallet type",
  }),
  currency: z.string().min(3, "Currency is required").max(3, "Currency must be 3 characters"),
});

export const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"], {
    required_error: "Please select transaction type",
  }),
  walletId: z.string().min(1, "Please select a wallet"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a valid positive number",
  }),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  date: z.string().optional(),
});

export const updateTransactionSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a valid positive number",
  }),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  date: z.string().optional(),
});

export const transferSchema = z.object({
  senderWalletId: z.string().min(1, "Please select sender wallet"),
  receiverWalletId: z.string().min(1, "Please select receiver wallet"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a valid positive number",
  }),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  date: z.string().optional(),
}).refine((data) => data.senderWalletId !== data.receiverWalletId, {
  message: "Sender and receiver wallets must be different",
  path: ["receiverWalletId"],
});


export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type CreateWalletFormData = z.infer<typeof createWalletSchema>;
export type UpdateWalletFormData = z.infer<typeof updateWalletSchema>;
export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionFormData = z.infer<typeof updateTransactionSchema>;
export type TransferFormData = z.infer<typeof transferSchema>;
