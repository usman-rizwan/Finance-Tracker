"use client";

type Transaction = {
  id: string;
  title: string;
  amount: any;
  type: string;
  date: string;
};

type Props = {
  totalBalance: string;
  income: string;
  expense: string;
  savings: string;
  transactions: Transaction[];
  userName: string;
  openingBalance?: string;
  closingBalance?: string;
};

export default function DashboardContent({
  totalBalance,
  income,
  expense,
  openingBalance,
  closingBalance,
  savings,
  transactions,
  userName,
}: Props) {
  console.log('userName', userName);
  return (
    
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, <span className="capitalize 
          
          ">{userName}!</span></p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Balance" amount={`${totalBalance}`} iconColor="green" />
        <StatCard title="Income" amount={`${income}`} iconColor="blue" />
        {openingBalance && <StatCard title="Opening Balance" amount={`${openingBalance}`} iconColor="orange" />}
        {closingBalance && <StatCard title="Closing Balance" amount={`${closingBalance}`} iconColor="yellow" />}
        <StatCard title="Expenses" amount={`${expense}`} iconColor="red" />
        <StatCard title="Savings" amount={`${savings}`} iconColor="purple" />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="p-6 space-y-4">
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-500">No recent transactions.</p>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "INCOME" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 text-gray-700"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{transaction.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-medium ${
                    transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.type === "INCOME" ? "+" : "-"}{parseFloat(transaction.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  amount,
  iconColor,
}: {
  title: string;
  amount: string;
  iconColor: string;
}) {
  const color = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    yellow: "bg-yellow-100 text-yellow-600",
  }[iconColor];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color}`}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 8c1.11 0 2.08.402 2.599 1"
            />
          </svg>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{amount}</p>
        </div>
      </div>
    </div>
  );
}
