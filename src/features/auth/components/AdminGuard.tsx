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
  const { profile, error, loading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !error && profile?.role !== "admin") {
      router.replace("/");
    }
  }, [profile, error, loading, router]);

  if (loading) return null;
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">
          権限の確認に失敗しました。再読み込みしてください。
        </p>
      </div>
    );
  }
  if (profile?.role !== "admin") return null;
  return <>{children}</>;
}
