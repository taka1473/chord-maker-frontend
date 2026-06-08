"use client";

import { useState } from "react";
import { Button } from "@/features/shared/components/Button";
import { Pagination } from "@/features/shared/components/Pagination";
import { useAdminScores } from "@/features/admin/hooks/useAdminScores";

export function AdminScoresTable() {
  const [page, setPage] = useState(1);
  const { data, error, loading, unpublishScore, deleteScore } =
    useAdminScores(page);

  if (loading) return <p className="text-muted">読み込み中...</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!data) return null;

  const totalPages = Math.ceil(data.total_count / data.per_page);

  return (
    <div>
      <p className="mb-4 text-sm text-muted">全 {data.total_count} 件</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="pb-2 pr-4">ID</th>
            <th className="pb-2 pr-4">タイトル</th>
            <th className="pb-2 pr-4">作成者</th>
            <th className="pb-2 pr-4">公開</th>
            <th className="pb-2 pr-4">登録日</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {data.scores.map((score) => (
            <ScoreRow
              key={score.id}
              score={score}
              onUnpublish={async () => unpublishScore(score.id)}
              onDelete={async () => deleteScore(score.id)}
            />
          ))}
        </tbody>
      </table>
      <div className="mt-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

type ScoreRowProps = {
  score: {
    id: number;
    title: string;
    published: boolean;
    created_at: string;
    user: { id: number; name: string } | null;
  };
  onUnpublish: () => Promise<void>;
  onDelete: () => Promise<void>;
};

function ScoreRow({ score, onUnpublish, onDelete }: ScoreRowProps) {
  const [confirming, setConfirming] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleUnpublish = async () => {
    setProcessing(true);
    setMutationError(null);
    try {
      await onUnpublish();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "非公開化に失敗しました");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    setProcessing(true);
    setMutationError(null);
    try {
      await onDelete();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "削除に失敗しました");
      setConfirming(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <tr className="border-b border-border/50">
      <td className="py-2 pr-4 text-muted">{score.id}</td>
      <td className="py-2 pr-4 font-medium">{score.title}</td>
      <td className="py-2 pr-4 text-muted">
        {score.user?.name ?? "（ゲスト）"}
      </td>
      <td className="py-2 pr-4">
        {score.published ? (
          <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
            公開
          </span>
        ) : (
          <span className="text-muted">非公開</span>
        )}
      </td>
      <td className="py-2 pr-4 text-muted">
        {new Date(score.created_at).toLocaleDateString("ja-JP")}
      </td>
      <td className="py-2">
        {mutationError && (
          <p className="mb-1 text-xs text-destructive">{mutationError}</p>
        )}
        {confirming ? (
          <div className="flex items-center gap-2">
            <p className="text-xs text-destructive">削除しますか？</p>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={processing}
            >
              削除する
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirming(false)}
            >
              キャンセル
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {score.published && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUnpublish}
                disabled={processing}
              >
                非公開化
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirming(true)}
            >
              削除
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}
