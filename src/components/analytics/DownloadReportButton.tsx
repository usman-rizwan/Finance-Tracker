// "use client";
// import { useCallback, useState } from "react";
// import { Button } from "~/components/ui/button";
// import { toast } from "sonner";
// import { generatePdfReport } from "~/app/analytics/action";

// export default function DownloadReportButton({ targetContainerId }: { targetContainerId: string }) {
//   const [downloading, setDownloading] = useState(false);

//   const handleDownloadPdf = useCallback(async () => {
//     try {
//       setDownloading(true);
//       const container = document.getElementById(targetContainerId);
//       if (!container) {
//         toast.error("Report content not found.");
//         return;
//       }

//       const htmlContent = `<!doctype html><html><head><meta charset=\"utf-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" /><style>body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; padding:24px;} table{width:100%; border-collapse:collapse;} th,td{padding:8px; border-bottom:1px solid #eee; text-align:right;} th:first-child, td:first-child{text-align:left;} h1{font-size:20px; margin-bottom:12px;}</style></head><body><h1>Analytics Report</h1>${container.innerHTML}</body></html>`;

//       const formData = new FormData();
//       formData.append("html", htmlContent);
//       formData.append("fileName", "analytics-report");

//       const result = await generatePdfReport(formData);

//       if (!result.success) {
//         throw new Error(result.error || "Failed to generate PDF");
//       }

//       // Convert base64 back to blob and download
//       const binaryString = atob(result.pdf);
//       const bytes = new Uint8Array(binaryString.length);
//       for (let i = 0; i < binaryString.length; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//       }
//       const blob = new Blob([bytes], { type: result.mimeType });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = result.fileName;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//       toast.success("Report downloaded.");
//     } catch (err: unknown) {
//       toast.error("Failed to generate PDF. Please try again.");
//     } finally {
//       setDownloading(false);
//     }
//   }, [targetContainerId]);

//   const handleDownloadCsv = useCallback(() => {
//     const container = document.getElementById(targetContainerId);
//     if (!container) {
//       toast.error("Report content not found.");
//       return;
//     }
//     // Fallback: just download the HTML table as CSV-ish text by stripping tags.
//     const table = container.querySelector("table");
//     if (!table) {
//       toast.error("No table content to export.");
//       return;
//     }
//     const rows: string[][] = [];
//     table.querySelectorAll("tr").forEach((tr) => {
//       const cells = Array.from(tr.querySelectorAll("th,td")).map((c) => c.textContent?.trim() ?? "");
//       rows.push(cells);
//     });
//     const csv = rows.map((r) => r.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "analytics-report.csv";
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     URL.revokeObjectURL(url);
//     toast.success("Excel (CSV) downloaded.");
//   }, [targetContainerId]);

//   return (
//     <div className="flex gap-2">
//       <Button onClick={handleDownloadCsv} variant="outline">Download Excel</Button>
//       <Button onClick={handleDownloadPdf} disabled={downloading} variant="default">
//         {downloading ? "Preparing…" : "Download PDF"}
//       </Button>
//     </div>
//   );
// }


