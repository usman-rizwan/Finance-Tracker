'use client'
import "../styles/globals.css";
import { Geist, Poppins } from "next/font/google";
import { usePathname } from "next/navigation";
import { AuthProvider } from "~/contexts/AuthContext";
import DashboardLayout from "~/components/layout/DashboardLayout";
import { Toaster } from "~/components/ui/sonner"

const geist = Geist({
  subsets: ["latin"],
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();


  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';
  const isLandingPage = pathname === '/';

  if (isAuthPage || isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div suppressContentEditableWarning suppressHydrationWarning className=" !pointer-events-auto">
      <DashboardLayout >
        {children}
      </DashboardLayout>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}