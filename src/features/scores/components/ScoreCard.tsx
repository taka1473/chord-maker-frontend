import Link from "next/link";
import type { Score } from "@/features/scores/types";
import { formatKeyDisplay } from "@/features/scores/types";
import { Card } from "@/features/shared";

type ScoreCardProps = {
  score: Score;
};

export function ScoreCard({ score }: ScoreCardProps) {
  return (
    <Card variant="interactive">
      <Link href={`/scores/${score.slug}`} className="block p-4">
        <h3 className="text-lg font-semibold">{score.title}</h3>
        {score.artist && (
          <p className="mt-0.5 text-sm text-muted">{score.artist}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
          <span>Key: {formatKeyDisplay(score.key_name, score.key_mode)}</span>
          {score.tempo && <span>BPM: {score.tempo}</span>}
          {score.time_signature && <span>{score.time_signature}</span>}
        </div>
      </Link>
      {score.tag_names.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-4">
          {score.tag_names.map((tag) => (
            <Link
              key={tag}
              href={`/?tag=${encodeURIComponent(tag)}`}
              className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary hover:bg-primary/20"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
