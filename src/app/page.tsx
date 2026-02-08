"use client";

import Link from "next/link";
import { useAuth, useSignOut } from "@/features/auth";
import { ScoreList } from "@/features/scores";

export default function Home() {
  const { user } = useAuth();
  const { signOut } = useSignOut();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chord Maker</h1>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/scores/new"
                className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                新規作成
              </Link>
              <button
                onClick={signOut}
                className="rounded border border-foreground/20 px-4 py-2 text-sm transition-colors hover:bg-foreground/5"
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded border border-foreground/20 px-4 py-2 text-sm transition-colors hover:bg-foreground/5"
            >
              ログイン
            </Link>
          )}
        </nav>
      </header>

      <ScoreList />
    </div>
  );
}
