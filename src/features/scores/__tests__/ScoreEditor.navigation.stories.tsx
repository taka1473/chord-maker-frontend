import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { ScoreEditor } from "@/features/scores/components/ScoreEditor";
import { twoMeasureScore } from "./fixtures";

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

// Initial selection: G (last chord of last measure, index 12 in navItems)
// navItems order: bar_line(null) → measure(M1) → chord_gap → C → chord_gap → Am →
//                chord_gap → bar_line(M1) → measure(M2) → chord_gap → F → chord_gap → G →
//                chord_gap → bar_line(M2)

// ◀ from G (12) → chord_gap (11) → ◀ → F (10)
export const NavigateLeftWithinMeasure: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // G is selected initially
    await expect(canvas.getByText("G", { selector: "span" })).toBeInTheDocument();
    // ◀ once → chord_gap
    await userEvent.click(canvas.getByRole("button", { name: "◀" }));
    // ◀ again → F
    await userEvent.click(canvas.getByRole("button", { name: "◀" }));
    await expect(canvas.getByText("F", { selector: "span" })).toBeInTheDocument();
  },
};

// Click Am (last chord of M1), then ▶ × 5 to reach F (first chord of M2)
// Am(5) → chord_gap(6) → bar_line(7) → measure(8) → chord_gap(9) → F(10)
export const NavigateRightAcrossMeasureBoundary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Select Am (last chord of measure 1)
    await userEvent.click(canvas.getByRole("button", { name: "Am" }));
    await expect(canvas.getByText("Am", { selector: "span" })).toBeInTheDocument();
    // ▶ × 5 to reach F (first chord of measure 2)
    for (let i = 0; i < 5; i++) {
      await userEvent.click(canvas.getByRole("button", { name: "▶" }));
    }
    await expect(canvas.getByText("F", { selector: "span" })).toBeInTheDocument();
  },
};

// ▶ × 2 from G reaches bar_line (last item). Further ▶ does nothing.
export const NavigateRightStopsAtEnd: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // G → ▶ → chord_gap → ▶ → bar_line (panel: "小節挿入位置")
    await userEvent.click(canvas.getByRole("button", { name: "▶" }));
    await userEvent.click(canvas.getByRole("button", { name: "▶" }));
    await expect(canvas.getByText("小節挿入位置")).toBeInTheDocument();
    // ▶ one more → still at bar_line
    await userEvent.click(canvas.getByRole("button", { name: "▶" }));
    await expect(canvas.getByText("小節挿入位置")).toBeInTheDocument();
  },
};
