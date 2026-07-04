"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { useSuggestTags } from "@/features/scores/hooks/useSuggestTags";

type TagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export function TagInput({ tags, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { suggestions, clear: clearSuggestions } = useSuggestTags(input, tags);

  function addTag(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...tags, trimmed]);
    setInput("");
    clearSuggestions();
    setActiveIndex(-1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
        return;
      }
      if (e.key === "Escape") {
        clearSuggestions();
        setActiveIndex(-1);
        return;
      }
      if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        const selected = suggestions[activeIndex];
        if (selected) addTag(selected);
        return;
      }
    }

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && input === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function handleBlur() {
    // サジェスト選択のmousedownより後に発火するので、選択済みの場合はaddTagは不要
    // inputに残った文字はタグとして追加
    if (input.trim() && suggestions.length === 0) {
      addTag(input);
    } else if (input.trim() && activeIndex < 0) {
      addTag(input);
    }
    clearSuggestions();
    setActiveIndex(-1);
  }

  function handleSuggestionSelect(tag: string) {
    addTag(tag);
    inputRef.current?.focus();
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5 rounded border border-border bg-background px-2 py-1.5 focus-within:border-primary">
        {tags.map((tag, i) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded bg-foreground/10 px-2 py-0.5 text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="text-foreground/40 hover:text-foreground"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? (placeholder ?? "タグを入力（Enterで追加）") : ""}
          className="min-w-[120px] flex-1 bg-transparent py-0.5 text-sm outline-none"
        />
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded border border-border bg-background shadow-md">
          {suggestions.map((tag, i) => (
            <li
              key={tag}
              // mousedownでpreventDefaultしてblurより先にフォーカスを奪わないようにする
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSuggestionSelect(tag)}
              className={`cursor-pointer px-3 py-1.5 text-sm ${
                i === activeIndex
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-foreground/5"
              }`}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
