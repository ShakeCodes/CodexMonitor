/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveRuntimeCompatibility } from "./runtimeCompatibility";

vi.mock("@services/tauri", () => ({
  getRuntimeCompatibility: vi.fn(),
}));

describe("resolveRuntimeCompatibility", () => {
  const originalCss = globalThis.CSS;

  beforeEach(() => {
    globalThis.CSS = {
      supports: vi.fn((property: string, value: string) => {
        if (property === "color" && value === "color-mix(in srgb, black, white)") {
          return true;
        }
        if (property === "height" && value === "100dvh") {
          return true;
        }
        return false;
      }),
    } as typeof CSS;
  });

  afterEach(() => {
    globalThis.CSS = originalCss;
  });

  it("marks Monterey without color-mix support as unsupported", () => {
    globalThis.CSS = {
      supports: vi.fn((property: string, value: string) => {
        if (property === "color" && value === "color-mix(in srgb, black, white)") {
          return false;
        }
        if (property === "height" && value === "100dvh") {
          return false;
        }
        return false;
      }),
    } as typeof CSS;

    expect(
      resolveRuntimeCompatibility({
        platform: "macos",
        macosVersion: "12.6.8",
        webkitVersion: "612.6.0",
        supported: true,
        reason: "supported_monterey_compat_mode",
        forceReducedTransparency: true,
      }),
    ).toEqual(
      expect.objectContaining({
        supported: false,
        reason: "unsupported_monterey_webkit",
        forceReducedTransparency: false,
      }),
    );
  });

  it("keeps Monterey on the supported compatibility path when color-mix is available", () => {
    expect(
      resolveRuntimeCompatibility({
        platform: "macos",
        macosVersion: "12.6.8",
        webkitVersion: "613.1.17",
        supported: true,
        reason: "supported",
        forceReducedTransparency: false,
      }),
    ).toEqual(
      expect.objectContaining({
        supported: true,
        reason: "supported_monterey_compat_mode",
        forceReducedTransparency: true,
      }),
    );
  });

  it("leaves newer macOS runtimes untouched", () => {
    expect(
      resolveRuntimeCompatibility({
        platform: "macos",
        macosVersion: "13.6.7",
        webkitVersion: "616.1.23",
        supported: true,
        reason: "supported",
        forceReducedTransparency: false,
      }),
    ).toEqual(
      expect.objectContaining({
        supported: true,
        reason: "supported",
        forceReducedTransparency: false,
      }),
    );
  });
});
