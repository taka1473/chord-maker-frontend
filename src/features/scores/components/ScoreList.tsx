"use client";

import { useState } from "react";
import { useScores } from "@/features/scores/hooks/useScores";
import { ScoreCard } from "@/features/scores/components/ScoreCard";
import { ScoreSearchForm } from "@/features/scores/components/ScoreSearchForm";
import { useDebounce } from "@/lib/useDebounce";

export function ScoreList() {
  const [query, setQuery] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  const { scores, error, loading } = useScores({
    search: debouncedQuery || undefined,
    tags: filterTags.length > 0 ? filterTags : undefined,
  });

  return (
    <div>
      <div className="mb-4">
        <ScoreSearchForm
          query={query}
          tags={filterTags}
          onQueryChange={setQuery}
          onTagsChange={setFilterTags}
        />
      </div>

      {loading ? (
        <p className="text-center text-muted">読み込み中...</p>
      ) : error ? (
        <p className="text-center text-destructive">{error}</p>
      ) : scores.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scores.map((score) => (
            <ScoreCard key={score.id} score={score} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted">
          {debouncedQuery || filterTags.length > 0
            ? "該当するスコアが見つかりません。"
            : "まだスコアがありません。"}
        </p>
      )}
    </div>
  );
}
