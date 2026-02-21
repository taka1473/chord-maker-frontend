"use client";

import { use } from "react";
import { useAuth } from "@/features/auth";
import { ButtonLink } from "@/features/shared";
import { useWholeScore, ChordChart } from "@/features/scores";

export default function ScoreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user } = useAuth();
  const { wholeScore, error, loading } = useWholeScore(slug);

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
          {user && (
            <div className="mt-6">
              <ButtonLink href={`/scores/${slug}/edit`}>
                編集
              </ButtonLink>
            </div>
          )}
        </>
      )}
    </div>
  );
}
