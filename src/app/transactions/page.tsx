import { redirect } from "next/navigation";
import { getServerSession } from "~/lib/auth";
import TransactionsData from "./TransactionData";

export default async function TransactionsPage() {
    const session = await getServerSession();

    if (!session?.user) {
        redirect("/sign-in");
    }

    const user = session.user;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            
        
            <TransactionsData userId={user.id} />
        </div>
    );
}