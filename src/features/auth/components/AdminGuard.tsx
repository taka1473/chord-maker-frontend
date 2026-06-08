"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useProfile } from "@/features/auth/hooks/useProfile";

type Props = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;
  return <AdminRoleCheck>{children}</AdminRoleCheck>;
}

function AdminRoleCheck({ children }: Props) {
  const { profile, loading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile?.role !== "admin") {
      router.replace("/");
    }
  }, [profile, loading, router]);

  if (loading || profile?.role !== "admin") return null;
  return <>{children}</>;
}
