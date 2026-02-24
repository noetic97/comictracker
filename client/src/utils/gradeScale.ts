/**
 * Grade scale: 9.4 baseline formula for estimated value by grade.
 * value(grade) = baseValue_9_4 × multiplier(grade)
 */

import { Comic } from "../types/comic";

export interface GradeScaleEntry {
  gradeNumeric: number;
  label: string;
  multiplier: number;
}

/** Fixed scale: 25 grades from 10.0 down to 0.5, multipliers relative to 9.4 = 1.0 */
export const GRADE_SCALE: GradeScaleEntry[] = [
  { gradeNumeric: 10.0, label: "Gem Mint", multiplier: 1.5 },
  { gradeNumeric: 9.9, label: "Mint", multiplier: 1.3 },
  { gradeNumeric: 9.8, label: "Mint -", multiplier: 1.25 },
  { gradeNumeric: 9.6, label: "Near Mint +", multiplier: 1.1 },
  { gradeNumeric: 9.4, label: "Near Mint", multiplier: 1.0 },
  { gradeNumeric: 9.2, label: "Near Mint -", multiplier: 0.97 },
  { gradeNumeric: 9.0, label: "Very Fine/Near Mint", multiplier: 0.95 },
  { gradeNumeric: 8.5, label: "Very Fine +", multiplier: 0.9 },
  { gradeNumeric: 8.0, label: "Very Fine", multiplier: 0.85 },
  { gradeNumeric: 7.5, label: "Very Fine -", multiplier: 0.7 },
  { gradeNumeric: 7.0, label: "Fine/Very Fine", multiplier: 0.55 },
  { gradeNumeric: 6.5, label: "Fine +", multiplier: 0.4 },
  { gradeNumeric: 6.0, label: "Fine", multiplier: 0.3 },
  { gradeNumeric: 5.5, label: "Fine -", multiplier: 0.21 },
  { gradeNumeric: 5.0, label: "Very Good/Fine", multiplier: 0.19 },
  { gradeNumeric: 4.5, label: "Very Good +", multiplier: 0.17 },
  { gradeNumeric: 4.0, label: "Very Good", multiplier: 0.15 },
  { gradeNumeric: 3.5, label: "Very Good -", multiplier: 0.13 },
  { gradeNumeric: 3.0, label: "Good/Very Good", multiplier: 0.11 },
  { gradeNumeric: 2.5, label: "Good +", multiplier: 0.09 },
  { gradeNumeric: 2.0, label: "Good", multiplier: 0.07 },
  { gradeNumeric: 1.8, label: "Good -", multiplier: 0.06 },
  { gradeNumeric: 1.4, label: "Fair/Good", multiplier: 0.05 },
  { gradeNumeric: 1.0, label: "Fair", multiplier: 0.03 },
  { gradeNumeric: 0.5, label: "Poor", multiplier: 2 / 300 },
];

/** Canonical grade labels for enum matching (storage = scale label) */
export const VALID_GRADE_LABELS: string[] = GRADE_SCALE.map((e) => e.label);

/** Options for grade select: value = scale label (stored), label = "Label gradeNum" (display) */
export const GRADE_SELECT_OPTIONS: { value: string; label: string }[] =
  GRADE_SCALE.map((e) => ({
    value: e.label,
    label: `${e.label} ${e.gradeNumeric}`,
  }));

/**
 * Match raw input to a canonical grade label (trim + case-insensitive, or numeric).
 * Returns the scale label if match, else null.
 */
export function matchGradeFromInput(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const normalized = trimmed.toLowerCase().replace(/\s+/g, " ");
  for (const entry of GRADE_SCALE) {
    const entryNorm = entry.label.trim().toLowerCase().replace(/\s+/g, " ");
    if (normalized === entryNorm) return entry.label;
  }
  const numMatch = trimmed.match(/\b(10\.0|9\.\d|8\.\d|7\.\d|6\.\d|5\.\d|4\.\d|3\.\d|2\.\d|1\.\d|0\.5)\b/);
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    const entry = GRADE_SCALE.find((e) => e.gradeNumeric === num);
    if (entry) return entry.label;
  }
  return null;
}

/** Find scale entry by numeric grade */
export function getScaleEntry(gradeNumeric: number): GradeScaleEntry | undefined {
  return GRADE_SCALE.find((e) => e.gradeNumeric === gradeNumeric);
}

/** Estimated value for a grade given the 9.4 baseline value */
export function getEstimatedValue(
  baseValue9_4: number,
  gradeNumeric: number
): number {
  const entry = getScaleEntry(gradeNumeric);
  if (!entry) return baseValue9_4;
  return baseValue9_4 * entry.multiplier;
}

/** Parse comic.grade to a scale numeric (e.g. "9.8", "CGC 9.8 SS" -> 9.8). Returns null if no match. */
function parseGradeToNumeric(gradeStr: string | undefined): number | null {
  if (!gradeStr || typeof gradeStr !== "string") return null;
  const s = gradeStr.trim();
  if (!s) return null;
  // Match first number that looks like a grade: 10.0, 9.8, 9.4, 0.5 etc.
  const match = s.match(/\b(10\.0|9\.\d|8\.\d|7\.\d|6\.\d|5\.\d|4\.\d|3\.\d|2\.\d|1\.\d|0\.5)\b/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  const found = GRADE_SCALE.some((e) => e.gradeNumeric === num);
  return found ? num : null;
}

/** Normalize for label comparison: trim, collapse spaces, lowercase */
function normalizeGradeLabel(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Find scale entry for a comic's grade string.
 * 1) Try parsing a numeric grade (e.g. "9.8", "CGC 9.8 SS").
 * 2) Else match by label (e.g. "Very Good/Fine" -> 5.0 entry) so text-only grades work.
 */
function getScaleEntryForGrade(gradeStr: string | undefined): GradeScaleEntry | null {
  if (!gradeStr || typeof gradeStr !== "string") return null;
  const trimmed = gradeStr.trim();
  if (!trimmed) return null;

  const gradeNum = parseGradeToNumeric(gradeStr);
  if (gradeNum !== null) {
    const entry = getScaleEntry(gradeNum);
    return entry ?? null;
  }

  const normalized = normalizeGradeLabel(trimmed);
  for (const entry of GRADE_SCALE) {
    const entryLabelNorm = normalizeGradeLabel(entry.label);
    if (normalized === entryLabelNorm) return entry;
    if (normalized.startsWith(entryLabelNorm) || entryLabelNorm.startsWith(normalized)) return entry;
  }
  return null;
}

/**
 * Get the 9.4 baseline value for a comic.
 * The comic's currentValue is the value *at its grade*. So we reverse: base_9_4 = currentValue / multiplier(grade).
 * - No currentValue -> null.
 * - No grade or grade not on scale -> treat currentValue as 9.4 (e.g. want list).
 * - Grade matches scale -> baseValue_9_4 = currentValue / multiplier(grade).
 */
export function getBaseValue9_4(comic: Comic): number | null {
  if (comic.currentValue == null || comic.currentValue === undefined)
    return null;
  const entry = getScaleEntryForGrade(comic.grade);
  if (!entry || entry.multiplier === 0) return comic.currentValue;
  return comic.currentValue / entry.multiplier;
}
