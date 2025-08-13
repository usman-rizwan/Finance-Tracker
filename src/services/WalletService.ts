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