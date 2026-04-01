use crate::types::{RuntimeCompatibility, RuntimeCompatibilityReason};

#[cfg(target_os = "macos")]
use plist::Value;
#[cfg(target_os = "macos")]
use std::path::Path;
#[cfg(target_os = "macos")]
use std::process::Command;

#[cfg(target_os = "macos")]
const WEBKIT_INFO_PLIST_PATH: &str = "/System/Library/Frameworks/WebKit.framework/Resources/Info.plist";

fn current_platform() -> &'static str {
    if cfg!(target_os = "macos") {
        "macos"
    } else if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "linux") {
        "linux"
    } else if cfg!(target_os = "ios") {
        "ios"
    } else if cfg!(target_os = "android") {
        "android"
    } else {
        "unknown"
    }
}

#[cfg(target_os = "macos")]
fn read_command_output(program: &str, args: &[&str]) -> Option<String> {
    let output = Command::new(program).args(args).output().ok()?;
    if !output.status.success() {
        return None;
    }
    let text = String::from_utf8(output.stdout).ok()?;
    let trimmed = text.trim();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_string())
    }
}

#[cfg(target_os = "macos")]
fn read_macos_version() -> Option<String> {
    read_command_output("/usr/bin/sw_vers", &["-productVersion"])
}

#[cfg(target_os = "macos")]
fn read_webkit_version() -> Option<String> {
    let value = Value::from_file(Path::new(WEBKIT_INFO_PLIST_PATH)).ok()?;
    let dictionary = value.as_dictionary()?;
    dictionary
        .get("CFBundleVersion")
        .and_then(|value| value.as_string())
        .map(str::to_string)
}

#[cfg(target_os = "macos")]
fn parse_major_version(version: Option<&str>) -> Option<u64> {
    version?
        .split('.')
        .next()
        .and_then(|segment| segment.parse::<u64>().ok())
}

fn build_runtime_compatibility() -> RuntimeCompatibility {
    let platform = current_platform().to_string();

    #[cfg(target_os = "macos")]
    {
        let macos_version = read_macos_version();
        let webkit_version = read_webkit_version();
        let monterey = parse_major_version(macos_version.as_deref()) == Some(12);

        return RuntimeCompatibility {
            platform,
            macos_version,
            webkit_version,
            supported: true,
            reason: if monterey {
                RuntimeCompatibilityReason::SupportedMontereyCompatMode
            } else {
                RuntimeCompatibilityReason::Supported
            },
            force_reduced_transparency: monterey,
        };
    }

    #[cfg(not(target_os = "macos"))]
    {
        RuntimeCompatibility {
            platform,
            macos_version: None,
            webkit_version: None,
            supported: true,
            reason: RuntimeCompatibilityReason::Supported,
            force_reduced_transparency: false,
        }
    }
}

#[tauri::command]
pub(crate) async fn get_runtime_compatibility() -> RuntimeCompatibility {
    build_runtime_compatibility()
}
