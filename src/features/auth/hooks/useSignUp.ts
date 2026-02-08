"use client";

import { useState, useCallback } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export function useSignUp() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setLoading(true);
      try {
        const auth = getFirebaseAuth();
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sign up failed");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { signUp, error, loading };
}
