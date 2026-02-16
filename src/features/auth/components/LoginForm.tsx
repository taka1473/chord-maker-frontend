"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useSignIn } from "@/features/auth/hooks/useSignIn";
import { useSignUp } from "@/features/auth/hooks/useSignUp";
import { Button, Card, Input, Label } from "@/features/shared";

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const {
    signInWithEmail,
    signInWithGoogle,
    error: signInError,
    loading: signInLoading,
  } = useSignIn();
  const { signUp, error: signUpError, loading: signUpLoading } = useSignUp();

  const loading = signInLoading || signUpLoading;
  const error = signInError || signUpError;

  // ログイン済みならリダイレクト
  if (user) {
    router.replace("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signInWithEmail(email, password);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md space-y-8 p-8">
        <h1 className="text-center text-3xl font-bold">
          {isSignUp ? "アカウント作成" : "ログイン"}
        </h1>

        {error && (
          <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "処理中..."
              : isSignUp
                ? "アカウント作成"
                : "ログイン"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-muted">または</span>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={signInWithGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2"
        >
          Google でログイン
        </Button>

        <p className="text-center text-sm text-muted">
          {isSignUp ? "すでにアカウントをお持ちですか？" : "アカウントをお持ちでないですか？"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-foreground underline"
          >
            {isSignUp ? "ログイン" : "アカウント作成"}
          </button>
        </p>
      </Card>
    </div>
  );
}
