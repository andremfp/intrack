/**
 * Rounds a raw maximum up to a "nice" axis bound (1/2/5 × 10ⁿ) so the Y axis
 * ends on a readable number.
 *
 * Returns 1 for non-positive input: an all-zero series would otherwise produce
 * a degenerate [0, 0] domain, which collapses the scale so every tick maps to
 * the same coordinate — making Recharts render duplicate `0` ticks (and emit
 * "two children with the same key" warnings).
 */
export function getNiceMax(max: number): number {
  if (max <= 0) return 1;

  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const normalized = max / magnitude;

  let nice: number;
  if (normalized <= 1.5) nice = 1 * magnitude;
  else if (normalized <= 3) nice = 2 * magnitude;
  else if (normalized <= 7) nice = 5 * magnitude;
  else nice = 10 * magnitude;

  return nice;
}

/**
 * Builds the compact-mode Y-axis ticks (bottom / middle / top).
 *
 * De-duplicates the result so a small `niceMax` — e.g. 1, where the midpoint
 * rounds up onto the top tick — can never produce repeated tick values, which
 * would collide as React keys on the axis.
 */
export function getCompactTicks(niceMax: number): number[] {
  return Array.from(new Set([0, Math.round(niceMax / 2), niceMax]));
}
