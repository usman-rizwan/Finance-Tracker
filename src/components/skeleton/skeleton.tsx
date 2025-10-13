import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

function FiltersSkeleton() {
    return (
        <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
                <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-32" />
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-11 w-full" />
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                        ))}
                    </div>
                    <div className="pt-6 border-t border-slate-200">
                        <div className="flex gap-3">
                            <Skeleton className="h-11 w-32" />
                            <Skeleton className="h-11 w-24" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function SummarySkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-8 w-32" />
                            </div>
                            <Skeleton className="h-12 w-12 rounded-2xl" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function TransactionTableSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-6 py-2">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-[280px]" />
                            <Skeleton className="h-4 w-[220px]" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export {
    FiltersSkeleton,
    SummarySkeleton,
    TransactionTableSkeleton
}