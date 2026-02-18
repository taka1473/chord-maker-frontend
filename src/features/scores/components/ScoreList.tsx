"use client";

import { useState, useCallback } from "react";
import { useScores, type SortOption } from "@/features/scores/hooks/useScores";
import { ScoreCard } from "@/features/scores/components/ScoreCard";
import { ScoreSearchForm } from "@/features/scores/components/ScoreSearchForm";
import { Pagination } from "@/features/shared";
import { useDebounce } from "@/lib/useDebounce";

export function ScoreList() {
  const [query, setQuery] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebounce(query, 300);

  const { scores, totalCount, perPage, error, loading } = useScores({
    search: debouncedQuery || undefined,
    tags: filterTags.length > 0 ? filterTags : undefined,
    sort,
    page,
  });

  const totalPages = Math.ceil(totalCount / perPage);

  const handleQueryChange = useCallback((q: string) => {
    setQuery(q);
    setPage(1);
  }, []);

  const handleTagsChange = useCallback((tags: string[]) => {
    setFilterTags(tags);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((s: SortOption) => {
    setSort(s);
    setPage(1);
  }, []);

  return (
    <div>
      <div className="mb-4">
        <ScoreSearchForm
          query={query}
          tags={filterTags}
          sort={sort}
          onQueryChange={handleQueryChange}
          onTagsChange={handleTagsChange}
          onSortChange={handleSortChange}
        />
      </div>

      {loading ? (
        <p className="text-center text-muted">読み込み中...</p>
      ) : error ? (
        <p className="text-center text-destructive">{error}</p>
      ) : scores.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scores.map((score) => (
              <ScoreCard key={score.id} score={score} />
            ))}
          </div>
          <div className="mt-6">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
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
