export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export function toSafeNumber(value: any, fallback: number = 0): number {
  if (isValidNumber(value)) return value as number;
  const coerced = Number(value);
  return isValidNumber(coerced) ? coerced : fallback;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
