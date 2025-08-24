'use server'
import { db } from "~/server/db";

import type { TransactionType } from "@prisma/client";

const getYearMonth = (date: Date) => {
    return { year: date.getFullYear(), month: date.getMonth() + 1 }
}






const getMonthlySummary = async (userId: string, year: number, month: number, walletId?: string) => {
    const query: any = { userId, year, month };
    if (walletId) query.wallet = walletId;

    const balances = await db.monthlyBalance.findMany({ where: query, include: { wallet: true } });

    const summary = balances.reduce(
        (acc, balance) => {
            acc.opening = acc.opening + Number(balance.openingBalance.toString());
            acc.totalIncome = acc.totalIncome + Number(balance.totalIncome.toString());
            acc.totalExpense = acc.totalExpense + Number(balance.totalExpense.toString());
            acc.closing = acc.closing + Number(balance.closingBalance.toString());
            return acc;
        },
        { opening: 0, totalIncome: 0, totalExpense: 0, closing: 0 }
    );

    return {
        year,
        month,
        summary,

    }
}


export {
    getYearMonth,
    getMonthlySummary
};

