"use client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { formatCurrency } from "~/lib/utils";

type MonthlyBalance = {
  id: string;
  year: number;
  month: number;
  openingBalance: any;
  totalIncome: any;
  totalExpense: any;
  closingBalance: any;
};

export default function AnalyticsDetails({ monthlyBalances, userName }: { monthlyBalances: MonthlyBalance[]; userName: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Report for {userName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Opening</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Expense</TableHead>
              <TableHead className="text-right">Closing</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyBalances.map((m) => {
              const date = new Date(m.year, m.month - 1, 1);
              const label = date.toLocaleString("en-US", { month: "short", year: "numeric" });
              return (
                <TableRow key={m.id}>
                  <TableCell>{label}</TableCell>
                  <TableCell className="text-right">{formatCurrency(m.openingBalance)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(m.totalIncome)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(m.totalExpense)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(m.closingBalance)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


