// /engine/ChartTypes.js
/**
 * Supported chart types and timeframes.
 * @module ChartTypes
 */

export const ChartTypes = {
  CANDLE: "candle",
  LINE: "line",
  AREA: "area",
  HEIKIN_ASHI: "heikin-ashi",
  RENKO: "renko",
  BASELINE: "baseline",
  HOLLOW_CANDLE: "hollow-candle",
  OHLC: "ohlc"
};

export const Timeframes = {
  M1: "1m",
  M5: "5m",
  H1: "1h",
  D1: "1d",
  W1: "1w"
};

export const DEFAULT_CHART_TYPE = ChartTypes.CANDLE;

/**
 * Validate if a chart type is supported.
 * @param {string} type - Chart type to validate.
 * @returns {boolean} True if valid.
 */
export function validateType(type) {
  return Object.values(ChartTypes).includes(type);
}

/**
 * Validate if a timeframe is supported.
 * @param {string} tf - Timeframe to validate.
 * @returns {boolean} True if valid.
 */
export function validateTimeframe(tf) {
  return Object.values(Timeframes).includes(tf);
}