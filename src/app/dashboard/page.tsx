import { ProtectedRoute } from "~/components/auth/ProtectedRoute";

import DashboardContent from "~/components/layout/DashboardContent"
export default function DashboardPage() {
  return (
    <ProtectedRoute>


      <DashboardContent />
    </ProtectedRoute>
  );
}