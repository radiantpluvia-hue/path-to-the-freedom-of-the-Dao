import { TIER_METADATA } from './tier';

export function getTierBase(t: string): string {
  if (!t) return '';
  return String(t).replace(/[+-]$/, '');
}

export function tierFriendlyName(t: string): string {
  const base = getTierBase(t);
  const meta = (TIER_METADATA as any)[base] || { name: base };
  if (String(t).endsWith('+')) return `High ${meta.name}`;
  if (String(t).endsWith('-')) return `Low ${meta.name}`;
  return meta.name;
}

export function tierFullLabel(t: string): string {
  const base = getTierBase(t);
  const subtitle = ((TIER_METADATA as any)[base] && (TIER_METADATA as any)[base].subtitle) || `${base} Tier`;
  return `${t} — ${tierFriendlyName(t)}${subtitle ? ` (${subtitle})` : ''}`;
}
