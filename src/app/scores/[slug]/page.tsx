import type { Metadata } from "next";
import { fetchWholeScoreServer } from "@/lib/fetch-score";
import { ScoreDetailClient } from "@/features/scores/components/ScoreDetailClient";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
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

  const scoreName = score.artist
    ? `${score.title}（${score.artist}）`
    : score.title;
  const description = `${scoreName}のコード譜をChordletで。閲覧しながら直感的に編集・公開できる無料コード譜共有サービス。`;

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

export default async function ScoreDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { token } = await searchParams;
  const wholeScore = await fetchWholeScoreServer(slug);

  return (
    <ScoreDetailClient
      slug={slug}
      initialData={wholeScore}
      guestToken={token ?? null}
    />
  );
}
