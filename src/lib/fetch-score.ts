import type { WholeScore } from "@/features/scores/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function fetchWholeScoreServer(
  slug: string,
): Promise<WholeScore | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/scores/${slug}/whole_score`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as WholeScore;
  } catch {
    return null;
  }
}
