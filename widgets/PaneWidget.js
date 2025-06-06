// /widgets/PaneWidget.js

export class PaneWidget {
  constructor(container, width = 80, height = 30, axis = "price") {
    this.container = container
    this.canvas = document.createElement("canvas")
    this.canvas.className = `pane-${axis}-canvas`
    this.canvas.width = width * window.devicePixelRatio
    this.canvas.height = height * window.devicePixelRatio
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.ctx = this.canvas.getContext("2d")

    this.axis = axis
    this.container.appendChild(this.canvas)
  }

  drawTicks(ticks) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.font = `${12 * window.devicePixelRatio}px sans-serif`
    this.ctx.fillStyle = "#AAA"
    this.ctx.textAlign = this.axis === "price" ? "right" : "center"
    this.ctx.textBaseline = "middle"

    for (const tick of ticks) {
      if (this.axis === "price") {
        const y = tick.y * window.devicePixelRatio
        this.ctx.fillText(tick.label, this.canvas.width - 8, y)
      } else {
        const x = tick.x * window.devicePixelRatio
        this.ctx.fillText(tick.label, x, this.canvas.height / 2)
      }
    }
  }

  destroy() {
    this.container.removeChild(this.canvas)
  }
}