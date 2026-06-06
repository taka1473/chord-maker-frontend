"use client";

import { ButtonLink } from "@/features/shared";
import { useWholeScore } from "@/features/scores/hooks/useWholeScore";
import { ScoreEditor } from "@/features/scores/components/ScoreEditor";

type Props = {
  slug: string;
  guestToken: string | null;
};

function EditScoreContent({ slug, guestToken }: Props) {
  const { wholeScore, error, loading } = useWholeScore(slug, guestToken);

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
        <ScoreEditor
          scoreSlug={wholeScore.slug}
          initialData={wholeScore}
          guestToken={guestToken}
        />
      )}
    </div>
  );
}

export function EditScoreClient({ slug, guestToken }: Props) {
  return <EditScoreContent slug={slug} guestToken={guestToken} />;
}
