'use server'
import { db } from "~/server/db";

import type { TransactionType } from "@prisma/client";
import { startOfMonth, subMonths } from "date-fns";
import { calculatePercentageChange } from "~/lib/utils";

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
        console.log('Creating wallet with data:', data);

        const initialBalance = data.initialBalance ?? 0
        const wallet = await db.wallet.create({
            data: {
                name: data.name,
                type: data.type,
                currency: data.currency,
                balance: initialBalance,
                initialBalance: data.initialBalance,
                userId,
            }
        });

        return {
            success: true,
            message: 'Wallet created successfully',
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
            orderBy: { createdAt: "desc" }
        });
        return wallets.map(wallet => ({
            ...wallet,
            balance: wallet.balance.toString(),
        }));
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
            success: true,
            message: "Wallet deleted successfully"
        };
    });
}

const getMonthlyStats = async (userId: string) => {
    const currentDate = new Date();
    const currentMonth = startOfMonth(currentDate);
    const perviousMonth = startOfMonth(subMonths(currentDate, 1));

    const previousMonthNumber = perviousMonth.getMonth() + 1;
    const previousYear = perviousMonth.getFullYear();

    const currentMonthStats = await db.transaction.groupBy({
        by: ["type"],
        where: {
            userId,
            date: { gte: currentMonth }
        },
        _sum: {
            amount: true
        }
    });

    const perviousMonthStats = await db.transaction.groupBy({
        by: ["type"],
        where: {
            userId,
            date: { gte: perviousMonth, lt: currentMonth }
        },
        _sum: {
            amount: true
        }
    });


    const income = currentMonthStats?.find(stat => stat.type === 'INCOME')?._sum.amount || 0;
    const expense = currentMonthStats?.find(stat => stat.type === 'EXPENSE')?._sum.amount || 0;
    const savings = income - expense;

    // Compute previous month stats
    const previousIncome = perviousMonthStats?.find(stat => stat.type === 'INCOME')?._sum.amount || 0;
    const previousExpense = perviousMonthStats?.find(stat => stat.type === 'EXPENSE')?._sum.amount || 0;
    const savingsPrevious = previousIncome - previousExpense;

    const totalBalanceCurrent = savings;
    const totalBalancePrevious = savingsPrevious;



    return {
        totalIncome: income,
        totalExpense: expense,
        savings,
        totalBalanceCurrent,
        totalBalanceChangePercent: calculatePercentageChange(totalBalancePrevious, totalBalanceCurrent),
        totalIncomeChangePercent: calculatePercentageChange(previousIncome, income),
        totalExpenseChangePercent: calculatePercentageChange(previousExpense, expense),
        savingsChangePercent: calculatePercentageChange(savingsPrevious, savings)
    };
};

const getOverallMonthlySummary = async (userId: string, year: number, month: number) => {
    const balances = await db.monthlyBalance.findMany({
        where: { userId, year, month }
    });

    const summary = balances.reduce(
        (acc, balance) => {
            acc.opening += balance.openingBalance.toNumber();
            acc.totalIncome += balance.totalIncome.toNumber();
            acc.totalExpense += balance.totalExpense.toNumber();
            acc.closing += balance.closingBalance.toNumber();
            return acc;
        },
        {
            opening: 0,
            totalIncome: 0,
            totalExpense: 0,
            closing: 0
        }
    );

    return {
        year,
        month,
        summary: {
            opening: +summary.opening.toFixed(2),
            totalIncome: +summary.totalIncome.toFixed(2),
            totalExpense: +summary.totalExpense.toFixed(2),
            closing: +summary.closing.toFixed(2)
        }
    };
};






const transferMoney = async (data: {
    userId: string;
    senderWalletId: string;
    receiverWalletId: string;
    amount: string | number;
    title: string;
    description: string;
    date?: string | Date;
}) => {
    try {
        // Import the transfer function from transactions
        const { transferBetweenWallets } = await import('../transactions/action');

        const result = await transferBetweenWallets({
            userId: data.userId,
            senderWalletId: data.senderWalletId,
            recieverWalletId: data.receiverWalletId,
            amount: data.amount,
            title: data.title,
            description: data.description,
            date: data.date
        });

        return result;
    } catch (error) {
        console.error('Error transferring money:', error);
        throw new Error(error instanceof Error ? error.message : 'Error transferring money');
    }
};

export {
    createPrimaryWallet,
    createWallet,
    getWallets,
    updateWallet,
    deleteWallet,
    getMonthlyStats,
    getOverallMonthlySummary,
    transferMoney
}

