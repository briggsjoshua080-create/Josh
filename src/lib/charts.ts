import {
  Chart,
  CategoryScale,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
} from "chart.js";

export { resolveToken, resolveScoreColor } from "./cssTokens";

// One-time registration of the only Chart.js pieces the app uses (radar +
// area line). Tooltips are custom/disabled, legends are custom HTML.
Chart.register(RadialLinearScale, LinearScale, CategoryScale, PointElement, LineElement, Filler);

Chart.defaults.font.family =
  getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() ||
  "system-ui, sans-serif";
