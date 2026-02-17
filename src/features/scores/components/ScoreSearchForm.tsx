import { Input } from "@/features/shared";
import { TagInput } from "@/features/scores/components/TagInput";
import type { SortOption } from "@/features/scores/hooks/useScores";

type ScoreSearchFormProps = {
  query: string;
  tags: string[];
  sort: SortOption;
  onQueryChange: (query: string) => void;
  onTagsChange: (tags: string[]) => void;
  onSortChange: (sort: SortOption) => void;
};

export function ScoreSearchForm({
  query,
  tags,
  sort,
  onQueryChange,
  onTagsChange,
  onSortChange,
}: ScoreSearchFormProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <Input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="タイトル・アーティストで検索"
        className="sm:max-w-xs"
      />
      <div className="flex-1">
        <TagInput
          tags={tags}
          onChange={onTagsChange}
          placeholder="タグで絞り込み（Enterで追加）"
        />
      </div>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="rounded border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
      >
        <option value="newest">新しい順</option>
        <option value="oldest">古い順</option>
      </select>
    </div>
  );
}
