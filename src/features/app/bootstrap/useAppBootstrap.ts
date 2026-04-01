import { useEffect, useRef } from "react";
import { isMobilePlatform } from "@utils/platformPaths";
import { useDebugLog } from "@/features/debug/hooks/useDebugLog";
import { useAppSettingsController } from "@app/hooks/useAppSettingsController";
import { useCodeCssVars } from "@app/hooks/useCodeCssVars";
import { useDictationController } from "@app/hooks/useDictationController";
import { useLiquidGlassEffect } from "@app/hooks/useLiquidGlassEffect";
import { getCachedRuntimeCompatibility } from "@app/runtimeCompatibility";

export function useAppBootstrap() {
  const appSettingsState = useAppSettingsController();
  useCodeCssVars(appSettingsState.appSettings);

  const dictationState = useDictationController(appSettingsState.appSettings);
  const debugState = useDebugLog();
  const runtimeCompatibility = getCachedRuntimeCompatibility();
  const loggedRuntimeReasonRef = useRef<string | null>(null);
  const montereyCompatibilityMode =
    runtimeCompatibility?.reason === "supported_monterey_compat_mode";

  const shouldReduceTransparency =
    appSettingsState.reduceTransparency ||
    isMobilePlatform() ||
    Boolean(runtimeCompatibility?.forceReducedTransparency);

  useEffect(() => {
    if (
      !runtimeCompatibility ||
      runtimeCompatibility.reason === "supported" ||
      loggedRuntimeReasonRef.current === runtimeCompatibility.reason
    ) {
      return;
    }
    loggedRuntimeReasonRef.current = runtimeCompatibility.reason;
    debugState.addDebugEntry({
      id: `runtime-compatibility-${runtimeCompatibility.reason}`,
      timestamp: Date.now(),
      source: "client",
      label: "runtime/compatibility",
      payload: runtimeCompatibility,
    });
  }, [debugState.addDebugEntry, runtimeCompatibility]);

  useLiquidGlassEffect({
    reduceTransparency: shouldReduceTransparency,
    montereyCompatibilityMode,
    onDebug: debugState.addDebugEntry,
  });

  return {
    ...appSettingsState,
    ...dictationState,
    ...debugState,
    runtimeCompatibility,
    montereyCompatibilityMode,
    shouldReduceTransparency,
  };
}
