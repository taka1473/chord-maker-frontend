import { vi, describe, it } from "vitest";

// All vi.mock calls are hoisted before imports
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => ({ get: vi.fn() }),
}));

vi.mock("@/features/scores/hooks/useUpdateScore", () => ({
  useUpdateScore: () => ({ updateScore: vi.fn(), error: null, loading: false }),
}));

vi.mock("@/features/scores/hooks/useClaimScore", () => ({
  useClaimScore: () => ({ claimScore: vi.fn(), error: null, loading: false }),
}));

vi.mock("@/features/auth/contexts/AuthContext", async () => {
  const { createContext } = await import("react");
  const ctx = createContext({ user: null, loading: false });
  return {
    useAuth: () => ({ user: null, loading: false }),
    AuthContext: ctx,
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

import React from "react";
import { render } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import * as NavigationStories from "./ScoreEditor.navigation.stories";
import * as PendingStories from "./ScoreEditor.pending.stories";
import * as PanelStories from "./ScoreEditor.panel.stories";

const navStories = composeStories(NavigationStories);
const pendingStories = composeStories(PendingStories);
const panelStories = composeStories(PanelStories);

function runStory(Story: React.ComponentType & { play?: (ctx: { canvasElement: HTMLElement; step: (label: string, fn: () => unknown) => Promise<void> }) => Promise<void> }) {
  return async () => {
    const { container } = render(<Story />);
    await Story.play?.({
      canvasElement: container,
      step: async (_label, fn) => { await fn(); },
    });
  };
}

describe("ScoreEditor ナビゲーション", () => {
  it("小節内を左に移動するとコードが切り替わる", runStory(navStories.NavigateLeftWithinMeasure));
  it("右ナビゲーションで小節境界を越えてFに到達する", runStory(navStories.NavigateRightAcrossMeasureBoundary));
  it("末尾の bar_line より先には移動しない", runStory(navStories.NavigateRightStopsAtEnd));
});

describe("ScoreEditor 空コード（pending）の操作", () => {
  it("pending 中に ◀ を押すと pending コードが削除される", runStory(pendingStories.NavigateLeftFromPendingRemovesPending));
  it("pending 中に別のコードを選択すると pending が削除される", runStory(pendingStories.SelectOtherChordWhilePendingRemovesPending));
  it("pending 中に小節追加すると古い pending が削除されて新しい pending になる", runStory(pendingStories.AddMeasureWhilePendingReplacesPending));
});

describe("ScoreEditor パネル表示", () => {
  it("pending 中は削除ボタンが非表示になる", runStory(panelStories.DeleteButtonHiddenWhenPending));
  it("pending 中はパネルに「--」が表示され+♩が無効化される", runStory(panelStories.PanelShowsDashAndDisabledAddForPending));
  it("chord_gap 選択中はコード挿入ボタンが表示される", runStory(panelStories.ChordGapPanelShowsInsertChordButton));
  it("bar_line 選択中は小節挿入ボタンが表示される", runStory(panelStories.BarLinePanelShowsInsertMeasureButton));
  it("小節選択中はコピー・削除ボタンが表示される", runStory(panelStories.MeasurePanelShowsControls));
});
