'use server'
import { db } from "~/server/db";

import type { TransactionType } from "@prisma/client";

const getYearMonth = (date: Date) => {
    return { year: date.getFullYear(), month: date.getMonth() + 1 }
}

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

const ensureMonthlyBalance = async (prismaTx: any, userId: string, walletId: string, year: number, month: number) => {

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

const createTransaction = async (data: {
    userId: string;
    walletId: string;
    type: TransactionType;
    amount: string | number;
    title: string;
    description: string;
    date?: string | Date;
}) => {
    const transactionDate = data.date ? new Date(data.date) : new Date();
    const transactionAmount = data.amount.toString();
    const { year, month } = getYearMonth(transactionDate);

    return db.$transaction(async (dbTx) => {
        const wallet = await dbTx.wallet.findUnique({
            where: { id: data.walletId }
        }
        );
        if (!wallet) throw new Error("Wallet not found");

        const monthlyBalance = await ensureMonthlyBalance(
            dbTx,
            data.userId,
            data.walletId,
            year,
            month
        )

        const openingBalance = monthlyBalance.closingBalance;

        const initialTransaction = await dbTx.transaction.create({
            data: {
                userId: data.userId,
                walletId: data.walletId,
                type: data.type,
                amount: transactionAmount,
                openingBalance,
                closingBalance: openingBalance, // Temporary, will be updated
                title: data.title ?? "Transaction",
                description: data.description ?? "",
                date: transactionDate,
            }
        })

        if (data.type == 'INCOME') {
            await dbTx.monthlyBalance.update({
                where: { id: monthlyBalance.id },
                data: {
                    totalIncome: { increment: transactionAmount as any },
                    closingBalance: { increment: transactionAmount as any }
                }
            })

            await dbTx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: transactionAmount as any } }
            })
        } else if (data.type == 'EXPENSE') {
            await dbTx.monthlyBalance.update({
                where: { id: monthlyBalance.id },
                data: {
                    totalExpense: { increment: transactionAmount as any },
                    closingBalance: { decrement: transactionAmount as any }
                }
            })

            await dbTx.wallet.update({
                where: {
                    id: wallet.id
                },
                data: {
                    balance: { decrement: transactionAmount as any }
                }
            })

        } else {
            throw new Error("Unsupported transaction type for createTransactionAtomic");
        }

        const updateMonthlyBalance = await dbTx.monthlyBalance.findUnique({ where: { id: monthlyBalance.id } });

        const updateTransaction = await dbTx.transaction.update({
            where: { id: initialTransaction.id },
            data: {
                closingBalance: updateMonthlyBalance?.closingBalance
            }
        })
        return updateTransaction;
    })
}

