import type { TimingPhase } from "./TimingBreakdownChart.types";

export const TIMING_PHASES: TimingPhase[] = [
  { key: "dnsMs", label: "DNS", color: "#a78bfa" },
  { key: "connectMs", label: "Connect", color: "#60a5fa" },
  { key: "tlsMs", label: "TLS", color: "#34d399" },
  { key: "ttfbMs", label: "TTFB", color: "#fbbf24" },
  { key: "downloadMs", label: "Download", color: "#f472b6" },
];
