"use client";

import { useScores } from "@/features/scores/hooks/useScores";
import { ScoreCard } from "@/features/scores/components/ScoreCard";

export function ScoreList() {
  const { scores, error, loading } = useScores();

  if (loading) {
    return <p className="text-center text-muted">読み込み中...</p>;
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>;
  }

  if (scores.length === 0) {
    return (
      <p className="text-center text-muted">
        まだスコアがありません。
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {scores.map((score) => (
        <ScoreCard key={score.id} score={score} />
      ))}
    </div>
  );
}
