import type { Band } from "./clinical-db";

export type Zone = "green" | "yellow" | "red";
export type Direction = "normal" | "high" | "low";

/**
 * Fallback only, for tests missing from the clinical table: how far outside the
 * lab's printed range a value may sit (relative to the nearest limit) and still be Yellow.
 */
export const YELLOW_TOLERANCE = 0.3;

export function getDirection(value: number, low: number, high: number): Direction {
  if (value > high) return "high";
  if (value < low) return "low";
  return "normal";
}

/** Primary rule: hard-coded clinical bands. */
export function classifyBand(value: number, band: Band): Zone {
  if (value >= band.low && value <= band.high) return "green";
  if (value > band.high) return value <= band.yellowHigh ? "yellow" : "red";
  return value >= band.yellowLow ? "yellow" : "red";
}

/** Fallback rule using the lab's printed reference range. */
export function classifyZone(value: number, low: number, high: number): Zone {
  const direction = getDirection(value, low, high);
  if (direction === "normal") return "green";
  const limit = direction === "high" ? high : low;
  const scale = limit > 0 ? limit : high - low || 1;
  const deviation = Math.abs(value - limit) / scale;
  return deviation <= YELLOW_TOLERANCE ? "yellow" : "red";
}

export function overallZone(zones: Zone[]): Zone {
  if (zones.includes("red")) return "red";
  if (zones.includes("yellow")) return "yellow";
  return "green";
}
