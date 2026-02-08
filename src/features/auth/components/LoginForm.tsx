"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useSignIn } from "@/features/auth/hooks/useSignIn";
import { useSignUp } from "@/features/auth/hooks/useSignUp";

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
      <div className="w-full max-w-md space-y-8 rounded-lg border border-foreground/10 p-8">
        <h1 className="text-center text-2xl font-bold">
          {isSignUp ? "アカウント作成" : "ログイン"}
        </h1>

        {error && (
          <div className="rounded bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded border border-foreground/20 bg-background px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded border border-foreground/20 bg-background px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-foreground px-4 py-2 text-background hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "処理中..."
              : isSignUp
                ? "アカウント作成"
                : "ログイン"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-foreground/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-foreground/60">または</span>
          </div>
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded border border-foreground/20 px-4 py-2 hover:bg-foreground/5 disabled:opacity-50"
        >
          Google でログイン
        </button>

        <p className="text-center text-sm text-foreground/60">
          {isSignUp ? "すでにアカウントをお持ちですか？" : "アカウントをお持ちでないですか？"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-foreground underline"
          >
            {isSignUp ? "ログイン" : "アカウント作成"}
          </button>
        </p>
      </div>
    </div>
  );
}
