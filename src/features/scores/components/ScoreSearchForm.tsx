import { Input } from "@/features/shared";
import { TagInput } from "@/features/scores/components/TagInput";

type ScoreSearchFormProps = {
  query: string;
  tags: string[];
  onQueryChange: (query: string) => void;
  onTagsChange: (tags: string[]) => void;
};

export function ScoreSearchForm({
  query,
  tags,
  onQueryChange,
  onTagsChange,
}: ScoreSearchFormProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
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
    </div>
  );
}
