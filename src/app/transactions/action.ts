'use server'
import { db } from "~/server/db";

import type { TransactionType } from "@prisma/client";
import { getYearMonth } from "~/services/WalletService";

const ensureMonthlyBalance = async (prismaTx: any, userId: string, walletId: string, year: number, month: number) => {

    try {
        const userWalletByMonth = { userId, walletId, year, month } as any;

        const existingBalacne = await prismaTx.monthlyBalance.findUnique({
            where: {
                monthly_balance_per_wallet: userWalletByMonth
            },
        });

        if (existingBalacne) return { data: existingBalacne, success: true };

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

        return {
            success: true,
            data: newBalance
        };
    } catch (error: any) {
        console.log('Error creating/fetching monthly balance:', error);
        throw new Error('Error creating/fetching monthly balance:', error)
    }
}

const getTransactions = async (userId: string, filters?: {
    type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    walletId?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    limit?: number;
    skip?: number;
}) => {
    console.log('startDate:', filters?.startDate
        , 'endDate:', filters?.endDate, 'userId:', userId, 'filters:', filters
    );
    try {
        const where: any = { userId };

        if (filters?.type) {
            where.type = filters.type;
        }

        if (filters?.walletId) {
            where.walletId = filters.walletId;
        }

        if (filters?.startDate || filters?.endDate) {
            where.date = {};
            if (filters.startDate) {
                where.date.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.date.lte = new Date(filters.endDate);
            }
        }

        const transactions = await db.transaction.findMany({
            where,
            include: {
                wallet: {
                    select: {
                        name: true,
                        type: true
                    }
                }
            },
            orderBy: { date: 'desc' },
            take: filters?.limit,
            skip: filters?.skip
        });
        if (!transactions || transactions.length === 0) {
            return [];
        }

        return transactions.map(transaction => ({
            ...transaction,
            amount: transaction.amount.toString(),
            date: transaction.date.toISOString(),
        }));
    } catch (error) {
        console.log('Error fetching transactions:', error);
        throw new Error('Error fetching transactions');
    }
};

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
        console.log('monthlyBalance:', monthlyBalance);

        const initialTransaction = await dbTx.transaction.create({
            data: {
                userId: data.userId,
                walletId: data.walletId,
                type: data.type,
                amount: transactionAmount,
                title: data.title ?? "Transaction",
                description: data.description ?? "",
                date: transactionDate,
            } as any
        })
        console.log('initialTransaction:', initialTransaction);


        if (data.type == 'INCOME') {
            await dbTx.monthlyBalance.update({
                where: { id: monthlyBalance.data.id },
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
                where: { id: monthlyBalance.data.id },
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

        return {
            success: true,
            data: initialTransaction,
            message: "Transaction created successfully"
        };
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
                where: { id: oldMonthlyBalance.data.id },
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
                where: { id: oldMonthlyBalance.data.id },
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

        if (oldType === 'INCOME') {
            await dbTx.monthlyBalance.update({
                where: { id: newMonthlyBalance.data.id },
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
                where: { id: newMonthlyBalance.data.id },
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

        const updatedTransaction = await dbTx.transaction.update({
            where: { id: data.id },
            data: {
                amount: newTransactionAmount,
                title: data.title,
                description: data.description,
                date: transactionDate
            }
        });

        const transactionData = {
            ...updatedTransaction,
            amount: updatedTransaction.amount.toString(),
            date: updatedTransaction.date.toISOString(),
            createdAt: updatedTransaction.createdAt.toISOString(),
            updatedAt: updatedTransaction.updatedAt.toISOString(),
        }

        return {
            success: true,
            data: transactionData,
            message: "Transaction update successfully"
        };
    });
};

const deleteTransaction = async (transactionId: string, userId: string) => {
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
        } else if (type === "TRANSFER") {
            // For transfer transactions, we need to handle both sender and receiver
            // This is a simplified approach - in a real app you might want to link transfer pairs
            await dbTx.monthlyBalance.update({
                where: {
                    monthly_balance_per_wallet: {
                        userId,
                        walletId,
                        year,
                        month
                    }
                },
                data: { 
                    totalIncome: { decrement: amount as any }, 
                    closingBalance: { decrement: amount as any } 
                },
            });
            await dbTx.wallet.update({ 
                where: { id: walletId }, 
                data: { balance: { decrement: amount as any } } 
            });
        } else {
            throw new Error("Adjustment deletion not supported here");
        }

        await dbTx.transaction.delete({ where: { id: transactionId } });

        return {
            success: true,
            message: 'Transaction deleted successfully',
        }

    })
}

