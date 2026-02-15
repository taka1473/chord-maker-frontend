"use client";

import { use } from "react";
import { AuthGuard } from "@/features/auth";
import { ButtonLink } from "@/features/shared";
import { useWholeScore } from "@/features/scores/hooks/useWholeScore";
import { ScoreEditor } from "@/features/scores/components/ScoreEditor";

function EditScoreContent({ id }: { id: string }) {
  const { wholeScore, error, loading } = useWholeScore(id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ButtonLink
        href={`/scores/${id}`}
        variant="ghost"
        className="mb-6 inline-block"
      >
        &larr; 詳細に戻る
      </ButtonLink>

      <h1 className="mb-6 text-2xl font-bold">スコアを編集</h1>

      {loading && (
        <p className="text-center text-foreground/60">読み込み中...</p>
      )}

      {error && <p className="text-center text-red-500">{error}</p>}

      {wholeScore && (
        <ScoreEditor scoreId={wholeScore.id} initialData={wholeScore} />
      )}
    </div>
  );
}

export default function EditScorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AuthGuard>
      <EditScoreContent id={id} />
    </AuthGuard>
  );
}
