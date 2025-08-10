'use client'
import "~/styles/globals.css";
import { Geist } from "next/font/google";
import { usePathname } from "next/navigation";
import { AuthProvider } from "~/contexts/AuthContext";
import DashboardLayout from "~/components/layout/DashboardLayout";

const geist = Geist({
  subsets: ["latin"],
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';
  const isLandingPage = pathname === '/';
  
  if (isAuthPage || isLandingPage) {
    return <>{children}</>;
  }
  
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}