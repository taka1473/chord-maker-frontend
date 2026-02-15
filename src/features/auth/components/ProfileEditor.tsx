"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/features/auth/hooks/useProfile";
import { Button, Card, Input, Label } from "@/features/shared";

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
    return <p className="text-sm text-muted">読み込み中...</p>;
  }

  const isValid = name.trim().length >= 2 && name.trim().length <= 50;
  const hasChanges = profile && name.trim() !== profile.name;

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-lg font-semibold">プロフィール</h2>

      {profile && !profile.handle_name_set && (
        <p className="mb-3 text-sm text-warning">
          名前を設定してください
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <Label>名前</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSuccess(false);
            }}
            minLength={2}
            maxLength={50}
          />
        </div>
        <Button type="submit" disabled={updating || !isValid || !hasChanges}>
          {updating ? "保存中..." : "保存"}
        </Button>
      </form>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {success && (
        <p className="mt-2 text-sm text-success">
          保存しました
        </p>
      )}
    </Card>
  );
}
