// /engine/FractalCanvasRenderer.js
import { ChartTypes } from "./ChartTypes.js";

/**
 * High-performance canvas renderer with LOD support.
 * @class
 */
export default class FractalCanvasRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { willReadFrequently: true });
    this.dpr = window.devicePixelRatio || 1;
    this.options = {
      candleWidth: 8,
      spacing: 2,
      paddingTop: 30,
      paddingBottom: 30,
      maxLOD: 5,
      chartType: ChartTypes.CANDLE,
      colors: {
        up: "#26a69a",
        down: "#ef5350",
        line: "#2196f3",
        area: "rgba(5, 1, 1, 0.36)",
        bg: "#121826"
      },
      ...options
    };
    this.candles = [];
    this.viewport = { start: 0, end: 0 };
    this.zoom = 1;
    this.offset = 0;
    this.metricsCache = null;
    this._setupCanvas();
  }

  /** Initialize canvas dimensions. */
  _setupCanvas() {
    const { width, height } = this.canvas.getBoundingClientRect();
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
  }

  /** Update data and clear cache. */
  setData(candles) {
    this.candles = candles;
    this.metricsCache = null;
    this._updateViewport();
  }

  /** Change chart type and re-render. */
  setChartType(type) {
    this.options.chartType = type;
    this.metricsCache = null;
  }

  /** Update visible range based on zoom/offset. */
  _updateViewport() {
    const { candleWidth, spacing } = this.options;
    const visibleCount = Math.floor(
      this.canvas.width / ((candleWidth + spacing) * this.zoom)
    );
    this.viewport.start = Math.max(0, Math.floor(this.offset));
    this.viewport.end = Math.min(
      this.candles.length,
      this.viewport.start + visibleCount
    );
    this.metricsCache = null;
  }

  /** Calculate price-to-pixel metrics. */
  _calculateMetrics() {
    if (this.metricsCache) return this.metricsCache;

    const visible = this.candles.slice(this.viewport.start, this.viewport.end);
    if (visible.length === 0) return {};

    const { paddingTop, paddingBottom } = this.options;
    const maxHigh = visible.reduce((max, c) => Math.max(max, c.high), -Infinity);
    const minLow = visible.reduce((min, c) => Math.min(min, c.low), Infinity);
    const priceRange = maxHigh - minLow || 1; // Avoid division by zero
    const pxPerPrice = (this.canvas.height - paddingTop - paddingBottom) / priceRange;

    this.metricsCache = {
      visible,
      maxHigh,
      minLow,
      pxPerPrice,
      paddingTop,
      paddingBottom
    };
    return this.metricsCache;
  }

  /** Main render loop. */
  render() {
    const { ctx } = this;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    // Clear canvas
    ctx.fillStyle = this.options.colors.bg;
    ctx.fillRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);

    // Skip if no data
    if (this.candles.length === 0) {
      ctx.restore();
      return;
    }

    // Delegate to chart-type-specific renderer
    switch (this.options.chartType) {
      case ChartTypes.CANDLE:
        this._renderCandles();
        break;
      case ChartTypes.LINE:
        this._renderLine();
        break;
      case ChartTypes.AREA:
        this._renderArea();
        break;
      default:
        console.warn(`Unsupported chart type: ${this.options.chartType}`);
    }

    ctx.restore();
  }

  /** Render candlestick chart. */
  _renderCandles() {
    const { ctx, options } = this;
    const { candleWidth, spacing, colors } = options;
    const metrics = this._calculateMetrics();
    if (!metrics.visible) return;

    const { visible, minLow, pxPerPrice, paddingBottom } = metrics;
    const lod = this._calculateLOD();

    for (let i = 0; i < visible.length; i += lod) {
      const group = visible.slice(i, i + lod);
      const first = group[0];
      const last = group[group.length - 1];
      const open = first.open;
      const close = last.close;
      const high = group.reduce((h, c) => Math.max(h, c.high), -Infinity);
      const low = group.reduce((l, c) => Math.min(l, c.low), Infinity);

      const x = i * (candleWidth + spacing) * this.zoom;
      const yHigh = this._priceToY(high, minLow, pxPerPrice, paddingBottom);
      const yLow = this._priceToY(low, minLow, pxPerPrice, paddingBottom);
      const yOpen = this._priceToY(open, minLow, pxPerPrice, paddingBottom);
      const yClose = this._priceToY(close, minLow, pxPerPrice, paddingBottom);

      // Wick
      ctx.strokeStyle = close >= open ? colors.up : colors.down;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, yHigh);
      ctx.lineTo(x + candleWidth / 2, yLow);
      ctx.stroke();

      // Body
      ctx.fillStyle = close >= open ? colors.up : colors.down;
      const bodyHeight = Math.max(1, Math.abs(yOpen - yClose));
      ctx.fillRect(x, Math.min(yOpen, yClose), candleWidth, bodyHeight);
    }
  }

  /** Render line chart. */
  _renderLine() {
    const { ctx, options } = this;
    const { colors } = options;
    const metrics = this._calculateMetrics();
    if (!metrics.visible) return;

    const { visible, minLow, pxPerPrice, paddingBottom } = metrics;
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 2;
    ctx.beginPath();

    visible.forEach((candle, i) => {
      const x = i * (options.candleWidth + options.spacing) * this.zoom;
      const y = this._priceToY(candle.close, minLow, pxPerPrice, paddingBottom);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    ctx.stroke();
  }

  /** Render area chart. */
  _renderArea() {
    this._renderLine(); // Reuse line path
    const { ctx, options } = this;
    const metrics = this._calculateMetrics();
    if (!metrics.visible) return;

    const { visible, paddingBottom } = metrics;
    const lastX = (visible.length - 1) * (options.candleWidth + options.spacing) * this.zoom;
    const baseY = this.canvas.height - paddingBottom;

    ctx.fillStyle = options.colors.area;
    ctx.lineTo(lastX, baseY);
    ctx.lineTo(0, baseY);
    ctx.closePath();
    ctx.fill();
  }

  /** Convert price to canvas Y-coordinate. */
  _priceToY(price, minLow, pxPerPrice, paddingBottom) {
    return (this.canvas.height - paddingBottom) - (price - minLow) * pxPerPrice;
  }

  /** Calculate Level of Detail (LOD) based on zoom. */
  _calculateLOD() {
    const { maxLOD } = this.options;
    const pxPerCandle = this.canvas.width / (this.viewport.end - this.viewport.start);
    return Math.min(maxLOD, Math.max(1, Math.floor(3 / pxPerCandle)));
  }
}