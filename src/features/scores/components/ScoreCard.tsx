import Link from "next/link";
import type { Score } from "@/features/scores/types";
import { Card } from "@/features/shared";

type ScoreCardProps = {
  score: Score;
};

export function ScoreCard({ score }: ScoreCardProps) {
  return (
    <Card variant="interactive">
      <Link href={`/scores/${score.id}`} className="block p-4">
        <h3 className="text-lg font-semibold">{score.title}</h3>
        {score.artist && (
          <p className="mt-0.5 text-sm text-foreground/60">{score.artist}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-foreground/60">
          <span>Key: {score.key_name}</span>
          {score.tempo && <span>BPM: {score.tempo}</span>}
          {score.time_signature && <span>{score.time_signature}</span>}
        </div>
        {score.tag_names.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {score.tag_names.map((tag) => (
              <span
                key={tag}
                className="rounded bg-foreground/10 px-2 py-0.5 text-xs text-foreground/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </Card>
  );
}
