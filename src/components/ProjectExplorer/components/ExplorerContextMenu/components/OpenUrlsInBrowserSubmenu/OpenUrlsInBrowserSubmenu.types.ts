import type { BrowserApp } from "@/tauri-api-bridge";

export interface OpenUrlsInBrowserSubmenuProps {
  browsers: BrowserApp[];
  onOpen: (browser?: BrowserApp) => void;
}