const updateTransaction = async (data: {
    id: string;
    userId: string;
    amount: string | number;
    title: string;
    description: string;
    date?: string | Date;
}) => {
    const transactionDate = data.date ? new Date(data.date) : new Date();
    const newTransactionAmount = data.amount.toString();
    const { year, month } = getYearMonth(transactionDate);

    return db.$transaction(async (dbTx) => {
        // Get the existing transaction
        const existingTransaction = await dbTx.transaction.findUnique({
            where: { id: data.id },
            include: { wallet: true }
        });

        if (!existingTransaction) {
            throw new Error("Transaction not found");
        }

        if (existingTransaction.userId !== data.userId) {
            throw new Error("Unauthorized to update this transaction");
        }

        // checck if only title and desxription updated 
        const checkIfDetailsChanged = newTransactionAmount === existingTransaction.amount.toString() &&
            new Date(transactionDate).getTime() === new Date(existingTransaction.date).getTime();

        if (checkIfDetailsChanged) {
            return dbTx.transaction.update({
                where: { id: data.id },
                data: {
                    title: data.title,
                    description: data.description
                }
            });
        }

        const wallet = await dbTx.wallet.findUnique({
            where: { id: existingTransaction.walletId }
        });

        if (!wallet) {
            throw new Error("Wallet not found");
        }

        // Get the old transaction details
        const oldAmount = existingTransaction.amount.toString();
        const oldType = existingTransaction.type;
        const oldDate = existingTransaction.date;
        const { year: oldYear, month: oldMonth } = getYearMonth(oldDate);

        const oldMonthlyBalance = await ensureMonthlyBalance(
            dbTx,
            data.userId,
            existingTransaction.walletId,
            oldYear,
            oldMonth
        );

        const newMonthlyBalance = await ensureMonthlyBalance(
            dbTx,
            data.userId,
            existingTransaction.walletId,
            year,
            month
        );

        // Reverse the old transaction's effect
        if (oldType === 'INCOME') {
            await dbTx.monthlyBalance.update({
                where: { id: oldMonthlyBalance.id },
                data: {
                    totalIncome: { decrement: oldAmount as any },
                    closingBalance: { decrement: oldAmount as any }
                }
            });

            await dbTx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: oldAmount as any } }
            });
        } else if (oldType === 'EXPENSE') {
            await dbTx.monthlyBalance.update({
                where: { id: oldMonthlyBalance.id },
                data: {
                    totalExpense: { decrement: oldAmount as any },
                    closingBalance: { increment: oldAmount as any }
                }
            });

            await dbTx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: oldAmount as any } }
            });
        }

        // Apply the new transaction's effect (same type, different amount/date)
        if (oldType === 'INCOME') {
            await dbTx.monthlyBalance.update({
                where: { id: newMonthlyBalance.id },
                data: {
                    totalIncome: { increment: newTransactionAmount as any },
                    closingBalance: { increment: newTransactionAmount as any }
                }
            });

            await dbTx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: newTransactionAmount as any } }
            });
        } else if (oldType === 'EXPENSE') {
            // Add expense to new monthly balance
            await dbTx.monthlyBalance.update({
                where: { id: newMonthlyBalance.id },
                data: {
                    totalExpense: { increment: newTransactionAmount as any },
                    closingBalance: { decrement: newTransactionAmount as any }
                }
            });

            await dbTx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: newTransactionAmount as any } }
            });
        }

        const updatedMonthlyBalance = await dbTx.monthlyBalance.findUnique({
            where: { id: newMonthlyBalance.id }
        });

        const updatedTransaction = await dbTx.transaction.update({
            where: { id: data.id },
            data: {
                amount: newTransactionAmount,
                title: data.title,
                description: data.description,
                date: transactionDate,
                closingBalance: updatedMonthlyBalance?.closingBalance
            }
        });

        return updatedTransaction;
    });
};

const deletTransaction = async (transactionId: string, userId: string) => {
    return db.$transaction(async (dbTx) => {
        const existingTransaction = await db.transaction.findUnique({
            where: { id: transactionId }
        })

        if (!existingTransaction) throw new Error("Transaction not found");
        if (existingTransaction.userId !== userId) throw new Error("Unauthorized");


        const { walletId, type, amount, date } = existingTransaction;
        const { year, month } = getYearMonth(new Date(date));


        //reverse the transaction(totals and wallet)

        if (type === 'INCOME') {
            await dbTx.monthlyBalance.update({
                where: {
                    monthly_balance_per_wallet: {
                        userId,
                        walletId,
                        year,
                        month
                    }
                },
                data: { totalIncome: { decrement: amount as any }, closingBalance: { decrement: amount as any } },

            })
            await dbTx.wallet.update({ where: { id: walletId }, data: { balance: { decrement: amount as any } } });
        } else if (type === "EXPENSE") {
            await dbTx.monthlyBalance.update({
                where: {
                    monthly_balance_per_wallet: {
                        userId,
                        walletId,
                        year,
                        month
                    }
                },
                data: { totalExpense: { decrement: amount as any }, closingBalance: { increment: amount as any } },
            });
            await dbTx.wallet.update({ where: { id: walletId }, data: { balance: { increment: amount as any } } });
        } else {
            throw new Error("Transfer/Adjustment deletion not supported here");
        }

        await dbTx.transaction.delete({ where: { id: transactionId } });

        return {
            ok: true
        }



    })
}

export {
    createPrimaryWallet,
    createWallet,
    createTransaction,
    updateTransaction,
    deleteTransaction
};

