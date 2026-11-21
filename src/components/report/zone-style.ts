import type { DictKey } from "@/lib/i18n";
import type { Band } from "@/lib/health/clinical-db";
import { OPEN_HIGH, fmt } from "@/lib/health/report";
import type { Zone } from "@/lib/health/zones";

export const ZONE_STYLE: Record<Zone, { card: string; badge: string; ink: string; dot: string; title: DictKey; emoji: string }> = {
  green: {
    card: "border-zone-green bg-zone-green-soft",
    badge: "bg-zone-green text-primary-foreground",
    ink: "text-zone-green-ink",
    dot: "bg-zone-green",
    title: "zoneGreenTitle",
    emoji: "🟢",
  },
  yellow: {
    card: "border-zone-yellow bg-zone-yellow-soft",
    badge: "bg-zone-yellow text-saffron-foreground",
    ink: "text-zone-yellow-ink",
    dot: "bg-zone-yellow",
    title: "zoneYellowTitle",
    emoji: "🟡",
  },
  red: {
    card: "border-zone-red bg-zone-red-soft",
    badge: "bg-zone-red text-destructive-foreground",
    ink: "text-zone-red-ink",
    dot: "bg-zone-red",
    title: "zoneRedTitle",
    emoji: "🔴",
  },
};

export const formatNumber = fmt;

export function formatRange(low: number, high: number) {
  if (high >= OPEN_HIGH) return `≥ ${fmt(low)}`;
  if (low <= 0) return `≤ ${fmt(high)}`;
  return `${fmt(low)} – ${fmt(high)}`;
}

/** Compact, language-neutral rule line, e.g. "🟡 99–125 · 🔴 >125". */
export function bandRule(band: Band) {
  const yellow: string[] = [];
  const red: string[] = [];
  if (band.yellowLow < band.low) {
    yellow.push(`${fmt(band.yellowLow)}–${fmt(band.low)}`);
    red.push(`<${fmt(band.yellowLow)}`);
  }
  if (band.yellowHigh > band.high && band.high < OPEN_HIGH) {
    yellow.push(`${fmt(band.high)}–${fmt(band.yellowHigh)}`);
    red.push(`>${fmt(band.yellowHigh)}`);
  }
  return [yellow.length ? `🟡 ${yellow.join(", ")}` : "", red.length ? `🔴 ${red.join(", ")}` : ""].filter(Boolean).join("  ·  ");
}
