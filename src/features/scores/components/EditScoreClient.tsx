"use client";

import { AuthGuard } from "@/features/auth";
import { ButtonLink } from "@/features/shared";
import { useWholeScore } from "@/features/scores/hooks/useWholeScore";
import { ScoreEditor } from "@/features/scores/components/ScoreEditor";

function EditScoreContent({ slug }: { slug: string }) {
  const { wholeScore, error, loading } = useWholeScore(slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-4">
      <ButtonLink
        href={`/scores/${slug}`}
        variant="ghost"
        className="mb-3 inline-block"
      >
        &larr; 詳細に戻る
      </ButtonLink>

      {loading && (
        <p className="text-center text-muted">読み込み中...</p>
      )}

      {error && <p className="text-center text-destructive">{error}</p>}

      {wholeScore && (
        <ScoreEditor scoreSlug={wholeScore.slug} initialData={wholeScore} />
      )}
    </div>
  );
}

export function EditScoreClient({ slug }: { slug: string }) {
  return (
    <AuthGuard>
      <EditScoreContent slug={slug} />
    </AuthGuard>
  );
}
