import Link from "next/link";
import type { Score } from "@/features/scores/types";

type ScoreCardProps = {
  score: Score;
};

export function ScoreCard({ score }: ScoreCardProps) {
  return (
    <Link
      href={`/scores/${score.id}`}
      className="block rounded-lg border border-foreground/10 p-4 transition-colors hover:border-foreground/25 hover:bg-foreground/5"
    >
      <h3 className="text-lg font-semibold">{score.title}</h3>
      {score.artist && (
        <p className="mt-0.5 text-sm text-foreground/60">{score.artist}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-3 text-sm text-foreground/60">
        <span>Key: {score.key_name}</span>
        {score.tempo && <span>BPM: {score.tempo}</span>}
        {score.time_signature && <span>{score.time_signature}</span>}
      </div>
    </Link>
  );
}
