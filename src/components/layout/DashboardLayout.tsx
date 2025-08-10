"use client";
import type { ReactNode } from "react";
import Sidebar from "~/components/layout/Sidebar";
import Navbar from "~/components/layout/Navbar";

interface DashboardLayoutProps {
  children: ReactNode;
  useSidebar?: boolean;
}

export default function DashboardLayout({ 
  children, 
  useSidebar = false 
}: DashboardLayoutProps) {
  if (useSidebar) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}