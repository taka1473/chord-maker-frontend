import type { Score, WholeScore } from "@/features/scores/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

type PaginatedScores = {
  scores: Score[];
  total_count: number;
  page: number;
  per_page: number;
};

export async function fetchWholeScoreServer(
  slug: string,
): Promise<WholeScore | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/scores/${slug}/whole_score`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as WholeScore;
  } catch {
    return null;
  }
}

export async function fetchAllPublishedScoreSlugs(): Promise<
  { slug: string; created_at: string }[]
> {
  const results: { slug: string; created_at: string }[] = [];
  let page = 1;

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await fetch(`${API_BASE_URL}/api/scores?page=${page}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;

      const data = (await res.json()) as PaginatedScores;
      for (const score of data.scores) {
        results.push({ slug: score.slug, created_at: score.created_at });
      }

      if (page * data.per_page >= data.total_count) break;
      page++;
    }
  } catch {
    // Return whatever we've collected so far
  }

  return results;
}
