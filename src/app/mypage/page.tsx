"use client";

import { AuthGuard, ProfileEditor } from "@/features/auth";
import { MyScoreList } from "@/features/scores/components/MyScoreList";
import { ButtonLink } from "@/features/shared";

function MyPageContent() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ButtonLink href="/" variant="ghost">
            ← トップ
          </ButtonLink>
          <h1 className="text-2xl font-bold">マイページ</h1>
        </div>
        <ButtonLink href="/scores/new">新規作成</ButtonLink>
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
