import type { Metadata } from "next";
import { NewScoreClient } from "@/features/scores/components/NewScoreClient";

export const metadata: Metadata = {
  title: "新しいスコアを作成",
  robots: { index: false, follow: false },
};

export default function NewScorePage() {
  return <NewScoreClient />;
}
