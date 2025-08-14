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
            data: { ...data, userId, balance: initialBalance }
        })
        return wallet;
    } catch (error) {
        console.error('Error creating wallet->', error);
        throw new Error('Erro creating wallet')
    }
}

const ensureMonthlyBalance = async (prismaTx: typeof db, userId: string, walletId: string, year: number, month: number) => {

    try {
        const userWalletByMonth = { userId, walletId, year, month } as any;

        const existingBalacne = await prismaTx.monthlyBalance.findUnique({
            where: {
                monthly_balance_per_wallet: userWalletByMonth
            },
        });

        if (existingBalacne) return existingBalacne;

        const previousMonth = month === 1 ? 12 : month - 1;
        const previousYear = month === 1 ? year - 1 : year;

        // get previocus month balance
        const previousBalance = await prismaTx.monthlyBalance.findUnique({
            where: {
                monthly_balance_per_wallet: {
                    userId,
                    walletId,
                    year: previousYear,
                    month: previousMonth,
                },
            }
        })

        let openingBalance = '0';
        if (previousBalance) {
            openingBalance = previousBalance.closingBalance.toString();
        } else {
            const wallet = await prismaTx.wallet.findUnique({
                where: {
                    id: walletId
                }
            });

            if (wallet) openingBalance = wallet.balance.toString()
        }


        const newBalance = await prismaTx.monthlyBalance.create({
            data: {
                userId,
                walletId,
                year,
                month,
                openingBalance,
                totalIncome: "0",
                totalExpense: "0",
                closingBalance: openingBalance,
            },
        })
            
        return newBalance;
    } catch (error: any) {
        console.log('Error creating/fetching monthly balance:', error);
        throw new Error('Error creating/fetching monthly balance:', error)
    }
}