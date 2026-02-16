"use client";

import { ScoreList } from "@/features/scores";

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ScoreList />
    </div>
  );
}
