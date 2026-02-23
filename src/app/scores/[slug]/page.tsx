import type { Metadata } from "next";
import { fetchWholeScoreServer } from "@/lib/fetch-score";
import { ScoreDetailClient } from "@/features/scores/components/ScoreDetailClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const score = await fetchWholeScoreServer(slug);

  if (!score) {
    return { title: "スコアが見つかりません" };
  }

  const title = score.artist
    ? `${score.title} - ${score.artist}`
    : score.title;

  const descriptionParts = [
    `Key: ${score.key_name}`,
    score.tempo ? `BPM: ${score.tempo}` : null,
    score.time_signature ? `拍子: ${score.time_signature}` : null,
  ].filter(Boolean);

  const description = `${score.title}のコード譜。${descriptionParts.join(" / ")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "music.song",
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function ScoreDetailPage({ params }: Props) {
  const { slug } = await params;
  const wholeScore = await fetchWholeScoreServer(slug);

  return <ScoreDetailClient slug={slug} initialData={wholeScore} />;
}
