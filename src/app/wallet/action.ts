'use server'
import { db } from "~/server/db";

import type { TransactionType } from "@prisma/client";

const createPrimaryWallet = async (userId: string) => {
    try {
        const existingWallet = await db.wallet.findFirst({ where: { userId } });
        if (existingWallet) return existingWallet;
        const newWallet = await db.wallet.create({
            data: {
                userId,
                balance: 0,
                type: 'cash',
                name: 'Primary Wallet'
            }
        });

        return newWallet;
    } catch (error) {
        console.error(error);
        return error;
    }
}


const createWallet = async (userId: string, data: any) => {
    try {
        const initialBalance = data.initialBalance ?? 0
        const wallet = await db.wallet.create({
            data: {
                name: data.name,
                type: data.type,
                currency: data.currency,
                balance: initialBalance,
                userId,
            }
        });

        return {
            success:true,
            message:'Wallet created successfully',
            wallet
        }
        } catch (error) {
        console.error('Error creating wallet->', error);
        throw new Error('Erro creating wallet')
    }
}

const getWallets = async (userId: string) => {
    try {
        const wallets = await db.wallet.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' }
        });
        return wallets;
    } catch (error) {
        console.error('Error fetching wallets:', error);
        throw new Error('Error fetching wallets');
    }
}

const updateWallet = async (data: {
    id: string;
    userId: string;
    name?: string;
    type?: string;
    currency?: string;
}) => {
    try {
        // First verify the wallet belongs to the user
        const existingWallet = await db.wallet.findUnique({
            where: { id: data.id }
        });

        if (!existingWallet) {
            throw new Error("Wallet not found");
        }

        if (existingWallet.userId !== data.userId) {
            throw new Error("Unauthorized to update this wallet");
        }

        // Update the wallet
        const updatedWallet = await db.wallet.update({
            where: { id: data.id },
            data: {
                name: data.name,
                type: data.type,
                currency: data.currency,
            }
        });

        return {
            success: true,
            message: "Wallet updated successfully",
            wallet: updatedWallet
        }
    } catch (error) {
        console.error('Error updating wallet:', error);
        throw new Error('Error updating wallet');
    }
}

const deleteWallet = async (walletId: string, userId: string) => {
    return db.$transaction(async (dbTx) => {
        // First verify the wallet belongs to the user
        const wallet = await dbTx.wallet.findUnique({
            where: { id: walletId }
        });

        if (!wallet) {
            throw new Error("Wallet not found");
        }

        if (wallet.userId !== userId) {
            throw new Error("Unauthorized to delete this wallet");
        }

        // Check if this is the user's only wallet
        const userWallets = await dbTx.wallet.findMany({
            where: { userId }
        });

        if (userWallets.length <= 1) {
            throw new Error("Cannot delete the only wallet. At least one wallet must remain.");
        }

        // Check if wallet has any transactions
        const transactionCount = await dbTx.transaction.count({
            where: { walletId }
        });

        if (transactionCount > 0) {
            throw new Error("Cannot delete wallet with existing transactions. Please transfer or delete all transactions first.");
        }

        // Check if wallet has any monthly balances
        const monthlyBalanceCount = await dbTx.monthlyBalance.count({
            where: { walletId }
        });

        if (monthlyBalanceCount > 0) {
            throw new Error("Cannot delete wallet with existing monthly balances. Please transfer or delete all monthly balances first.");
        }

        // Delete the wallet
        await dbTx.wallet.delete({
            where: { id: walletId }
        });

        return {
            suucess: true,
            message: "Wallet deleted successfully"
        };
    });
}


export {
    createPrimaryWallet,
    createWallet,
    getWallets,
    updateWallet,
    deleteWallet
}

