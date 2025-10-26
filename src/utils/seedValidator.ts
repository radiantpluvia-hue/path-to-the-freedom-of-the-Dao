import Ajv, { ValidateFunction } from 'ajv';
import itemSchema from '@/data/schemas/item.schema.json';
import manualSchema from '@/data/schemas/manual.schema.json';
import passiveSchema from '@/data/schemas/passive.schema.json';
import eventSchema from '@/data/schemas/event.schema.json';

const ajv = new Ajv({ allErrors: true, strict: false });

const validators: Record<string, ValidateFunction> = {
  items: ajv.compile(itemSchema as any),
  manuals: ajv.compile(manualSchema as any),
  passives: ajv.compile(passiveSchema as any),
  events: ajv.compile(eventSchema as any),
};

export function validateSeed(seed: any, kind: string): string[] {
  const v = validators[kind as keyof typeof validators];
  if (!v) return [`No schema for kind=${kind}`];
  const ok = v(seed);
  if (ok) return [];
  return (v.errors || []).map(e => `${e.instancePath} ${e.message}`);
}

export default validateSeed;
