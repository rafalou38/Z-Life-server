export function isString(v: unknown): v is string {
  return v instanceof String;
}
