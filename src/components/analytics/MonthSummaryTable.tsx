"use client";

import { useCallback, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { formatCurrency } from "~/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { htmlTemplate } from "~/template/emailTemplate";
import { generatePdfReport } from "~/app/analytics/action";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { Download, EyeIcon, FileDigitIcon, FileIcon, MoreVertical } from "lucide-react";
import { useAuth } from "~/contexts/AuthContext";

type MonthlyBalance = {
  id: string;
  year: number;
  month: number;
  openingBalance: any;
  totalIncome: any;
  totalExpense: any;
  closingBalance: any;
};

type Row = MonthlyBalance & { totalForMonth: number; label: string };

export default function MonthSummaryTable({ userName, monthlyBalances }: { userName: string; monthlyBalances: MonthlyBalance[] }) {
  const router = useRouter();
  const { user } = useAuth();
  console.log('user',user);
  

  const rows: Row[] = useMemo(() => monthlyBalances.map((m) => {
    const totalForMonth = Number(m.totalIncome ?? 0) - Number(m.totalExpense ?? 0);
    const date = new Date(m.year, m.month - 1, 1);
    const label = date.toLocaleString("en-US", { month: "long", year: "numeric" });
    return { ...m, totalForMonth, label };
  }), [monthlyBalances]);



  const downloadPdf = useCallback(async (row: Row) => {
    try {
      console.log('row', row);
      const data = { ...row ,...user}
      const genertaeHtml = htmlTemplate(data)
      const formData = new FormData();
      formData.append("html", genertaeHtml);
      formData.append("fileName", `${row.year}-${row.month}-summary`);

      const result = await generatePdfReport(formData);

      if (!result.success) {
        throw new Error(result.error || "Failed to generate PDF");
      }

      const binaryString = atob(result.pdf);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (e) {
      toast.error("Failed to download PDF");
    }
  }, [userName]);



  const viewDetails = useCallback((row: Row) => {
    const params = new URLSearchParams({ month: String(row.month), year: String(row.year) });
    router.push(`/activity?${params.toString()}`);
  }, [router]);

  // const downloadAllCsv = useCallback(() => {
  //   const header = [
  //     "Month",
  //     "Total Income",
  //     "Total Expense",
  //     "Opening Balance",
  //     "Closing Balance",
  //     "Net",
  //   ];

  //   const body = rows.map((r) => [
  //     r.label,
  //     String(r.totalIncome),
  //     String(r.totalExpense),
  //     String(r.openingBalance),
  //     String(r.closingBalance),
  //     String(r.totalForMonth),
  //   ]);

  //   const csv = [header, ...body].map((line) => line.join(",")).join("\n");
  //   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "analytics-report.csv";
  //   document.body.appendChild(a);
  //   a.click();
  //   a.remove();
  //   URL.revokeObjectURL(url);
  // }, [rows]);

  // const downloadAllPdf = useCallback(async () => {
  //   try {
  //     const tableRows = rows.map((r) => `
  //       <tr>
  //         <td style="text-align:left">${r.label}</td>
  //         <td>${formatCurrency(r.totalIncome)}</td>
  //         <td>${formatCurrency(r.totalExpense)}</td>
  //         <td>${formatCurrency(r.openingBalance)}</td>
  //         <td>${formatCurrency(r.closingBalance)}</td>
  //         <td>${formatCurrency(r.totalForMonth)}</td>
  //       </tr>
  //     `).join("");

  //     const html = `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><style>body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; padding:24px;} table{width:100%; border-collapse:collapse;} th,td{padding:8px; border-bottom:1px solid #eee; text-align:right;} th:first-child, td:first-child{text-align:left;} h1{font-size:20px; margin-bottom:12px;}</style></head><body><h1>${userName} - Analytics Report</h1><table><thead><tr><th>Month</th><th>Total Income</th><th>Total Expense</th><th>Opening Balance</th><th>Closing Balance</th><th>Net</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`;

  //     const response = await fetch("/api/reports/pdf", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ html, fileName: "analytics-report" }),
  //     });

  //     if (response.headers.get("Content-Type") !== "application/pdf") {
  //       throw new Error("Could not generate PDF.");
  //     }

  //     const pdfArrayBuffer = await response.arrayBuffer();
  //     const blob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = "analytics-report.pdf";
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     URL.revokeObjectURL(url);
  //   } catch (e) {
  //     toast.error("Failed to download PDF");
  //   }
  // }, [rows, userName]);

  return (
    <div className="overflow-x-auto">


      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Month</TableHead>
            <TableHead className="text-right">Total Income</TableHead>
            <TableHead className="text-right">Total Expense</TableHead>
            <TableHead className="text-right">Opening Balance</TableHead>
            <TableHead className="text-right">Closing Balance</TableHead>
            <TableHead className="text-right">Net</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            return (
              <TableRow key={row.id} >
                <TableCell>{row.label}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.totalIncome)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.totalExpense)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.openingBalance)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.closingBalance)}</TableCell>
                <TableCell
                  className={`text-right ${row.totalForMonth >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                >
                  {formatCurrency(row.totalForMonth)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open row actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => viewDetails(row)}>
                        <EyeIcon className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadPdf(row)}>
                        <Download className="h-4 w-4" />
                        Download PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
