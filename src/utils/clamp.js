export default function clamp(x, min, max) {
  return Math.min(Math.max(x, min), max);
}