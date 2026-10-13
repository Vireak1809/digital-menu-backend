import { Decimal } from '@prisma/client/runtime/library';

/** Recursively converts Prisma Decimal -> number and Date -> ISO string. */
export function serialize<T>(value: T): any {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (Decimal.isDecimal(value)) return (value as Decimal).toNumber();
  if (Array.isArray(value)) return value.map(serialize);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = serialize(v);
    return out;
  }
  return value;
}