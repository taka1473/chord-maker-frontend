"use client";

import { Suspense } from "react";
import { ScoreList } from "@/features/scores";

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-4">
      <Suspense>
        <ScoreList />
      </Suspense>
    </div>
  );
}
