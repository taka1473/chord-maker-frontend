import type { ScoreFormData } from "@/features/scores/types";
import { KEY_NAMES, TIME_SIGNATURES } from "@/features/scores/types";

type ScoreMetaFormProps = {
  formData: ScoreFormData;
  onChange: (formData: ScoreFormData) => void;
};

export function ScoreMetaForm({ formData, onChange }: ScoreMetaFormProps) {
  function handleChange(
    field: keyof ScoreFormData,
    value: string
  ) {
    onChange({ ...formData, [field]: value });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="曲名を入力"
          maxLength={100}
          className="w-full rounded border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          キー <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.key_name}
          onChange={(e) => handleChange("key_name", e.target.value)}
          className="w-full rounded border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
        >
          {KEY_NAMES.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">拍子</label>
        <select
          value={formData.time_signature}
          onChange={(e) => handleChange("time_signature", e.target.value)}
          className="w-full rounded border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
        >
          <option value="">未設定</option>
          {TIME_SIGNATURES.map((ts) => (
            <option key={ts} value={ts}>
              {ts}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">テンポ (BPM)</label>
        <input
          type="number"
          value={formData.tempo}
          onChange={(e) => handleChange("tempo", e.target.value)}
          placeholder="120"
          min={1}
          max={499}
          className="w-full rounded border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
        />
      </div>
    </div>
  );
}
