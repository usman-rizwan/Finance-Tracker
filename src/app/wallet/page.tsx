import React from "react";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { getServerSession } from "~/lib/auth";
import { db } from "~/server/db";
import { createPrimaryWallet, getMonthlyStats } from "./action";
import WalletsDashboard from "./WalletDashboard";

export default async function WalletPage() {
  const { user } = await getServerSession();

  let wallets = await db.wallet.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Create primary wallet if none exists
  if (wallets.length === 0) {
    await createPrimaryWallet(user.id);
    wallets = await db.wallet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  }

  const walletData = wallets.map((wallet) => ({
    ...wallet,
    balance: wallet.balance.toString(),
    createdAt: wallet.createdAt.toISOString(),
    updatedAt: wallet.updatedAt.toISOString(),
  }));

  const userData = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  const stats = await getMonthlyStats(user.id);
  return (
    <ProtectedRoute>
      <WalletsDashboard wallets={walletData} user={userData} stats={stats} />
    </ProtectedRoute>
  );
}
