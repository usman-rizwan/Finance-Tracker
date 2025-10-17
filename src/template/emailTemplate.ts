interface FinancialReport {
  id: string;
  year: number;
  month: number;
  openingBalance: string;
  totalIncome: string;
  totalExpense: string;
  closingBalance: string;
  totalForMonth: number;
  label: string;
  email: string;
  name: string;
}


export const htmlTemplate = (data: FinancialReport) => {
  const today = new Date();

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const formattedDate = today.toLocaleDateString("en-US", options);


  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Monthly Invoice Report</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none;
      }
      /* Prevent page breaks inside */
      .no-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      /* Fix container height for A4 */
      .a4-container {
        height: 297mm; /* A4 height */
        box-sizing: border-box;
      }
    }

    @page {
      size: A4;
      margin: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .invoice-shadow {
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    .gradient-bg {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .text-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  </style>
</head>
<body class="bg-gray-50">
  <!-- A4 Container -->
  <div
    class="max-w-[210mm] mx-auto bg-white shadow-2xl my-8 print:my-0 print:shadow-none a4-container no-break"
  >
    <!-- Main Content Area with reduced padding -->
    <div class="p-8 print:p-8 no-break">
      <!-- Header Section -->
      <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200 no-break">
        <!-- Left side: Logo + Title + Subtitle -->
        <div>
          <div class="flex items-center gap-4 mb-1">
            <div
              class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 leading-tight">Finance Tracker</h1>
              <p class="text-sm text-gray-500 mt-1">Professional Financial Services</p>
            </div>
          </div>
        </div>

        <!-- Right side: Date info -->
        <div class="text-right">
          <p class="text-sm text-gray-500 mb-1">Invoice Date</p>
          <p class="text-xl font-semibold text-gray-900 leading-tight">${formattedDate}</p>
          <p class="text-sm text-gray-600 mt-2">Period: ${data.label}</p>
        </div>
      </div>

      <!-- Invoice Title -->
      <div class="mb-6 no-break">
        <h2 class="text-xl font-bold text-gray-900 mb-1">Monthly Financial Report</h2>
        <div class="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
      </div>

      <!-- User Information Card -->
      <div
        class="bg-gradient-to-br p-4 from-gray-100 to-white rounded-xl p-2 mb-4 invoice-shadow no-break"
      >
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Account Details
        </h3>
        <div class="grid grid-cols-2 gap-6">
          <div>
            <p class="text-xs text-gray-500 mb-1">Account Holder</p>
            <p class="text-base font-semibold text-gray-900 capitalize">${data.name}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">User ID</p>
            <p class="text-xs font-mono font-semibold text-gray-900">${data.id}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">Email Address</p>
            <p class="text-sm text-gray-700">${data.email}</p>
          </div>
        </div>
      </div>

      <!-- Financial Summary Table -->
      <div class="mb-8 no-break">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
        <div class="overflow-hidden rounded-lg border border-gray-300">
          <table class="w-full table-fixed">
            <thead class="bg-gray-100">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
                >
                  Description
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide"
                >
                  Amount (USD)
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">Opening Balance</td>
                <td class="px-6 py-4 text-sm text-right font-mono text-gray-900"> ${Number(data.openingBalance).toLocaleString()}</td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors">
                <td
                  class="px-6 py-4 text-sm font-medium text-gray-900 flex justify-between items-center"
                >
                  Total Income
                  <span class="text-green-600 font-semibold text-xs">+</span>
                </td>
                <td
                  class="px-6 py-4 text-sm text-right font-mono font-semibold text-green-700"
                >
               ${Number(data.totalIncome).toLocaleString()}
                </td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors">
                <td
                  class="px-6 py-4 text-sm font-medium text-gray-900 flex justify-between items-center"
                >
                  Total Expenses
                  <span class="text-red-600 font-semibold text-xs">−</span>
                </td>
                <td
                  class="px-6 py-4 text-sm text-right font-mono font-semibold text-red-700"
                >
                  ${Number(data.totalExpense).toLocaleString()}
                </td>
              </tr>
              <tr class="border-t border-gray-300 bg-gray-50">
                <td class="px-6 py-5 text-base font-bold text-gray-900">Closing Balance</td>
                <td class="px-6 py-5 text-right">
                  <span class="text-xl font-bold font-mono text-gray-900"> ${Number(data.closingBalance).toLocaleString()}</span>
                </td>
              </tr>
              <tr class="bg-gray-50">
                <td class="px-6 py-4 text-sm font-semibold text-gray-900">Net Profit/Loss</td>
                <td class="px-6 py-4 text-right">
                  <span
                    class="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700"
                  >
                   ${Number(data.totalForMonth).toLocaleString()}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Additional Notes Section (Optional) -->
      <div
        class="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-5 mb-8 no-break"
      >
        <div class="flex items-start">
          <svg
            class="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
          <div>
            <p class="text-xs font-semibold text-amber-800 mb-1">Important Note</p>
            <p class="text-sm text-amber-700">
              All transactions have been verified and processed. For detailed
              transaction history, please log in to your account dashboard.
            </p>
          </div>
        </div>
      </div>

      <!-- Footer Section -->
      <div class="border-t-2 border-gray-200 pt-6 no-break">
        <div class="text-center">
          <p class="text-xs text-gray-500 mb-2">
            Thank you for choosing Finance Tracker for your financial management
            needs.
          </p>
          <p class="text-xs text-gray-400">
            This is an automatically generated invoice. For any discrepancies,
            please contact our support team within 7 days.
          </p>
          <p class="text-xs text-gray-400 mt-3">
            © 2025 Finance Tracker. All rights reserved. | Privacy Policy | Terms
            of Service
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`
};
