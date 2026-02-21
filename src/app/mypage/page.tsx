"use client";

import { AuthGuard, ProfileEditor } from "@/features/auth";
import { MyScoreList } from "@/features/scores/components/MyScoreList";

function MyPageContent() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-4">
      <h1 className="mb-4 text-3xl font-bold">マイページ</h1>

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
