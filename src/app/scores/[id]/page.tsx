"use client";

import { use } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth";
import { useWholeScore, ChordChart } from "@/features/scores";

export default function ScoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const { wholeScore, error, loading } = useWholeScore(id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-foreground/60 transition-colors hover:text-foreground"
      >
        &larr; スコア一覧に戻る
      </Link>

      {loading && (
        <p className="text-center text-foreground/60">読み込み中...</p>
      )}

      {error && <p className="text-center text-red-500">{error}</p>}

      {wholeScore && (
        <>
          <ChordChart wholeScore={wholeScore} />
          {user && (
            <div className="mt-6">
              <Link
                href={`/scores/${id}/edit`}
                className="rounded bg-foreground px-6 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                編集
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