const transferBetweenWallets = async (data: {
    userId: string;
    senderWalletId: string;
    recieverWalletId: string;
    amount: string | number;
    title: string,
    description: string,
    date?: string | Date;
}) => {
    const date = data.date ? new Date(data.date) : new Date();
    const transferAmount = data.amount.toString();
    const { year, month } = getYearMonth(date);

    const wallets = await db.wallet.findMany({
        where: {
            id: {
                in: [data.senderWalletId, data.recieverWalletId] as any
            }
        }
    })

    if (wallets.length !== 2) {
        throw new Error("One or both wallets not found.");
    }

    const [senderWallet, receiverWallet] = wallets;

    if (!senderWallet || !receiverWallet) {
        throw new Error("One or both wallets not found.");
    }

    if (senderWallet.userId !== data.userId || receiverWallet.userId !== data.userId) {
        throw new Error("Unauthorized access to one or both wallets.");
    }

    // Check if sender has sufficient balance
    if (parseFloat(senderWallet.balance.toString()) < parseFloat(transferAmount)) {
        throw new Error("Insufficient balance in sender wallet.");
    }

    return db.$transaction(async (dbTx) => {
        // Ensure monthly balances exist for both wallets
        const senderMonthlyBalance = await ensureMonthlyBalance(
            dbTx,
            data.userId,
            data.senderWalletId,
            year,
            month
        );

        const receiverMonthlyBalance = await ensureMonthlyBalance(
            dbTx,
            data.userId,
            data.recieverWalletId,
            year,
            month
        );

        // Create transfer transaction for sender (EXPENSE)
        const senderTransaction = await dbTx.transaction.create({
            data: {
                userId: data.userId,
                walletId: data.senderWalletId,
                type: "TRANSFER",
                amount: transferAmount,
                title: `Transfer to ${receiverWallet.name}`,
                description: data.description || `Transfer to ${receiverWallet.name}`,
                date: date,
            } as any
        });

        // Create transfer transaction for receiver (INCOME)
        const receiverTransaction = await dbTx.transaction.create({
            data: {
                userId: data.userId,
                walletId: data.recieverWalletId,
                type: "TRANSFER",
                amount: transferAmount,
                title: `Transfer from ${senderWallet.name}`,
                description: data.description || `Transfer from ${senderWallet.name}`,
                date: date,
            } as any
        });

        // Update sender wallet balance and monthly stats
        await dbTx.wallet.update({
            where: { id: data.senderWalletId },
            data: { balance: { decrement: transferAmount as any } }
        });

        await dbTx.monthlyBalance.update({
            where: { id: senderMonthlyBalance.data.id },
            data: {
                totalExpense: { increment: transferAmount as any },
                closingBalance: { decrement: transferAmount as any }
            }
        });

        // Update receiver wallet balance and monthly stats
        await dbTx.wallet.update({
            where: { id: data.recieverWalletId },
            data: { balance: { increment: transferAmount as any } }
        });

        await dbTx.monthlyBalance.update({
            where: { id: receiverMonthlyBalance.data.id },
            data: {
                totalIncome: { increment: transferAmount as any },
                closingBalance: { increment: transferAmount as any }
            }
        });

        return {
            success: true,
            senderTransaction,
            receiverTransaction,
            message: 'Transfer completed successfully'
        };
    });
}


export {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    transferBetweenWallets
}