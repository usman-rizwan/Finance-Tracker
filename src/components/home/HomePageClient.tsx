"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";

export function HomePageClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // This component doesn't render anything visible
  // It only handles the authentication redirect logic
  return null;
}
