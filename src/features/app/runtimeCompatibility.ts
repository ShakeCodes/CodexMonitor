import type { RuntimeCompatibility } from "@/types";
import { getRuntimeCompatibility as fetchRuntimeCompatibility } from "@services/tauri";

let cachedRuntimeCompatibility: RuntimeCompatibility | null = null;
let pendingRuntimeCompatibility: Promise<RuntimeCompatibility> | null = null;

function parseMacOsMajor(version: string | null | undefined): number | null {
  if (!version) {
    return null;
  }
  const major = Number.parseInt(version.split(".")[0] ?? "", 10);
  return Number.isFinite(major) ? major : null;
}

function supportsCss(property: string, value: string): boolean {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
    return true;
  }
  return CSS.supports(property, value);
}

function supportsMontereyColorMix(): boolean {
  return supportsCss("color", "color-mix(in srgb, black, white)");
}

function supportsDynamicViewportHeight(): boolean {
  return supportsCss("height", "100dvh");
}

export function resolveRuntimeCompatibility(
  runtimeCompatibility: RuntimeCompatibility,
): RuntimeCompatibility {
  if (!runtimeCompatibility.supported || runtimeCompatibility.platform !== "macos") {
    return runtimeCompatibility;
  }

  const macosMajor = parseMacOsMajor(runtimeCompatibility.macosVersion);
  if (macosMajor !== 12) {
    return runtimeCompatibility;
  }

  const colorMixSupported = supportsMontereyColorMix();
  // Keep a non-blocking viewport probe for older Monterey WKWebView builds.
  supportsDynamicViewportHeight();

  if (!colorMixSupported) {
    return {
      ...runtimeCompatibility,
      supported: false,
      reason: "unsupported_monterey_webkit",
      forceReducedTransparency: false,
    };
  }

  return {
    ...runtimeCompatibility,
    supported: true,
    reason: "supported_monterey_compat_mode",
    forceReducedTransparency: true,
  };
}

export async function loadRuntimeCompatibility(): Promise<RuntimeCompatibility> {
  if (cachedRuntimeCompatibility) {
    return cachedRuntimeCompatibility;
  }

  if (!pendingRuntimeCompatibility) {
    pendingRuntimeCompatibility = fetchRuntimeCompatibility()
      .then((runtimeCompatibility) => {
        const resolved = resolveRuntimeCompatibility(runtimeCompatibility);
        cachedRuntimeCompatibility = resolved;
        return resolved;
      })
      .finally(() => {
        pendingRuntimeCompatibility = null;
      });
  }

  return pendingRuntimeCompatibility;
}

export function getCachedRuntimeCompatibility(): RuntimeCompatibility | null {
  return cachedRuntimeCompatibility;
}

export function setCachedRuntimeCompatibility(
  runtimeCompatibility: RuntimeCompatibility | null,
) {
  cachedRuntimeCompatibility = runtimeCompatibility;
  if (!runtimeCompatibility) {
    pendingRuntimeCompatibility = null;
  }
}

export function formatRuntimeCompatibilityLabel(
  runtimeCompatibility: RuntimeCompatibility | null,
): string {
  if (!runtimeCompatibility) {
    return "Unavailable";
  }
  switch (runtimeCompatibility.reason) {
    case "unsupported_monterey_webkit":
      return "Unsupported Monterey WebKit";
    case "supported_monterey_compat_mode":
      return "Monterey compatibility mode";
    default:
      return "Supported";
  }
}
