"use client";

import Link from "next/link";
import { useMyScores } from "@/features/scores/hooks/useMyScores";
import type { Score } from "@/features/scores/types";

function MyScoreCard({ score }: { score: Score }) {
  return (
    <div className="rounded-lg border border-foreground/10 p-4 transition-colors hover:border-foreground/25 hover:bg-foreground/5">
      <Link href={`/scores/${score.id}`}>
        <h3 className="text-lg font-semibold">{score.title}</h3>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-foreground/60">
          <span>Key: {score.key_name}</span>
          {score.tempo && <span>BPM: {score.tempo}</span>}
          {score.time_signature && <span>{score.time_signature}</span>}
        </div>
      </Link>
      <div className="mt-3 flex gap-2">
        <Link
          href={`/scores/${score.id}`}
          className="rounded border border-foreground/20 px-3 py-1 text-xs text-foreground/60 transition-colors hover:bg-foreground/5"
        >
          閲覧
        </Link>
        <Link
          href={`/scores/${score.id}/edit`}
          className="rounded border border-foreground/20 px-3 py-1 text-xs text-foreground/60 transition-colors hover:bg-foreground/5"
        >
          編集
        </Link>
      </div>
    </div>
  );
}

export function MyScoreList() {
  const { scores, error, loading } = useMyScores();

  if (loading) {
    return <p className="text-center text-foreground/60">読み込み中...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (scores.length === 0) {
    return (
      <div className="text-center text-foreground/60">
        <p>まだスコアがありません。</p>
        <Link
          href="/scores/new"
          className="mt-4 inline-block rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          新規作成
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {scores.map((score) => (
        <MyScoreCard key={score.id} score={score} />
      ))}
    </div>
  );
}
