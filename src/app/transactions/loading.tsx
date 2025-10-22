const TransactionsLoadingSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
        <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="p-6 space-y-4">
            <div className="flex justify-between h-4 bg-gray-300 rounded"></div>
            {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/12"></div>
                </div>
            ))}
        </div>
    </div>
);


export default function TransactionsLoading() {
  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
             <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
             <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
        
        <TransactionsLoadingSkeleton />
    </div>
  );
}