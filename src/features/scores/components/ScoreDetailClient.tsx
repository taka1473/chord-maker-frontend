"use client";

import { useAuth } from "@/features/auth";
import { ButtonLink } from "@/features/shared";
import { useWholeScore } from "@/features/scores/hooks/useWholeScore";
import { ChordChart } from "@/features/scores/components/ChordChart";
import { scoreEditHref } from "@/features/scores/lib/score-urls";
import type { WholeScore } from "@/features/scores/types";

type Props = {
  slug: string;
  initialData?: WholeScore | null;
  guestToken?: string | null;
};

export function ScoreDetailClient({ slug, initialData, guestToken = null }: Props) {
  const { user } = useAuth();
  const { wholeScore, error, loading } = useWholeScore(slug, guestToken, initialData ?? undefined);

  const editHref = scoreEditHref(slug, guestToken);

  return (
    <div className="mx-auto max-w-4xl px-4 py-4">
      <ButtonLink href="/" variant="ghost" className="mb-3 inline-block">
        &larr; スコア一覧に戻る
      </ButtonLink>

      {loading && (
        <p className="text-center text-muted">読み込み中...</p>
      )}

      {error && <p className="text-center text-destructive">{error}</p>}

      {wholeScore && (
        <>
          <ChordChart wholeScore={wholeScore} />
          {(user || guestToken) && (
            <div className="mt-6">
              <ButtonLink href={editHref}>
                編集
              </ButtonLink>
            </div>
          )}
        </>
      )}
    </div>
  );
}
