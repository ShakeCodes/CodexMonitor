/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppBootstrap } from "./useAppBootstrap";
import { isMobilePlatform } from "@utils/platformPaths";
import { useAppSettingsController } from "@app/hooks/useAppSettingsController";
import { useCodeCssVars } from "@app/hooks/useCodeCssVars";
import { useDictationController } from "@app/hooks/useDictationController";
import { useLiquidGlassEffect } from "@app/hooks/useLiquidGlassEffect";
import { getCachedRuntimeCompatibility } from "@app/runtimeCompatibility";
import { useDebugLog } from "@/features/debug/hooks/useDebugLog";

vi.mock("@utils/platformPaths", () => ({
  isMobilePlatform: vi.fn(),
}));

vi.mock("@app/hooks/useAppSettingsController", () => ({
  useAppSettingsController: vi.fn(),
}));

vi.mock("@app/hooks/useCodeCssVars", () => ({
  useCodeCssVars: vi.fn(),
}));

vi.mock("@app/hooks/useDictationController", () => ({
  useDictationController: vi.fn(),
}));

vi.mock("@app/hooks/useLiquidGlassEffect", () => ({
  useLiquidGlassEffect: vi.fn(),
}));

vi.mock("@app/runtimeCompatibility", () => ({
  getCachedRuntimeCompatibility: vi.fn(),
}));

vi.mock("@/features/debug/hooks/useDebugLog", () => ({
  useDebugLog: vi.fn(),
}));

describe("useAppBootstrap", () => {
  const addDebugEntryMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(isMobilePlatform).mockReturnValue(false);
    vi.mocked(useAppSettingsController).mockReturnValue({
      appSettings: { theme: "system" },
      reduceTransparency: false,
      setReduceTransparency: vi.fn(),
      queueSaveSettings: vi.fn(),
      doctor: vi.fn(),
      codexUpdate: vi.fn(),
      appSettingsLoading: false,
      uiScale: 1,
      scaleShortcutTitle: "Scale shortcut",
      scaleShortcutText: "Use Command +/-",
    } as any);
    vi.mocked(useCodeCssVars).mockReturnValue(undefined);
    vi.mocked(useDictationController).mockReturnValue({ dictationReady: true } as any);
    vi.mocked(useLiquidGlassEffect).mockReturnValue(undefined);
    vi.mocked(getCachedRuntimeCompatibility).mockReturnValue(null);
    vi.mocked(useDebugLog).mockReturnValue({
      debugOpen: false,
      setDebugOpen: vi.fn(),
      debugEntries: [],
      hasDebugAlerts: false,
      showDebugButton: false,
      addDebugEntry: addDebugEntryMock,
      handleCopyDebug: vi.fn(),
      clearDebugEntries: vi.fn(),
    });
  });

  it("preserves the existing transparency behavior outside Monterey compatibility mode", () => {
    const { result } = renderHook(() => useAppBootstrap());

    expect(result.current.shouldReduceTransparency).toBe(false);
    expect(useLiquidGlassEffect).toHaveBeenCalledWith(
      expect.objectContaining({
        reduceTransparency: false,
        montereyCompatibilityMode: false,
        onDebug: addDebugEntryMock,
      }),
    );
  });

  it("forces reduced transparency when Monterey compatibility mode is active", () => {
    vi.mocked(getCachedRuntimeCompatibility).mockReturnValue({
      platform: "macos",
      macosVersion: "12.6.8",
      webkitVersion: "613.1.17",
      supported: true,
      reason: "supported_monterey_compat_mode",
      forceReducedTransparency: true,
    });

    const { result } = renderHook(() => useAppBootstrap());

    expect(result.current.shouldReduceTransparency).toBe(true);
    expect(result.current.montereyCompatibilityMode).toBe(true);
    expect(useLiquidGlassEffect).toHaveBeenCalledWith(
      expect.objectContaining({
        reduceTransparency: true,
        montereyCompatibilityMode: true,
        onDebug: addDebugEntryMock,
      }),
    );
    expect(addDebugEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "runtime/compatibility",
        payload: expect.objectContaining({
          reason: "supported_monterey_compat_mode",
          forceReducedTransparency: true,
        }),
      }),
    );
  });
});
