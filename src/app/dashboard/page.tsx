// app/dashboard/page.tsx
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { getServerSession } from "~/lib/auth";
import DashboardData from "./dashboardData"; 

export default async function DashboardPage() {
  const { user } = await getServerSession();
  const userId = user?.id as string;
  
  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, <span className="capitalize">{user.name}!</span>
            </p>
          </div>
        </div>
        <DashboardData userId={userId} userName={user.name} />
      </div>
  );
}