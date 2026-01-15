/**
 * Deterministic JSON stringify for React Query keys
 *
 * Ensures consistent key generation regardless of object property order.
 * This prevents cache misses due to non-deterministic serialization.
 * Handles circular references and non-serializable values safely.
 */
export function stableStringify(obj: unknown): string {
  // Track objects in the current serialization path to detect true circular references
  // Using a Set to track the current path (stack-based approach)
  const path = new Set<object>();

  function serialize(value: unknown): unknown {
    // Handle primitives and null
    if (value === null || value === undefined) {
      return value;
    }

    // Handle non-object types
    if (typeof value !== "object") {
      return value;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(serialize);
    }

    // Check for circular reference in current path
    if (path.has(value)) {
      // True circular reference detected - return placeholder to prevent infinite loop
      return "[Circular]";
    }

    // Add to current path
    path.add(value);

    try {
      // For objects, sort keys alphabetically
      const sortedKeys = Object.keys(value).sort();
      const sortedObj: Record<string, unknown> = {};

      for (const key of sortedKeys) {
        const val = (value as Record<string, unknown>)[key];
        // Skip non-serializable values (functions, symbols, etc.)
        if (typeof val === "function" || typeof val === "symbol") {
          continue;
        }
        // Recursively serialize nested values
        sortedObj[key] = serialize(val);
      }

      return sortedObj;
    } catch (error) {
      // If serialization fails for this object, return error placeholder
      console.warn("stableStringify: failed to serialize object:", error);
      return "[SerializationError]";
    } finally {
      // Remove from path after processing (allows shared references to work)
      path.delete(value);
    }
  }

  try {
    return JSON.stringify(serialize(obj));
  } catch (error) {
    // Fallback: if serialization fails completely, return a stable error representation
    console.warn("stableStringify failed:", error);
    return JSON.stringify({ error: "Serialization failed" });
  }
}
