"use client";

import { useState } from "react";
import { Button } from "@/features/shared/components/Button";
import { Pagination } from "@/features/shared/components/Pagination";
import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";

export function AdminUsersTable() {
  const [page, setPage] = useState(1);
  const { data, error, loading, deleteUser } = useAdminUsers(page);

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
            <th className="pb-2 pr-4">ロール</th>
            <th className="pb-2 pr-4">スコア数</th>
            <th className="pb-2 pr-4">登録日</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {data.users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onDelete={async () => {
                await deleteUser(user.id);
              }}
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

type UserRowProps = {
  user: {
    id: number;
    name: string;
    role: "user" | "admin";
    scores_count: number;
    created_at: string;
  };
  onDelete: () => Promise<void>;
};

function UserRow({ user, onDelete }: UserRowProps) {
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
      <td className="py-2 pr-4 text-muted">{user.id}</td>
      <td className="py-2 pr-4 font-medium">{user.name}</td>
      <td className="py-2 pr-4">
        {user.role === "admin" ? (
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            admin
          </span>
        ) : (
          <span className="text-muted">user</span>
        )}
      </td>
      <td className="py-2 pr-4">{user.scores_count}</td>
      <td className="py-2 pr-4 text-muted">
        {new Date(user.created_at).toLocaleDateString("ja-JP")}
      </td>
      <td className="py-2">
        {confirming ? (
          <div className="flex items-center gap-2">
            <p className="text-xs text-destructive">
              スコア {user.scores_count} 件も削除されます。よろしいですか？
            </p>
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
