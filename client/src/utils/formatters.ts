/**
 * Format duration in milliseconds to human readable string
 */
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

/**
 * Calculate processing rate (items per second)
 */
export const calculateRate = (
  itemsProcessed: number,
  timeElapsed: number
): number => {
  if (timeElapsed === 0) return 0;
  return Math.round((itemsProcessed / timeElapsed) * 1000); // Convert ms to seconds
};

/**
 * Calculate estimated time remaining
 */
export const calculateETA = (
  processed: number,
  total: number,
  startTime: number
): string => {
  if (processed === 0) return "Calculating...";

  const elapsed = Date.now() - startTime;
  const rate = processed / elapsed; // items per ms
  const remaining = total - processed;
  const eta = remaining / rate;

  return formatDuration(eta);
};

/**
 * Format percentage with specified decimal places
 */
export const formatPercentage = (
  value: number,
  total: number,
  decimals: number = 1
): string => {
  if (total === 0) return "0%";
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Format numbers with thousands separators
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Format currency values
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format file size in bytes to human readable string
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(1)} ${sizes[i]}`;
};

/**
 * Format timestamp to local string
 */
export const formatTimestamp = (timestamp: string | number | Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/**
 * Create a progress message string
 */
export const createProgressMessage = (
  current: number,
  total: number,
  itemName: string = "items"
): string => {
  const percentage = formatPercentage(current, total);
  return `${formatNumber(current)} / ${formatNumber(
    total
  )} ${itemName} (${percentage})`;
};

/**
 * Truncate text to specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
};

/**
 * Pluralize words based on count
 */
export const pluralize = (
  count: number,
  singular: string,
  plural?: string
): string => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};

/**
 * Format import statistics for display
 */
export const formatImportStats = (stats: {
  processed: number;
  created: number;
  updated: number;
  errors: number;
  processingTime: number;
}) => {
  const rate = calculateRate(stats.processed, stats.processingTime);
  const duration = formatDuration(stats.processingTime);

  return {
    processed: formatNumber(stats.processed),
    created: formatNumber(stats.created),
    updated: formatNumber(stats.updated),
    errors: formatNumber(stats.errors),
    duration,
    rate: `${formatNumber(rate)} comics/sec`,
  };
};

/**
 * Grade mapping utilities for comic condition grades
 */
export const GRADE_DISPLAY_MAP: Record<string, string> = {
  // Numeric grades
  GRADE_10_0: "10.0",
  GRADE_9_9: "9.9",
  GRADE_9_8: "9.8",
  GRADE_9_6: "9.6",
  GRADE_9_4: "9.4",
  GRADE_9_2: "9.2",
  GRADE_9_0: "9.0",
  GRADE_8_5: "8.5",
  GRADE_8_0: "8.0",
  GRADE_7_5: "7.5",
  GRADE_7_0: "7.0",
  GRADE_6_5: "6.5",
  GRADE_6_0: "6.0",
  GRADE_5_5: "5.5",
  GRADE_5_0: "5.0",
  GRADE_4_5: "4.5",
  GRADE_4_0: "4.0",
  GRADE_3_5: "3.5",
  GRADE_3_0: "3.0",
  GRADE_2_5: "2.5",
  GRADE_2_0: "2.0",
  GRADE_1_8: "1.8",
  GRADE_1_5: "1.5",
  GRADE_1_0: "1.0",
  GRADE_0_5: "0.5",

  // String grades (1:1 correlation with numeric grades)
  GMT: "Gem Mint", // 10.0 equivalent
  MT: "Mint", // 9.9 equivalent
  NM_M: "NM/M", // 9.8 equivalent
  NM_PLUS: "NM+", // 9.6 equivalent
  NM: "NM", // 9.4 equivalent
  NM_MINUS: "NM-", // 9.2 equivalent
  VF_NM: "VF/NM", // 9.0 equivalent
  VF_PLUS: "VF+", // 8.5 equivalent
  VF: "VF", // 8.0 equivalent
  VF_MINUS: "VF-", // 7.5 equivalent
  F_VF: "F/VF", // 7.0 equivalent
  FN_PLUS: "FN+", // 6.5 equivalent
  FN: "FN", // 6.0 equivalent
  FN_MINUS: "FN-", // 5.5 equivalent
  VG_F: "VG/F", // 5.0 equivalent
  VG_PLUS: "VG+", // 4.5 equivalent
  VG: "VG", // 4.0 equivalent
  VG_MINUS: "VG-", // 3.5 equivalent
  GD_VG: "GD/VG", // 3.0 equivalent
  GD_PLUS: "GD+", // 2.5 equivalent
  GD: "GD", // 2.0 equivalent
  GD_MINUS: "GD-", // 1.8 equivalent
  FR_GD: "FR/GD", // 1.5 equivalent
  FR: "FR", // 1.0 equivalent
  PR: "PR", // 0.5 equivalent

  // Special conditions
  UNGRADED: "Ungraded",
  RESTORED: "Restored",
  QUALIFIED: "Qualified",
};

/**
 * Convert database grade enum to user-friendly display value
 */
export const formatGrade = (grade: string | null | undefined): string => {
  if (!grade) return "Ungraded";
  return GRADE_DISPLAY_MAP[grade] || grade;
};

/**
 * Convert user-friendly grade string back to database enum value
 */
export const parseGrade = (displayGrade: string): string | null => {
  if (!displayGrade) return null;

  // Find the enum key that maps to this display value
  const entry = Object.entries(GRADE_DISPLAY_MAP).find(
    ([_, displayValue]) => displayValue === displayGrade
  );

  return entry ? entry[0] : null;
};

/**
 * Get all available grade options for dropdowns/selects
 */
export const getGradeOptions = (): Array<{ value: string; label: string }> => {
  return Object.entries(GRADE_DISPLAY_MAP).map(([value, label]) => ({
    value,
    label,
  }));
};
