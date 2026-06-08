"use client";

import { useState } from "react";
import { Button } from "@/features/shared/components/Button";
import { Pagination } from "@/features/shared/components/Pagination";
import { useAdminTags } from "@/features/admin/hooks/useAdminTags";

export function AdminTagsTable() {
  const [page, setPage] = useState(1);
  const { data, error, loading, deleteTag } = useAdminTags(page);

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
            <th className="pb-2 pr-4">名前</th>
            <th className="pb-2 pr-4">スコア数</th>
            <th className="pb-2 pr-4">登録日</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {data.tags.map((tag) => (
            <TagRow
              key={tag.id}
              tag={tag}
              onDelete={async () => deleteTag(tag.id)}
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

type TagRowProps = {
  tag: {
    id: number;
    name: string;
    scores_count: number;
    created_at: string;
  };
  onDelete: () => Promise<void>;
};

function TagRow({ tag, onDelete }: TagRowProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <tr className="border-b border-border/50">
      <td className="py-2 pr-4 text-muted">{tag.id}</td>
      <td className="py-2 pr-4 font-medium">{tag.name}</td>
      <td className="py-2 pr-4">{tag.scores_count}</td>
      <td className="py-2 pr-4 text-muted">
        {new Date(tag.created_at).toLocaleDateString("ja-JP")}
      </td>
      <td className="py-2">
        {confirming ? (
          <div className="flex items-center gap-2">
            <p className="text-xs text-destructive">削除しますか？</p>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
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
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirming(true)}
          >
            削除
          </Button>
        )}
      </td>
    </tr>
  );
}
