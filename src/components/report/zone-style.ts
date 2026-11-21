import type { DictKey } from "@/lib/i18n";
import type { Zone } from "@/lib/health/zones";

export const ZONE_STYLE: Record<
  Zone,
  { card: string; badge: string; ink: string; dot: string; title: DictKey; label: DictKey; emoji: string }
> = {
  green: {
    card: "border-zone-green bg-zone-green-soft",
    badge: "bg-zone-green text-primary-foreground",
    ink: "text-zone-green-ink",
    dot: "bg-zone-green",
    title: "zoneGreenTitle",
    label: "zoneGreenLabel",
    emoji: "🟢",
  },
  yellow: {
    card: "border-zone-yellow bg-zone-yellow-soft",
    badge: "bg-zone-yellow text-saffron-foreground",
    ink: "text-zone-yellow-ink",
    dot: "bg-zone-yellow",
    title: "zoneYellowTitle",
    label: "zoneYellowLabel",
    emoji: "🟡",
  },
  red: {
    card: "border-zone-red bg-zone-red-soft",
    badge: "bg-zone-red text-destructive-foreground",
    ink: "text-zone-red-ink",
    dot: "bg-zone-red",
    title: "zoneRedTitle",
    label: "zoneRedLabel",
    emoji: "🔴",
  },
};

const OPEN_HIGH = 1_000_000_000;

export function formatNumber(n: number) {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}

export function formatRange(low: number, high: number) {
  if (high >= OPEN_HIGH) return `≥ ${formatNumber(low)}`;
  if (low <= 0) return `≤ ${formatNumber(high)}`;
  return `${formatNumber(low)} – ${formatNumber(high)}`;
}
