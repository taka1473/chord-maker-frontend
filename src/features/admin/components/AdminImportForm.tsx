"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/features/shared/components/Button";
import { apiClient } from "@/lib/api-client";

type ImportResult = {
  slug: string;
  title: string;
};

export function AdminImportForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setStatus("loading");
    setResult(null);
    setErrorMessage(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text) as { score: unknown };
      const data = await apiClient<ImportResult>("/api/admin/scores/import", {
        method: "POST",
        body: json,
        requireAuth: true,
      });
      setResult(data);
      setStatus("success");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "インポートに失敗しました");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-lg">
      <p className="mb-6 text-sm text-muted">
        スキル <code className="rounded bg-muted/30 px-1 py-0.5 text-xs">/import-score</code>{" "}
        で生成したJSONファイルをアップロードして、スコアをインポートします。
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">JSONファイル</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            required
            className="block w-full text-sm file:mr-4 file:cursor-pointer file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
          />
        </div>
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "インポート中..." : "インポート"}
        </Button>
      </form>

      {status === "success" && result && (
        <div className="mt-6 rounded border border-green-500/30 bg-green-500/10 p-4">
          <p className="font-medium text-green-600 dark:text-green-400">
            ✓ インポート成功：{result.title}
          </p>
          <Link
            href={`/scores/${result.slug}`}
            className="mt-2 inline-block text-sm text-primary underline underline-offset-2"
          >
            スコアを見る →
          </Link>
        </div>
      )}

      {status === "error" && errorMessage && (
        <div className="mt-6 rounded border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
