"use client";

import { useAuth, useSignOut } from "@/features/auth";
import { Button, ButtonLink } from "./Button";

export function AppHeader() {
  const { user } = useAuth();
  const { signOut } = useSignOut();

  return (
    <header className="border-b border-border px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <ButtonLink href="/" variant="ghost" className="text-lg font-bold text-foreground">
          Chord Maker
        </ButtonLink>
        <nav className="flex items-center gap-1.5 sm:gap-3">
          {user ? (
            <>
              <ButtonLink href="/mypage" variant="secondary" size="sm">
                マイページ
              </ButtonLink>
              <ButtonLink href="/scores/new" size="sm">
                新規作成
              </ButtonLink>
              <Button variant="secondary" size="sm" onClick={signOut}>
                ログアウト
              </Button>
            </>
          ) : (
            <ButtonLink href="/login" variant="secondary" size="sm">
              ログイン
            </ButtonLink>
          )}
        </nav>
      </div>
    </header>
  );
}
