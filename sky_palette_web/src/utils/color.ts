export interface ColorRgb {
  r: number;
  g: number;
  b: number;
}
export function findColorDifference(
  color1: ColorRgb,
  color2: ColorRgb
): number {
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
      Math.pow(color1.g - color2.g, 2) +
      Math.pow(color1.b - color2.b, 2)
  );
}
