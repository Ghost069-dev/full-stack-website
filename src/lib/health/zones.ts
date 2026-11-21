export type Zone = "green" | "yellow" | "red";
export type Direction = "normal" | "high" | "low";

/**
 * How far outside the reference range a value may sit (relative to the
 * nearest range limit) and still be Yellow instead of Red. 30% keeps
 * fasting sugar 128 (limit 100) Yellow and creatinine 3.4 (limit 1.3) Red.
 */
export const YELLOW_TOLERANCE = 0.3;

export function getDirection(value: number, low: number, high: number): Direction {
  if (value > high) return "high";
  if (value < low) return "low";
  return "normal";
}

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
