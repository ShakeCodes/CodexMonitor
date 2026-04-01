import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { RuntimeCompatibility } from "@/types";
import {
  formatRuntimeCompatibilityLabel,
  getCachedRuntimeCompatibility,
  loadRuntimeCompatibility,
} from "@app/runtimeCompatibility";

const GITHUB_URL = "https://github.com/Dimillian/CodexMonitor";
const TWITTER_URL = "https://x.com/dimillian";

export function AboutView() {
  const [version, setVersion] = useState<string | null>(null);
  const [runtimeCompatibility, setRuntimeCompatibility] = useState<RuntimeCompatibility | null>(
    () => getCachedRuntimeCompatibility(),
  );

  const handleOpenGitHub = () => {
    void openUrl(GITHUB_URL);
  };

  const handleOpenTwitter = () => {
    void openUrl(TWITTER_URL);
  };

  useEffect(() => {
    let active = true;
    const fetchVersion = async () => {
      try {
        const value = await getVersion();
        if (active) {
          setVersion(value);
        }
      } catch {
        if (active) {
          setVersion(null);
        }
      }
    };

    void fetchVersion();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const cachedRuntimeCompatibility = getCachedRuntimeCompatibility();
    if (cachedRuntimeCompatibility) {
      setRuntimeCompatibility(cachedRuntimeCompatibility);
      return () => {
        active = false;
      };
    }

    const fetchRuntimeCompatibility = async () => {
      try {
        const value = await loadRuntimeCompatibility();
        if (active) {
          setRuntimeCompatibility(value);
        }
      } catch {
        if (active) {
          setRuntimeCompatibility(null);
        }
      }
    };

    void fetchRuntimeCompatibility();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="about">
      <div className="about-card">
        <div className="about-header">
          <img
            className="about-icon"
            src="/app-icon.png"
            alt="Codex Monitor icon"
          />
          <div className="about-title">Codex Monitor</div>
        </div>
        <div className="about-version">
          {version ? `Version ${version}` : "Version —"}
        </div>
        <div className="about-version">
          {`Runtime ${formatRuntimeCompatibilityLabel(runtimeCompatibility)}`}
        </div>
        {runtimeCompatibility?.platform === "macos" && (
          <div className="about-version">
            {`macOS ${runtimeCompatibility.macosVersion ?? "unknown"} • WebKit ${
              runtimeCompatibility.webkitVersion ?? "unknown"
            }`}
          </div>
        )}
        <div className="about-tagline">
          Monitor the situation of your Codex agents
        </div>
        <div className="about-divider" />
        <div className="about-links">
          <button
            type="button"
            className="about-link"
            onClick={handleOpenGitHub}
          >
            GitHub
          </button>
          <span className="about-link-sep">|</span>
          <button
            type="button"
            className="about-link"
            onClick={handleOpenTwitter}
          >
            Twitter
          </button>
        </div>
        <div className="about-footer">Made with ♥ by Codex & Dimillian</div>
      </div>
    </div>
  );
}
