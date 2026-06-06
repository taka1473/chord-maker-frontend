import type { Metadata } from "next";
import { EditScoreClient } from "@/features/scores/components/EditScoreClient";

export const metadata: Metadata = {
  title: "スコアを編集",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function EditScorePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { token } = await searchParams;

  return <EditScoreClient slug={slug} guestToken={token ?? null} />;
}
