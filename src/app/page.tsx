"use client";

import { useAuth, useSignOut } from "@/features/auth";
import { ScoreList } from "@/features/scores";
import { Button, ButtonLink } from "@/features/shared";

export default function Home() {
  const { user } = useAuth();
  const { signOut } = useSignOut();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chord Maker</h1>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <ButtonLink href="/mypage" variant="secondary">
                マイページ
              </ButtonLink>
              <ButtonLink href="/scores/new">新規作成</ButtonLink>
              <Button variant="secondary" onClick={signOut}>
                ログアウト
              </Button>
            </>
          ) : (
            <ButtonLink href="/login" variant="secondary">
              ログイン
            </ButtonLink>
          )}
        </nav>
      </header>

      <ScoreList />
    </div>
  );
}
