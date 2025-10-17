"use server";

import { z } from "zod";

const RequestSchema = z.object({
  html: z.string().min(10),
  fileName: z.string().optional(),
});

export async function generatePdfReport(formData: FormData) {
  try {
    const html = formData.get("html") as string;
    const fileName = formData.get("fileName") as string;

    const { html: validatedHtml, fileName: validatedFileName } = RequestSchema.parse({
      html,
      fileName,
    });

    const response = await fetch("https://next-html2pdf.vercel.app/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: validatedHtml }),
    });

    if (response.headers.get("Content-Type") !== "application/pdf") {
      const data = await response.json().catch(() => ({ message: "Unknown error" }));
      console.error("PDF generation error:", data);
      throw new Error("Could not generate PDF.");
    }

    const pdfArrayBuffer = await response.arrayBuffer();
    const pdf = Buffer.from(pdfArrayBuffer);
    const name = (validatedFileName ?? "report") + ".pdf";

    return {
      success: true,
      pdf: pdf.toString('base64'),
      fileName: name,
      mimeType: 'application/pdf'
    };
  } catch (err: unknown) {
    console.error("PDF generation error", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred"
    };
  }
}
