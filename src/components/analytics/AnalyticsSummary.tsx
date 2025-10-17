"use client";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import {
  Banknote,
  TrendingUp,
  TrendingDown,
  HandCoins,
  Wallet,
  Icon as LucideIcon,
} from "lucide-react";

type Props = {
  totalIncome: string;
  totalExpense: string;
  openingBalance: string;
  closingBalance: string;
};

const iconMap = {
  "Opening Balance": Wallet,
  "Total Income": TrendingUp,
  "Total Expense": TrendingDown,
  "Savings": HandCoins,
  "Closing Balance": Banknote,
};

export default function AnalyticsSummary({
  totalIncome,
  totalExpense,
  openingBalance,
  closingBalance,
}: Props) {
  const savings = (Number(totalIncome) - Number(totalExpense)).toString();
  const items = [
    { label: "Opening Balance", value: openingBalance },
    { label: "Total Income", value: totalIncome },
    { label: "Total Expense", value: totalExpense },
    { label: "Savings", value: savings },
    { label: "Closing Balance", value: closingBalance },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => {
        const Icon = iconMap[item.label];
        return (
          <Card
            key={item.label}
            className="border-0 shadow-lg hover:shadow-xl transition-shadow"
          >
            <CardHeader className="pb-3 flex items-center ">
              <Icon className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="pt-0 ">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(item.value)}
              </p>
              <p className="text-sm text-gray-600 mt-1">{item.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
