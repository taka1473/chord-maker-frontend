import type { ScoreFormData, KeyMode } from "@/features/scores/types";
import { KEY_NAMES, TIME_SIGNATURES } from "@/features/scores/types";
import { Input, Select, Label } from "@/features/shared";

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
        <Label>
          タイトル <span className="text-destructive">*</span>
        </Label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="曲名を入力"
          maxLength={100}
        />
      </div>

      <div className="sm:col-span-2">
        <Label>アーティスト</Label>
        <Input
          type="text"
          value={formData.artist}
          onChange={(e) => handleChange("artist", e.target.value)}
          placeholder="アーティスト名を入力"
          maxLength={100}
        />
      </div>

      <div>
        <Label>
          キー <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          <Select
            value={formData.key_name}
            onChange={(e) => handleChange("key_name", e.target.value)}
          >
            {KEY_NAMES.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </Select>
          <div className="flex items-center gap-3 px-1">
            {(["major", "minor"] as KeyMode[]).map((mode) => (
              <label key={mode} className="flex items-center gap-1 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="key_mode"
                  value={mode}
                  checked={formData.key_mode === mode}
                  onChange={() => handleChange("key_mode", mode)}
                  className="accent-primary"
                />
                {mode === "major" ? "Major" : "Minor"}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Label>拍子</Label>
        <Select
          value={formData.time_signature}
          onChange={(e) => handleChange("time_signature", e.target.value)}
        >
          <option value="">未設定</option>
          {TIME_SIGNATURES.map((ts) => (
            <option key={ts} value={ts}>
              {ts}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>テンポ (BPM)</Label>
        <Input
          type="number"
          value={formData.tempo}
          onChange={(e) => handleChange("tempo", e.target.value)}
          placeholder="120"
          min={1}
          max={499}
        />
      </div>
    </div>
  );
}
