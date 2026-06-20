"use client";

import { useState } from "react";
import Link from "next/link";
import { useMyScores } from "@/features/scores/hooks/useMyScores";
import { useDeleteScore } from "@/features/scores/hooks/useDeleteScore";
import type { Score } from "@/features/scores/types";
import { formatKeyDisplay } from "@/features/scores/types";
import { Button, ButtonLink, Card } from "@/features/shared";

function MyScoreCard({
  score,
  onDelete,
}: {
  score: Score;
  onDelete: (slug: string) => void;
}) {
  return (
    <Card variant="interactive" className="p-4">
      <Link href={`/scores/${score.slug}`}>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{score.title}</h3>
          <span
            className={[
              "rounded px-1.5 py-0.5 text-[10px] font-medium",
              score.published
                ? "bg-success/15 text-success"
                : "bg-foreground/10 text-muted",
            ].join(" ")}
          >
            {score.published ? "公開中" : "非公開"}
          </span>
        </div>
        {score.artist && (
          <p className="mt-0.5 text-sm text-muted">{score.artist}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
          <span>Key: {formatKeyDisplay(score.key_name, score.key_mode)}</span>
          {score.tempo && <span>BPM: {score.tempo}</span>}
          {score.time_signature && <span>{score.time_signature}</span>}
        </div>
        {score.tag_names.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {score.tag_names.map((tag) => (
              <span
                key={tag}
                className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
      <div className="mt-3 flex gap-2">
        <ButtonLink href={`/scores/${score.slug}`} variant="secondary" size="sm">
          閲覧
        </ButtonLink>
        <ButtonLink href={`/scores/${score.slug}/edit`} variant="secondary" size="sm">
          編集
        </ButtonLink>
        <Button
          variant="destructive"
          size="sm"
          type="button"
          onClick={() => onDelete(score.slug)}
        >
          削除
        </Button>
      </div>
    </Card>
  );
}

export function MyScoreList() {
  const { scores: fetchedScores, error, loading } = useMyScores();
  const { deleteScore } = useDeleteScore();
  const [deletedSlugs, setDeletedSlugs] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const scores = fetchedScores.filter((s) => !deletedSlugs.has(s.slug));

  async function handleDelete(slug: string) {
    if (!window.confirm("このスコアを削除しますか？")) return;
    setDeleteError(null);
    const ok = await deleteScore(slug);
    if (ok) {
      setDeletedSlugs((prev) => new Set(prev).add(slug));
    } else {
      setDeleteError("削除に失敗しました");
    }
  }

  if (loading) {
    return <p className="text-center text-muted">読み込み中...</p>;
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>;
  }

  if (scores.length === 0) {
    return (
      <div className="text-center text-muted">
        <p>まだスコアがありません。</p>
        <ButtonLink href="/scores/new" className="mt-4 inline-block">
          新規作成
        </ButtonLink>
      </div>
    );
  }

  return (
    <>
      {deleteError && (
        <p className="mb-4 text-sm text-destructive">{deleteError}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scores.map((score) => (
          <MyScoreCard key={score.id} score={score} onDelete={handleDelete} />
        ))}
      </div>
    </>
  );
}
