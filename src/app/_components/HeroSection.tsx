"use client";

import { useAuth } from "@/features/auth";
import { ButtonLink } from "@/features/shared";

export function HeroSection() {
  const { user, loading } = useAuth();

  if (!loading && user) return null;

  return (
    <div className="bg-primary/10 py-12">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">コード譜を、もっと手軽に。</h1>
        <p className="mt-3 text-muted">
          ログイン不要で今すぐ作成できます。アカウントを作ると保存・共有も可能。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/scores/new">楽譜を作成する（ログイン不要）</ButtonLink>
          <ButtonLink href="/login" variant="secondary">
            ログインして始める
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
