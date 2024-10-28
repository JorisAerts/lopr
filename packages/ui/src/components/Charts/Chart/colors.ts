export const defaultColors = [
  //
  '#3178c6',
  '#7FE77E',
  '#e10032',
  '#e59500',
  '#aa00aa',
  '#00aaaa',
].map((c) => `lch(from ${c} l c h / var(--chart-area-opacity))`)
