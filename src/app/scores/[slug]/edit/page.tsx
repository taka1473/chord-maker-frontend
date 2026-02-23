import type { Metadata } from "next";
import { EditScoreClient } from "@/features/scores/components/EditScoreClient";

export const metadata: Metadata = {
  title: "スコアを編集",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditScorePage({ params }: Props) {
  const { slug } = await params;

  return <EditScoreClient slug={slug} />;
}
