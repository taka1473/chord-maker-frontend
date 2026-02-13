"use client";

import Link from "next/link";
import { AuthGuard, ProfileEditor } from "@/features/auth";
import { MyScoreList } from "@/features/scores/components/MyScoreList";

function MyPageContent() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-foreground/60 transition-colors hover:text-foreground"
          >
            ← トップ
          </Link>
          <h1 className="text-2xl font-bold">マイページ</h1>
        </div>
        <Link
          href="/scores/new"
          className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          新規作成
        </Link>
      </header>

      <div className="mb-8">
        <ProfileEditor />
      </div>

      <MyScoreList />
    </div>
  );
}

export default function MyPage() {
  return (
    <AuthGuard>
      <MyPageContent />
    </AuthGuard>
  );
}
