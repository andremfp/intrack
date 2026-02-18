import { describe, expect, it } from "vitest";

import { stableStringify } from "@/lib/query/stable-stringify";

describe("stableStringify", () => {
  describe("primitives", () => {
    it("serialises null to the JSON null string", () => {
      expect(stableStringify(null)).toBe("null");
    });

    it("serialises a number", () => {
      expect(stableStringify(42)).toBe("42");
    });

    it("serialises a string", () => {
      expect(stableStringify("hello")).toBe('"hello"');
    });

    it("serialises a boolean true", () => {
      expect(stableStringify(true)).toBe("true");
    });

    it("serialises a boolean false", () => {
      expect(stableStringify(false)).toBe("false");
    });
  });

  describe("arrays", () => {
    it("serialises a flat array", () => {
      expect(stableStringify([1, 2, 3])).toBe("[1,2,3]");
    });

    it("serialises an array containing objects with sorted keys", () => {
      const arr = [{ z: 1, a: 2 }, { b: 3 }];
      expect(stableStringify(arr)).toBe('[{"a":2,"z":1},{"b":3}]');
    });
  });

  describe("objects — key ordering", () => {
    it("sorts object keys alphabetically", () => {
      const obj = { z: 1, a: 2, m: 3 };
      expect(stableStringify(obj)).toBe('{"a":2,"m":3,"z":1}');
    });

    it("produces the same output regardless of property insertion order", () => {
      const obj1 = { filters: { status: "active", date: "2024-01" }, page: 1 };
      const obj2 = { page: 1, filters: { date: "2024-01", status: "active" } };
      expect(stableStringify(obj1)).toBe(stableStringify(obj2));
    });

    it("sorts keys recursively in nested objects", () => {
      const obj = { b: { z: 1, a: 2 }, a: { m: 3, c: 4 } };
      expect(stableStringify(obj)).toBe('{"a":{"c":4,"m":3},"b":{"a":2,"z":1}}');
    });
  });

  describe("circular references", () => {
    it("replaces a direct self-reference with [Circular]", () => {
      const obj: Record<string, unknown> = { a: 1 };
      obj.self = obj;
      const result = stableStringify(obj);
      expect(result).toContain('"[Circular]"');
    });

    it("does not throw on circular reference", () => {
      const obj: Record<string, unknown> = {};
      obj.loop = obj;
      expect(() => stableStringify(obj)).not.toThrow();
    });
  });

  describe("shared (non-circular) references", () => {
    it("serialises shared objects in both positions without [Circular]", () => {
      const shared = { value: "shared" };
      const obj = { a: shared, b: shared };
      const result = stableStringify(obj);
      expect(result).toBe('{"a":{"value":"shared"},"b":{"value":"shared"}}');
    });
  });

  describe("non-serialisable values", () => {
    it("omits function-valued properties", () => {
      const obj = { a: 1, fn: () => "hello", b: 2 };
      expect(stableStringify(obj)).toBe('{"a":1,"b":2}');
    });

    it("omits symbol-valued properties", () => {
      const sym = Symbol("test");
      const obj: Record<string | symbol, unknown> = { a: 1, b: 2 };
      obj.s = sym;
      // Symbol keys are not enumerated by Object.keys, so test symbol *values*
      const objWithSymValue: Record<string, unknown> = { a: 1, s: sym, b: 2 };
      expect(stableStringify(objWithSymValue)).toBe('{"a":1,"b":2}');
    });
  });
});
