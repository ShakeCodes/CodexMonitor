/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";

const sentryInitMock = vi.fn();
const sentryMetricsCountMock = vi.fn();
const renderMock = vi.fn();
const createRootMock = vi.fn(() => ({
  render: renderMock,
}));
const loadRuntimeCompatibilityMock = vi.fn();
const AppMock = vi.fn(() => null);
const UnsupportedRuntimeViewMock = vi.fn(() => null);

vi.mock("@sentry/react", () => ({
  init: sentryInitMock,
  metrics: {
    count: sentryMetricsCountMock,
  },
}));

vi.mock("react-dom/client", () => ({
  default: {
    createRoot: createRootMock,
  },
  createRoot: createRootMock,
}));

vi.mock("@app/runtimeCompatibility", () => ({
  loadRuntimeCompatibility: loadRuntimeCompatibilityMock,
}));

vi.mock("@app/bootstrap/UnsupportedRuntimeView", () => ({
  UnsupportedRuntimeView: UnsupportedRuntimeViewMock,
}));

vi.mock("./App", () => ({
  default: AppMock,
}));

describe("main bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();
    sentryInitMock.mockClear();
    sentryMetricsCountMock.mockClear();
    createRootMock.mockClear();
    renderMock.mockClear();
    loadRuntimeCompatibilityMock.mockReset();
    AppMock.mockClear();
    UnsupportedRuntimeViewMock.mockClear();
    loadRuntimeCompatibilityMock.mockResolvedValue({
      platform: "linux",
      macosVersion: null,
      webkitVersion: null,
      supported: true,
      reason: "supported",
      forceReducedTransparency: false,
    });
    document.body.innerHTML = '<div id="root"></div>';
  });

  it("initializes sentry and records app_open", async () => {
    await import("./main");
    await vi.dynamicImportSettled();

    expect(sentryInitMock).toHaveBeenCalledTimes(1);
    expect(sentryInitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: expect.stringContaining("ingest.us.sentry.io"),
        enabled: true,
        release: expect.any(String),
      }),
    );
    expect(sentryMetricsCountMock).toHaveBeenCalledTimes(1);
    expect(sentryMetricsCountMock).toHaveBeenCalledWith(
      "app_open",
      1,
      expect.objectContaining({
        attributes: expect.objectContaining({
          platform: "macos",
        }),
      }),
    );
  });

  it("renders the main app on supported runtimes", async () => {
    await import("./main");
    await vi.dynamicImportSettled();

    const renderedTree = renderMock.mock.calls.at(-1)?.[0];
    expect(renderedTree?.props.children.type).toBe(AppMock);
    expect(UnsupportedRuntimeViewMock).not.toHaveBeenCalled();
  });

  it("renders the unsupported runtime screen for Monterey without the required WebKit support", async () => {
    loadRuntimeCompatibilityMock.mockResolvedValue({
      platform: "macos",
      macosVersion: "12.6.8",
      webkitVersion: "612.6.0",
      supported: false,
      reason: "unsupported_monterey_webkit",
      forceReducedTransparency: false,
    });

    await import("./main");
    await vi.dynamicImportSettled();

    const renderedTree = renderMock.mock.calls.at(-1)?.[0];
    expect(renderedTree?.props.children.type).toBe(UnsupportedRuntimeViewMock);
    expect(renderedTree?.props.children.props.runtimeCompatibility).toEqual(
      expect.objectContaining({
        reason: "unsupported_monterey_webkit",
        macosVersion: "12.6.8",
        webkitVersion: "612.6.0",
      }),
    );
    expect(AppMock).not.toHaveBeenCalled();
  });

  it("still boots the app for supported Monterey compatibility mode", async () => {
    loadRuntimeCompatibilityMock.mockResolvedValue({
      platform: "macos",
      macosVersion: "12.6.8",
      webkitVersion: "613.1.17",
      supported: true,
      reason: "supported_monterey_compat_mode",
      forceReducedTransparency: true,
    });

    await import("./main");
    await vi.dynamicImportSettled();

    const renderedTree = renderMock.mock.calls.at(-1)?.[0];
    expect(renderedTree?.props.children.type).toBe(AppMock);
    expect(UnsupportedRuntimeViewMock).not.toHaveBeenCalled();
  });
});
