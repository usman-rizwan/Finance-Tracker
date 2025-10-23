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
            <TransactionsData userId={user.id} />
        </div>
    );
}