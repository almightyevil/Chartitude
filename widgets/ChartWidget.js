// /widgets/ChartWidget.js
import { ChartEngineCore } from "../engine/ChartEngineCore.js"

export class ChartWidget {
  constructor(container, options = {}) {
    this.container = container
    this.canvas = document.createElement("canvas")
    this.canvas.className = "chart-canvas"
    this.container.appendChild(this.canvas)

    this.chart = new ChartEngineCore(this.canvas, options)
    this.resizeObserver = new ResizeObserver(() => this.chart.resize())
    this.resizeObserver.observe(this.container)
  }

  loadData(candles) {
    this.chart.load(candles)
    this.chart.render()
  }

  setZoom(level) {
    this.chart.setZoom(level)
    this.chart.render()
  }

  pan(delta) {
    this.chart.pan(delta)
    this.chart.render()
  }

  destroy() {
    this.resizeObserver.disconnect()
    this.container.removeChild(this.canvas)
  }
}