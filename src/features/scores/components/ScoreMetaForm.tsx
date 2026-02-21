import type { ScoreFormData } from "@/features/scores/types";
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
