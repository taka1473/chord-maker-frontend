import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { ScoreEditor } from "@/features/scores/components/ScoreEditor";
import { twoMeasureScore } from "./fixtures";

// "空のコード（pendingChord）" state is entered by clicking +♩ while a chord is selected.
// The pending chord shows "--" in the panel center and has no delete button.

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

// +♩ → pending ("--") → ◀ → pending chord removed, panel shows "コード挿入位置"
export const NavigateLeftFromPendingRemovesPending: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Enter pending state
    await userEvent.click(canvas.getByTitle("コードを追加"));
    await expect(canvas.getByText("--", { selector: "span" })).toBeInTheDocument();
    // ◀ → pending chord removed, selection moves to chord_gap before it
    await userEvent.click(canvas.getByRole("button", { name: "◀" }));
    // "--" span gone, shows chord_gap status instead
    await expect(canvas.queryByText("--", { selector: "span" })).not.toBeInTheDocument();
    await expect(canvas.getByText("コード挿入位置")).toBeInTheDocument();
  },
};

// +♩ → pending → click Am chord (in score) → pending removed, Am is selected
// Uses "Am" because it's unique (not a piano key name)
export const SelectOtherChordWhilePendingRemovesPending: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTitle("コードを追加"));
    await expect(canvas.getByText("--", { selector: "span" })).toBeInTheDocument();
    // Click Am chord in the score (Am is a chord name, not a piano key name → unique)
    await userEvent.click(canvas.getByRole("button", { name: "Am" }));
    // Pending removed, Am is now selected in panel
    await expect(canvas.queryByText("--", { selector: "span" })).not.toBeInTheDocument();
    await expect(canvas.getByText("Am", { selector: "span" })).toBeInTheDocument();
  },
};

// +♩ → pending → +𝄁 (add measure) → old pending removed, new pending in new measure
export const AddMeasureWhilePendingReplacesPending: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTitle("コードを追加"));
    await expect(canvas.getByText("--", { selector: "span" })).toBeInTheDocument();
    // Add a measure → old pending chord removed, new pending chord created
    await userEvent.click(canvas.getByTitle("小節を追加"));
    // Still in pending state (new chord in new measure)
    await expect(canvas.getByText("--", { selector: "span" })).toBeInTheDocument();
    // +♩ must be disabled while pending
    await expect(canvas.getByTitle("コードを追加")).toBeDisabled();
  },
};
