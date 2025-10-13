import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { TransactionType } from '@prisma/client';
import { db } from '~/server/db';


export interface TransactionFilters {
  userId: string;
  type?: TransactionType | 'ALL';
  period?: 'month' | 'year' | 'custom';
  year?: number;
  month?: number;
  startDate?: Date;
  endDate?: Date;
}

export async function getFilteredTransactions(filters: TransactionFilters) {
  const {
    userId,
    type,
    period = 'month',
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
    startDate,
    endDate
  } = filters;

  let dateFilter: { gte?: Date; lte?: Date } = {};

  if (period === 'custom' && startDate && endDate) {
    dateFilter = {
      gte: startDate,
      lte: endDate
    };
  } else if (period === 'year') {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));
    dateFilter = {
      gte: yearStart,
      lte: yearEnd
    };
  } else if (period === 'month') {
    const monthStart = startOfMonth(new Date(year, month - 1, 1));
    const monthEnd = endOfMonth(new Date(year, month - 1, 1));
    dateFilter = {
      gte: monthStart,
      lte: monthEnd
    };
  }

  //  type filter
  const typeFilter = type && type !== 'ALL' ? { type } : {};

  try {
    const transactions = await db.transaction.findMany({
      where: {
        userId,
        date: dateFilter,
        ...typeFilter
      },
      include: {
        wallet: {
          select: {
            name: true,
            currency: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function getTransactionSummary(filters: TransactionFilters) {
  const transactions = await getFilteredTransactions(filters);
  
  const summary = {
    totalIncome: 0,
    totalExpense: 0,
    totalTransfer: 0,
    totalAdjustment: 0,
    netAmount: 0,
    transactionCount: transactions.length
  };

  transactions.forEach(transaction => {
    const amount = Number(transaction.amount);
    switch (transaction.type) {
      case 'INCOME':
        summary.totalIncome += amount;
        break;
      case 'EXPENSE':
        summary.totalExpense += amount;
        break;
      case 'TRANSFER':
        summary.totalTransfer += amount;
        break;
      case 'ADJUSMENT':
        summary.totalAdjustment += amount;
        break;
    }
  });

  summary.netAmount = summary.totalIncome - summary.totalExpense;

  return summary;
}

export async function getUserWallets(userId: string) {
  try {
    const wallets = await db.wallet.findMany({
      where: {
        userId
      },
      select: {
        id: true,
        name: true,
        currency: true,
        balance: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return wallets;
  } catch (error) {
    console.error('Error fetching wallets:', error);
    return [];
  }
}