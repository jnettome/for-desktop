import { app } from "electron";

import { config } from "./config";

export const OFFICIAL_SERVER_URL = "https://stoat.chat/app";

/**
 * Resolve the web client URL: CLI override, then stored instance, then official.
 */
export function getBuildUrl(): URL {
  if (app.commandLine.hasSwitch("force-server")) {
    return new URL(app.commandLine.getSwitchValue("force-server"));
  }

  if (config.serverUrl) {
    return new URL(config.serverUrl);
  }

  return new URL(OFFICIAL_SERVER_URL);
}

/**
 * First boot shows the local setup page unless a session override is set.
 */
export function shouldShowSetup(): boolean {
  return config.firstLaunch && !app.commandLine.hasSwitch("force-server");
}

/**
 * Validate and normalise an instance URL.
 */
export function normalizeServerUrl(input: string): string {
  const trimmed = input.trim();

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("Enter a valid URL, for example https://your.domain");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("URL must start with http:// or https://");
  }

  return url.toString();
}

/**
 * Allow the local setup page and the configured remote instance origins.
 */
export function isAllowedNavigationUrl(navigationUrl: string): boolean {
  const dest = new URL(navigationUrl);

  if (dest.protocol === "file:") {
    return true;
  }

  if (
    typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== "undefined" &&
    MAIN_WINDOW_VITE_DEV_SERVER_URL &&
    dest.origin === new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL).origin
  ) {
    return true;
  }

  if (dest.origin === getBuildUrl().origin) {
    return true;
  }

  if (config.serverUrl) {
    try {
      if (dest.origin === new URL(config.serverUrl).origin) {
        return true;
      }
    } catch {
      // ignore invalid stored URL
    }
  }

  return false;
}
