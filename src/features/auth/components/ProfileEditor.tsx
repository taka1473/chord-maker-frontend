"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/features/auth/hooks/useProfile";

export function ProfileEditor() {
  const { profile, error, loading, updating, updateName } = useProfile();
  const [name, setName] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    const ok = await updateName(name.trim());
    if (ok) {
      setSuccess(true);
    }
  }

  if (loading) {
    return <p className="text-sm text-foreground/60">読み込み中...</p>;
  }

  const isValid = name.trim().length >= 2 && name.trim().length <= 50;
  const hasChanges = profile && name.trim() !== profile.name;

  return (
    <div className="rounded-lg border border-foreground/10 p-4">
      <h2 className="mb-3 text-lg font-semibold">プロフィール</h2>

      {profile && !profile.handle_name_set && (
        <p className="mb-3 text-sm text-amber-600 dark:text-amber-400">
          名前を設定してください
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSuccess(false);
            }}
            minLength={2}
            maxLength={50}
            className="w-full rounded border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={updating || !isValid || !hasChanges}
          className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {updating ? "保存中..." : "保存"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {success && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
          保存しました
        </p>
      )}
    </div>
  );
}
