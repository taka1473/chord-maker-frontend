"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/features/auth";
import { Button, ButtonLink } from "@/features/shared";
import { ScoreMetaForm } from "@/features/scores/components/ScoreMetaForm";
import { useCreateScore } from "@/features/scores/hooks/useCreateScore";
import type { ScoreFormData } from "@/features/scores/types";

function NewScoreContent() {
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
      router.push(`/scores/${score.id}/edit`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ButtonLink href="/" variant="ghost" className="mb-6 inline-block">
        &larr; スコア一覧に戻る
      </ButtonLink>

      <h1 className="mb-6 text-2xl font-bold">新しいスコアを作成</h1>

      <form onSubmit={handleSubmit}>
        <ScoreMetaForm formData={formData} onChange={setFormData} />

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="mt-6">
          <Button type="submit" disabled={loading || !formData.title}>
            {loading ? "作成中..." : "作成してコード譜を編集"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewScorePage() {
  return (
    <AuthGuard>
      <NewScoreContent />
    </AuthGuard>
  );
}
