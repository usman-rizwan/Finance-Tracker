import { ProtectedRoute } from "~/components/auth/ProtectedRoute";

import DashboardContent from "~/components/layout/DashboardContent"
export default async  function DashboardPage() {


  
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}