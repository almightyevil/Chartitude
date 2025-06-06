// /engine/ChartState.js
import { Timeframes } from "./ChartTypes.js";

/**
 * Centralized state management for chart data and configuration.
 * @class
 */
export class ChartState {
  constructor() {
    this.candles = [];
    this.symbol = null;
    this.timeframe = Timeframes.D1;
    this.lastUpdated = null;
  }

  /**
   * Validate and set candle data.
   * @param {Array} data - Candlestick data.
   */
  setCandles(data) {
    if (!Array.isArray(data)) {
      throw new TypeError("Candles must be an array.");
    }
    this.candles = data.map(c => ({
      time: c.time || Date.now(),
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close)
    }));
    this.lastUpdated = Date.now();
  }

  /** Get visible candles based on current range. */
  getVisibleCandles() {
    return this.candles;
  }

  /**
   * Set symbol with validation.
   * @param {string} symbol - Trading symbol (e.g., 'BTC/USD').
   */
  setSymbol(symbol) {
    if (typeof symbol !== "string") {
      throw new TypeError("Symbol must be a string.");
    }
    this.symbol = symbol;
  }

  /**
   * Set timeframe with validation.
   * @param {string} timeframe - Timeframe (e.g., '1D').
   */
  setTimeframe(timeframe) {
    if (!Object.values(Timeframes).includes(timeframe)) {
      throw new Error(`Invalid timeframe: ${timeframe}`);
    }
    this.timeframe = timeframe;
  }

  /** Reset to initial state. */
  reset() {
    this.candles = [];
    this.symbol = null;
    this.timeframe = Timeframes.D1;
  }
}