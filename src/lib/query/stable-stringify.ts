/**
 * Deterministic JSON stringify for React Query keys
 *
 * Ensures consistent key generation regardless of object property order.
 * This prevents cache misses due to non-deterministic serialization.
 */
export function stableStringify(obj: unknown): string {
  if (obj === null || obj === undefined) {
    return JSON.stringify(obj);
  }

  if (typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return JSON.stringify(obj.map(stableStringify));
  }

  // For objects, sort keys alphabetically
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj: Record<string, unknown> = {};

  for (const key of sortedKeys) {
    sortedObj[key] = (obj as Record<string, unknown>)[key];
  }

  return JSON.stringify(sortedObj, (_key, value) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Recursively sort nested objects
      const nestedSortedKeys = Object.keys(value).sort();
      const nestedSortedObj: Record<string, unknown> = {};
      for (const nestedKey of nestedSortedKeys) {
        nestedSortedObj[nestedKey] = value[nestedKey as keyof typeof value];
      }
      return nestedSortedObj;
    }
    return value;
  });
}
