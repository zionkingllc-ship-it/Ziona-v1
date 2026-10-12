// Gradient color constants
export const DEFAULT_GRADIENT_PRIMARY = "#C7EBCB";
export const DEFAULT_GRADIENT_SECONDARY = "#FFFFFF";

/**
 * Parses gradient colors from a comma-separated string
 * Returns [primary, secondary] tuple with fallback to defaults
 */
export const getGradientColors = (
  colorsParam?: string
): [string, string] => {
  if (!colorsParam) {
    return [DEFAULT_GRADIENT_PRIMARY, DEFAULT_GRADIENT_SECONDARY];
  }
  const parts = colorsParam.split(",");
  if (parts.length >= 2) {
    return [parts[0], parts[1]] as [string, string];
  }
  return [parts[0], DEFAULT_GRADIENT_SECONDARY] as [string, string];
};
