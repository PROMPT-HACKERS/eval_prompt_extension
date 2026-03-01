// Color Palette
const PALETTE = [
  '#ef4444', '#3b82f6', '#22c55e',
  '#f59e0b', '#a855f7', '#06b6d4',
];

const NUM_AXES = 6;
const ANGLE_OFFSET = -Math.PI / 2;
const DEBOUNCE_MS = 700;

function scoreColor(score) {
  if (score >= 71) return '#22c55e';  // green
  if (score >= 41) return '#f59e0b';  // amber
  return '#ef4444';                    // red
}
