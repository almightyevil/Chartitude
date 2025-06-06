// /engine/ChartEngineCore.js
import FractalCanvasRenderer from "./FractalCanvasRenderer.js";
import { ChartState } from "./ChartState.js";
import { ChartTypes, DEFAULT_CHART_TYPE, validateType } from "./ChartTypes.js";

/**
 * Core chart engine handling rendering, state, and user interactions.
 * @class
 */
export class ChartEngineCore {
  /**
   * @param {HTMLCanvasElement} canvas - Target canvas element.
   * @param {Object} [options={}] - Engine configuration.
   * @param {string} [options.chartType] - Default chart type (e.g., 'candle').
   * @param {number} [options.candleWidth] - Width of candles in pixels.
   */
  constructor(canvas, options = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new TypeError("Invalid canvas element.");
    }

    this.canvas = canvas;
    this.state = new ChartState();
    this.renderer = new FractalCanvasRenderer(canvas, {
      chartType: validateType(options.chartType) ? options.chartType : DEFAULT_CHART_TYPE,
      ...options
    });
    this.zoom = 1;
    this.offset = 0;
    this.eventListeners = new Map();
  }

  /**
   * Load candle data and auto-render.
   * @param {Array<{open: number, high: number, low: number, close: number}>} candles - Financial data.
   */
  load(candles) {
    this.state.setCandles(candles);
    this.renderer.setData(this.state.getCandles());
    this.render();
  }

  /**
   * Set zoom level (0.1x to 10x).
   * @param {number} zoomLevel - Zoom multiplier.
   */
  setZoom(zoomLevel) {
    this.zoom = Math.max(0.1, Math.min(Number(zoomLevel), 10));
    this.renderer.setZoom(this.zoom);
    this._emit("zoom", { zoom: this.zoom });
    this.render();
  }

  /**
   * Pan the chart horizontally.
   * @param {number} offsetDelta - Pixel delta to pan.
   */
  pan(offsetDelta) {
    this.offset += Number(offsetDelta);
    this.renderer.pan(this.offset);
    this._emit("pan", { offset: this.offset });
    this.render();
  }

  /** Resize canvas to container dimensions. */
  resize() {
    this.renderer.resize();
    this.render();
  }

  /** Trigger a re-render. */
  render() {
    requestAnimationFrame(() => this.renderer.render());
  }

  /**
   * Change chart type dynamically.
   * @param {keyof ChartTypes} type - Chart type (e.g., 'line').
   */
  setChartType(type) {
    if (!validateType(type)) {
      throw new Error(`Invalid chart type: ${type}`);
    }
    this.renderer.setChartType(type);
    this.render();
  }

  /**
   * Add event listener.
   * @param {string} event - Event name ('zoom', 'pan').
   * @param {Function} callback - Callback function.
   */
  on(event, callback) {
    this.eventListeners.set(event, callback);
  }

  /** @private */
  _emit(event, data) {
    this.eventListeners.get(event)?.(data);
  }
}