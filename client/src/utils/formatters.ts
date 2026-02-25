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
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
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
