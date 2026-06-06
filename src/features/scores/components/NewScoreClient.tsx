"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/features/shared";
import { ScoreMetaForm } from "@/features/scores/components/ScoreMetaForm";
import { useCreateScore } from "@/features/scores/hooks/useCreateScore";
import type { ScoreFormData } from "@/features/scores/types";

export function NewScoreClient() {
  const router = useRouter();
  const { createScore, error, loading } = useCreateScore();

  const [formData, setFormData] = useState<ScoreFormData>({
    title: "",
    artist: "",
    key_name: "C",
    tempo: "",
    time_signature: "4/4",
    tag_names: [],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const score = await createScore(formData);
    if (score) {
      const path = `/scores/${score.slug}/edit`;
      const url = score.guest_token
        ? `${path}?token=${encodeURIComponent(score.guest_token)}`
        : path;
      router.push(url);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <ButtonLink href="/" variant="ghost" className="mb-3 inline-block">
        &larr; スコア一覧に戻る
      </ButtonLink>

      <h1 className="mb-4 text-3xl font-bold">新しいスコアを作成</h1>

      <form onSubmit={handleSubmit}>
        <ScoreMetaForm formData={formData} onChange={setFormData} />

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-6">
          <Button type="submit" disabled={loading || !formData.title}>
            {loading ? "作成中..." : "作成してコード譜を編集"}
          </Button>
        </div>
      </form>
    </div>
  );
}
