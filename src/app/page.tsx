import type { Metadata } from "next";
import { Suspense } from "react";
import { ScoreList } from "@/features/scores";
import { HeroSection } from "./_components/HeroSection";

export const metadata: Metadata = {
  title: "コード譜一覧",
  description: "ユーザーが公開したコード譜を検索・閲覧できます。",
  openGraph: {
    title: "コード譜一覧",
    description: "ユーザーが公開したコード譜を検索・閲覧できます。",
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="mx-auto max-w-4xl px-4 py-4">
        <Suspense>
          <ScoreList />
        </Suspense>
      </div>
    </>
  );
}
