import React from "react";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { getServerSession } from "~/lib/auth";
import { db } from "~/server/db";
import { createPrimaryWallet } from "./action";
import WalletsDashboard from "./WalletDashboard";

export default async function WalletPage() {
    const { user } = await getServerSession();


    

    let wallets = await db.wallet.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    });

    // Create primary wallet if none exists
    if (wallets.length === 0) {
        await createPrimaryWallet(user.id);
        wallets = await db.wallet.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });
    }

    return (
        <ProtectedRoute>
            <WalletsDashboard wallets={wallets} user={user}/>
        </ProtectedRoute>
    );
}