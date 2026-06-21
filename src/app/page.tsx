import type { Metadata } from "next";
import { Suspense } from "react";
import { ScoreList } from "@/features/scores";
import { HeroSection } from "./_components/HeroSection";

export const metadata: Metadata = {
  title: {
    absolute: "Chordlet - コード譜を作成・共有・閲覧できる無料サービス",
  },
  description:
    "Chordletは、コード譜を直感的に作成・編集して公開・共有できる無料サービスです。ギター・ピアノなど楽器演奏者向けのコード譜プラットフォーム。",
  openGraph: {
    title: "Chordlet - コード譜を作成・共有・閲覧できる無料サービス",
    description:
      "Chordletは、コード譜を直感的に作成・編集して公開・共有できる無料サービスです。ギター・ピアノなど楽器演奏者向けのコード譜プラットフォーム。",
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
