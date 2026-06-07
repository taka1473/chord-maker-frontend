import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { ScoreEditor } from "@/features/scores/components/ScoreEditor";
import { twoMeasureScore } from "./fixtures";

// Panel display tests: verifying what the bottom fixed panel shows
// based on which selection type is active.

const meta: Meta<typeof ScoreEditor> = {
  component: ScoreEditor,
  args: {
    scoreSlug: "test-score",
    initialData: twoMeasureScore,
    guestToken: null,
  },
};
export default meta;
type Story = StoryObj<typeof ScoreEditor>;

// Confirmed chord → delete button visible. Pending chord → delete button hidden.
export const DeleteButtonHiddenWhenPending: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // G is selected: delete button should be visible
    await expect(canvas.getByRole("button", { name: "削除" })).toBeInTheDocument();
    // Enter pending state
    await userEvent.click(canvas.getByTitle("コードを追加"));
    // Delete button should be hidden while pending
    await expect(canvas.queryByRole("button", { name: "削除" })).not.toBeInTheDocument();
  },
};

// Pending chord shows "--" in panel center and disables +♩
export const PanelShowsDashAndDisabledAddForPending: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTitle("コードを追加"));
    await expect(canvas.getByText("--", { selector: "span" })).toBeInTheDocument();
    await expect(canvas.getByTitle("コードを追加")).toBeDisabled();
  },
};

// chord_gap selected → "コードを挿入" button appears in panel
// G (12) → ◀ → chord_gap (11)
export const ChordGapPanelShowsInsertChordButton: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "◀" }));
    await expect(canvas.getByText("コード挿入位置")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: /コードを挿入/ })).toBeInTheDocument();
  },
};

// bar_line selected → "小節を挿入" button appears in panel
// G (12) → ▶ → chord_gap (13) → ▶ → bar_line (14)
export const BarLinePanelShowsInsertMeasureButton: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "▶" }));
    await userEvent.click(canvas.getByRole("button", { name: "▶" }));
    await expect(canvas.getByText("小節挿入位置")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: /小節を挿入/ })).toBeInTheDocument();
  },
};

// measure selected → copy + delete measure buttons appear in panel
// G (12) → ◀ × 4 → measure(M2) (8)
export const MeasurePanelShowsControls: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (let i = 0; i < 4; i++) {
      await userEvent.click(canvas.getByRole("button", { name: "◀" }));
    }
    await expect(canvas.getByText("小節選択中")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "コピー" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "小節を削除" })).toBeInTheDocument();
  },
};
