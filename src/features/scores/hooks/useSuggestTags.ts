"use client";

import { useState, useEffect, useRef } from "react";
import { toKana } from "wanakana";
import { apiClient } from "@/lib/api-client";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export function useSuggestTags(input: string, excludeTags: string[]) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(timerRef.current);

    if (input.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      return;
    }

    // ローマ字が完全にカナに変換された場合のみ、元の入力と並列で検索する
    // 例: "fu" → ["fu", "ふ"]（英語タグ "fuga" とカナタグ両方にマッチ）
    //     "fug" → ["fug"]（"ふg" は未完成なので変換なし）
    const converted = toKana(input, { IMEMode: true });
    const isFullyConverted = !/[a-zA-Z]/.test(converted) && converted !== input;
    const queries = isFullyConverted ? [input, converted] : [input];

    timerRef.current = setTimeout(async () => {
      try {
        const results = await Promise.all(
          queries.map((q) =>
            apiClient<{ tags: string[] }>(`/api/tags?q=${encodeURIComponent(q)}`)
          )
        );
        const merged = [...new Set(results.flatMap((r) => r.tags))];
        const filtered = merged.filter(
          (tag) => !excludeTags.some((e) => e.toLowerCase() === tag.toLowerCase())
        );
        setSuggestions(filtered);
      } catch {
        setSuggestions([]);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [input, excludeTags]);

  function clear() {
    setSuggestions([]);
  }

  return { suggestions, clear };
}
