// demo.js
import { ChartEngineCore } from "./engine/ChartEngineCore.js";

// Initialize
const canvas = document.getElementById("chart");
const engine = new ChartEngineCore(canvas, {
  chartType: "candle", // Try "line" or "area"
  candleWidth: 10,
  colors: {
    up: "#26a69a", // Green for bullish
    down: "#ef5350", // Red for bearish
    bg: "#454545"   // Dark background
  }
});

// Load sample data (mock candles)
const mockCandles = [];
let lastClose = 100;

for (let i = 0; i < 500; i++) {
  const open = lastClose;
  const high = open + Math.random() * 10;
  const low = open - Math.random() * 8;
  const close = low + Math.random() * (high - low);
  mockCandles.push({ open, high, low, close });
  lastClose = close;
}

engine.load(mockCandles);

// Add interactivity
let isDragging = false;
let lastX = 0;

canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  lastX = e.clientX;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const dx = e.clientX - lastX;
    engine.pan(-dx * 0.5); // Pan speed multiplier
    lastX = e.clientX;
  }
});

canvas.addEventListener("mouseup", () => (isDragging = false));
canvas.addEventListener("mouseleave", () => (isDragging = false));

// Zoom with mouse wheel
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomDelta = e.deltaY > 0 ? 0.8 : 1.2; // Zoom out/in
  engine.setZoom(engine.zoom * zoomDelta);
});

// Resize on window change
window.addEventListener("resize", () => engine.resize());